const Farm = require('../models/farm')
const FarmUser = require('../models/farmUser')

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

        // Also add owner to FarmUser collection for access control
        await FarmUser.create({
            farmId: farm._id,
            userId: userId,
            role: 'owner',
            isActive: true,
            createdBy: userId
        })

        return res.status(200).json({message: 'Farm added successfully'})
    }
    catch(err){
        console.error("Error in Adding farm ", err)

        res.status(500).json({message: "server error"})
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
    getWorkerData
}