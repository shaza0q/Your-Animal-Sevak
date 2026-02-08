const Animal = require('../models/animal')
const AnimalUpdate = require('../models/animalUpdate')
const BreedMaster = require('../models/breedMaster')
const UpdateAnimal = require('../models/animalUpdate')
const multer = require('multer')
const cloudinary = require('cloudinary').v2
const fs = require('fs')
const dotenv = require('dotenv')
const { getAnimalOverviewByFarm } = require('../services/animalOverview.service')
const { getAnimalsByType, getAnimalDetail, getAnimalHistory, searchAnimal, getAnimalAbstractData } = require('../services/animal.service')
dotenv.config()

const upload = multer({dest: "uploads/"})

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const addAnimalData = async (req, res) => {
    const userId = req.user.id;
    const {
        farmId,
        tagNumber,
        name,
        animalType,
        motherId,
        fatherId,
        otherAnimalType,
        breed,
        gender,
        weight,
        dateOfBirth,
        acquisitionDate
    } = req.body;

    let generation = 1;
    let finalAnimalType = animalType === 'other' ? otherAnimalType : animalType;

    try {
        // Check if animal tag already exists
        const existingAnimal = await Animal.findOne({ tagNumber });
        if (existingAnimal) {
            return res.status(409).json({ message: "Animal Id already exists" });
        }

        let motherRef, fatherRef;

        // ✅ Find mother ObjectId using her tag number
        if (motherId && motherId.trim() !== "") {
            const mother = await Animal.findOne({ tagNumber: motherId });
            if (!mother && mother.gender != 'Female') {
                return res.status(404).json({ message: "Mother with given tag not found in that breed" });
            }
            motherRef = mother._id;
            generation = mother.generation + 1; // increment generation
        }

        // ✅ Find father ObjectId using his tag number
        if (fatherId && fatherId.trim() !== "") {
            const father = await Animal.findOne({ tagNumber: fatherId });
            if (!father && father.gender != 'Male') {
                return res.status(404).json({ message: "Father with given tag not found in that breed" });
            }
            fatherRef = father._id;
        }

        // Create new animal with ObjectId references
        const animal = new Animal({
            tagNumber,
            name,
            farmId,
            animalType: finalAnimalType,
            breed,
            gender,
            motherId: motherRef,
            fatherId: fatherRef,
            generation,
            weight,
            dateOfBirth,
            acquisitionDate
        });
        
        
        const animalUpdate = new AnimalUpdate({
          animalId: animal._id,
          weight: weight,
          staffId: userId,
          updateType: "Health",
          status: "Healthy"
        })
        
        await animalUpdate.save();
        await animal.save();

        return res.status(201).json({ message: "Animal added successfully" });

    } catch (err) {
        console.error("Registration error: ", err);
        res.status(500).json({ message: "An internal server error occurred" });
    }
};

const updateAnimalData = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      animalId,           // tag number from frontend
      date,
      updateType,
      status: incomingStatus, // ONLY allowed for Health
      weight,
      notes,
      riskLevel,
      vaccineName,
      diseaseName,
      maleAnimalId,
      expectedDeliveryDate,
      nextVaccineDate,
      price,
      buyerName,
      buyerEmail,
      buyerContact,
      buyerAddress,
    } = req.body;

    console.log("Received request body:", req.body);

    /* ─────────────────────────────
       1️⃣ Find animal by tag number or ObjectId
    ───────────────────────────── */
    let animalData;
    
    // Try to find by tag number first (most common case)
    animalData = await Animal.findOne({ tagNumber: animalId });
    
    // If not found and animalId looks like ObjectId, try by _id
    if (!animalData && /^[0-9a-fA-F]{24}$/.test(animalId)) {
      animalData = await Animal.findById(animalId);
    }
    
    if (!animalData) {
      return res.status(404).json({ message: "Animal not found" });
    }

    console.log("---------------------1");
    /* ─────────────────────────────
       2️⃣ Block terminal animals
    ───────────────────────────── */
    if (["Sold", "Deceased"].includes(animalData.status)) {
      return res.status(400).json({
        message: `Cannot update a ${animalData.status} animal`,
      });
    }


    /* ─────────────────────────────
       3️⃣ Fetch last update (for inheritance)
    ───────────────────────────── */
    const lastUpdate = await UpdateAnimal
      .findOne({ animalId: animalData._id })
      .sort({ createdAt: -1 });

    const lastStatus = lastUpdate?.status || "Healthy";

    /* ─────────────────────────────
       4️⃣ Derive final status
    ───────────────────────────── */
    let finalStatus;

    switch (updateType) {
      case "Health":
        if (!incomingStatus) {
          return res.status(400).json({
            message: "Status is required for Health update",
          });
        }
        finalStatus = incomingStatus;
        break;

      case "Weight":
      case "Vaccination":
        finalStatus = lastStatus; // inherit
        break;

      case "Breeding":
        finalStatus = "Pregnant";
        break;

      case "Sale":
        finalStatus = "Sold";
        break;

      default:
        return res.status(400).json({ message: "Invalid updateType" });
    }

    /* ─────────────────────────────
       5️⃣ Build update payload (clean)
    ───────────────────────────── */
    const updateData = {
      animalId: animalData._id,
      staffId: userId,
      date,
      updateType,
      status: finalStatus,

      weight,
      notes,
      riskLevel,
      vaccineName,
      diseaseName,
      maleAnimalId,
      expectedDeliveryDate,
      nextVaccineDate,
      price,
      buyerName,
      buyerEmail,
      buyerContact,
      buyerAddress,
    };

    // Remove undefined / empty fields
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined || updateData[key] === "") {
        delete updateData[key];
      }
    });

    
    console.log("---------------------2");
    /* ─────────────────────────────
       6️⃣ Image upload (optional)
    ───────────────────────────── */
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "animalPhotos",
      });

      updateData.mediaUrl = result.secure_url;
      fs.unlinkSync(req.file.path);
    }

    
    console.log("Update data:", updateData);
    console.log("---------------------3");
    /* ─────────────────────────────
       7️⃣ Save update event
    ───────────────────────────── */
    const animalUpdate = await AnimalUpdate.create(updateData);
    
    console.log("Created update:", animalUpdate);

    
    console.log("---------------------4");
    /* ─────────────────────────────
       8️⃣ Sync animal lifecycle snapshot
    ───────────────────────────── */
    if (updateType === "Sale") {
      animalData.status = "Sold";
      await animalData.save();
    }

    
    console.log("---------------------5");
    if (updateType === "Health" && finalStatus === "Dead") {
      animalData.status = "Deceased";
      await animalData.save();
    }

    /* ─────────────────────────────
       9️⃣ Response
    ───────────────────────────── */
    return res.status(201).json({
      message: "Animal update recorded successfully",
      data: animalUpdate,
    });

  } catch (err) {
    console.error("Error updating animal", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getAnimalOverview = async(req, res) => {
  try{
    const { farmId } = req.params;
    const { state } = req.query;
    if (!farmId) {
      return res.status(400).json({ message: "farmId is required" });
    }

    const data = await getAnimalOverviewByFarm(farmId, state);

    return res.json(data);
  } catch (error) {
    console.error("Animal overview error:", error);
    return res
      .status(500)
      .json({ message: "Failed to fetch animal overview" });
  }
}

async function listAnimalsByType(req, res) {
  try {
    const { farmId } = req.params;
    const {
      type,
      page = 1,
      limit = 12,
      assigned,
      gender,
      breed,
      caretakerName,
      vetName,
      status = "Active",
    } = req.query;

    if (!type) {
      return res.status(400).json({ message: "animal type is required" });
    }

    const data = await getAnimalsByType({
      farmId,
      type,
      page: Number(page),
      limit: Number(limit),
      assigned,
      gender,
      breed,
      caretakerName,
      vetName,
      status,
    });

    return res.json(data);
  } catch (err) {
    console.error("Failed to list animals", err);
    return res.status(500).json({ message: "Failed to fetch animals" });
  }
}

const getAnimalDetailController = async(req, res) => {
  try{
    const { farmId, animalId } = req.params;
  
    const animalData = await getAnimalDetail({ 
      farmId, 
      animalId 
    });

    if(!animalData){
      return res.status(404).json({ message: "Animal not found" });
    }
  
    console.log("----------------Animal detail:", animalData);
    return res.json(animalData);
  } catch (error) {
    console.error("Animal detail error:", error);
    return res
      .status(500)
      .json({ message: "Failed to fetch animal detail" });
  }
}

const getAnimalHistoryController = async (req, res) => {
  try {
    const { animalId } = req.params;
    const { page = 1, limit = 5 } = req.query;

    const animalHistory = await getAnimalHistory({
      animalId,
      page: parseInt(page),
      limit: parseInt(limit)
    })

    if (!animalHistory) {
      return res.status(404).json({ message: "Animal not found" });
    }

    console.log("----------------Animal history:", animalHistory);
    return res.json(animalHistory);

  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to fetch animal history" })
  }
}

const searchAnimalController = async (req, res) => {
  try {
    console.log('-----------------------controller animal query', req.query);
    const { q, animalType, breed, gender, excludeAnimalIds } = req.query;
    
    // Get farmId from farmUser collection
    const FarmUser = require('../models/farmUser');
    const userId = req.user.id || req.user._id;
    
    const farmUser = await FarmUser.findOne({ userId });
    if (!farmUser) {
      return res.status(403).json({ message: "User not associated with any farm" });
    }
    
    const farmId = farmUser.farmId;
    console.log('----- found farmId:', farmId);

    const animals = await searchAnimal({
      farmId,
      q: q || '',
      animalType,
      breed,
      gender,
      excludeAnimalIds: excludeAnimalIds ? excludeAnimalIds.split(',') : []
    });

    res.json({
      success: true,
      data: animals,
      count: animals.length
    });
  } catch (error) {
    console.error('Error searching animals:', error);
    res.status(500).json({
      success: false,
      message: "Failed to search animals"
    });
  }
}

const getAnimalAbstract = async (req, res) => {
  try {
    const { animalId } = req.params;

    console.log('----------animalId', animalId);
    
    if (!animalId) {
      return res.status(400).json({ message: "animalId is required" });
    }

    const animalData = await getAnimalAbstractData(animalId);
    
    if (!animalData) {
      return res.status(404).json({ message: "Animal not found" });
    }
    
    console.log('----- getAnimalAbstractData result:', animalData);
    return res.json({
      success: true,
      data: animalData
    });
  } catch (error) {
    console.error('Error fetching animal abstract data:', error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch animal data"
    });
  }
}

module.exports = {
  addAnimalData,
  updateAnimalData,
  upload,
  getAnimalOverview,
  listAnimalsByType,
  getAnimalDetailController,
  getAnimalHistoryController,
  searchAnimalController,
  getAnimalAbstract
};