const Animal = require('../models/animal')
const AnimalUpdate = require('../models/animalUpdate')
const BreedMaster = require('../models/breedMaster')
const UpdateAnimal = require('../models/animalUpdate')
const multer = require('multer')
const cloudinary = require('cloudinary').v2
const fs = require('fs')
const dotenv = require('dotenv')
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

        // ✅ Create new animal with ObjectId references
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

        
        await animal.save();
        
        const animalUpdate = new AnimalUpdate({
            animalId: animal._id,
            weight: weight,
            staffId: userId,
        })

        await animalUpdate.save();

        return res.status(201).json({ message: "Animal added successfully" });

    } catch (err) {
        console.error("Registration error: ", err);
        res.status(500).json({ message: "An internal server error occurred" });
    }
};

const updateAnimalData = async(req, res) => {
    try {

        let imageUrl = null;
        const userId = req.user.id

        const {
            animalId,
            date,
            weight,
            notes,
            status,
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

        
        // console.log(tagNumber)

        const animalData = await Animal.findOne({tagNumber: animalId})
        
        if(!animalData){
            return res.status(404).json({message: "Animal TagNumber not found"});
        }

        const updateData = {};

        // Loop through each key dynamically to avoid manual repetition
        for (const [key, value] of Object.entries(req.body)) {
            if (
                value !== undefined && 
                value !== null && 
                value !== '' // ignore empty strings
            ) {
                updateData[key] = value;
            }
        }

        
        updateData.staffId = userId
        updateData.animalId = animalData._id;

        if(req.file){
            const filePath = req.file.path;
    
            const result = await cloudinary.uploader.upload(filePath, {
                folder: "animalPhotos", // optional folder name
            });

            imageUrl = result.secure_url

            updateData.mediaUrl = imageUrl
            
            fs.unlinkSync(filePath)
        }


        console.log(updateData);

        const animalUpdate = new UpdateAnimal(updateData)
        await animalUpdate.save()

        return res.status(201).json({message: "Animal update recorded successfully", data: animalData})

    }
    catch(err){
        console.error("Error updating animal", err);
        return res.status(500).json({ message: "Internal server error" });
    }
}

module.exports = {
    addAnimalData,
    updateAnimalData,
    upload
};