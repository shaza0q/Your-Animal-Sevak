const newUser = require('../models/newUsers')

const getUserById = async(req,res)=>{
    const id = req.user.id;
    const user = await newUser.findById(id);
    return   res.status(201).json(user);
}

module.exports = {
    getUserById
}
