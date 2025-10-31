const breedMaster = require('../models/breedMaster');
const diseaseMaster = require('../models/diseaseMaster');
const vaccineMaster = require('../models/vaccineMaster');


const getDiseaseData = async(req,res)=>{
    try {
        const disease = await diseaseMaster.find();
        res.status(200).json(disease);

    } catch (err) {

        console.error("Error fetching breeds:", err);
        res.status(500).json({ message: "Internal server error" });
    }
}


const getVaccineData = async(req,res)=>{
    try {
        const vaccine = await vaccineMaster.find();
        res.status(200).json(vaccine);

    } catch (err) {

        console.error("Error fetching breeds:", err);
        res.status(500).json({ message: "Internal server error" });
    }
}


const getBreedData = async(req,res)=>{
    try {
        const breed = await breedMaster.find();
        res.status(200).json(breed);

    } catch (err) {

        console.error("Error fetching breeds:", err);
        res.status(500).json({ message: "Internal server error" });
    }
}


module.exports = {
    getDiseaseData,
    getVaccineData,
    getBreedData
}
