const Animal = require('../models/animal')
const UpdateAnimal = require('../models/animalUpdate')


const getHealthData = async(req, res) => {
    console.log(req.body)

}


module.exports = {
    getHealthData,

}