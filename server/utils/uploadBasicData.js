const fs = require("fs")
const mongoose = require("mongoose")
const dotenv = require("dotenv")

const BreedMaster = require("../models/breedMaster")
const VaccineMaster = require("../models/vaccineMaster")
const DiseaseMaster = require("../models/diseaseMaster")

dotenv.config()

const fillBreedData = async() => {
    try{
        await mongoose.connect(process.env.MONGO_URL)

        const data = JSON.parse(fs.readFileSync("../breedAnimal.json", "utf-8"));

        const insertData = [];

        for(const item of data){
            const {type, breeds} = item;

            breeds.forEach((b) => {
                insertData.push({animalType: type, breedName: b})
            })
        }

        await BreedMaster.insertMany(insertData)
        console.log("Succesfully inserted the breeds")
        mongoose.connection.close();
    }
    catch(err){
        console.log("Error: ", err)
        mongoose.connection.close()
    }
}

// fillBreedData()

const fillVaccineData = async() => {
    try{
        await mongoose.connect(process.env.MONGO_URL)

        const data = JSON.parse(fs.readFileSync("../vaccineAnimal.json", "utf-8"));

        const insertData = [];

        for(const item of data){
            const {animalType, vaccines} = item;

            vaccines.forEach((v) => {
                insertData.push({vaccineName: v, animalType: animalType})
            })
        }

        await VaccineMaster.insertMany(insertData)
        console.log("Succesfully inserted the vaccines")
        mongoose.connection.close();
    }
    catch(err){
        console.log("Error: ", err)
        mongoose.connection.close()
    }
}

// fillVaccineData()


const fillDiseaseData = async() => {
    try{
        await mongoose.connect(process.env.MONGO_URL)

        const data = JSON.parse(fs.readFileSync("../diseaseAnimal.json", "utf-8"));

        const insertData = [];

        for(const item of data){
            const {animalType, diseaseName} = item;

            diseaseName.forEach((d) => {
                insertData.push({diseaseName: d, animalType: animalType})
            })
        }

        await DiseaseMaster.insertMany(insertData)
        console.log("Succesfully inserted the diseases")
        mongoose.connection.close();
    }
    catch(err){
        console.log("Error: ", err)
        mongoose.connection.close()
    }
}

fillDiseaseData()