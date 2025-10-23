const Farm = require('../models/farm')

const addFarmData = async(req, res) => {
    
    try{
        const {name, location, capacity, animalTypes} = req.body
        const userId = req.user.id

        console.log("from assetController\n", req.body)
    
        // console.log("7 from assetController", userId)
        
        const farm = new Farm({
            userId,
            name,
            animalTypes,
            location,
            capacity
        })

        await farm.save()

        res.status(200).json({message: 'Farm added successfully'})
    }
    catch(err){
        console.error("Error in Adding farm")

        res.status(500).json({message: "server error"})
    }

}


module.exports = {
    addFarmData
}