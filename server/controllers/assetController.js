const Farm = require('../models/farm')

const addFarmData = async(req, res) => {
    
    try{
        const {name, location, capacity, animalTypes} = req.body
        const userId = req.user.id

        console.log("from assetController\n", req.body)
    
        // console.log("7 from assetController", userId)
        
        const farm = new Farm({
            owner: userId,
            name,
            animalTypes,
            location,
            capacity
        })

        await farm.save()

        return res.status(200).json({message: 'Farm added successfully'})
    }
    catch(err){
        console.error("Error in Adding farm ", err)

        res.status(500).json({message: "server error"})
    }

}


const getFarmData = async(req, res) => {
    try{
        const userId = req.user.id;

        const farmData = await Farm.find(
            {owner: userId}
        )

        return res.status(200).json({
            message: "Got the farm data",
            data: farmData
        });
    }
    catch(err){
        res.status(500).json({message: "unable to fetch farm data"})
    }
}

const getWorkerData = async(req, res) => {
    try{
        const userId = req.user.id;

        const workerData = await Farm.find()
    }
    catch(err) {

    }
}

module.exports = {
    addFarmData,
    getFarmData,
    getWorkerData
}