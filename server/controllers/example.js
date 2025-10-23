const User = require('../models/user')

async function handleGetAllUsers(req, res) {
    const allDbUsers = await User.find({});

    return res.status(200).json(allDbUsers);
}


async function handleGetUserById(req, res) {
    const user = await User.findById(req.params.id)
    if(!user)return res.status(404).json({msg: "User not found"});

    return res.json(user)
}


async function handleUpdateUserLastName(req, res) {
    const body = req.body
    const user = await User.findByIdAndUpdate(req.params.id, {last_name: body.last_name})

    return res.status(200).json({msg: "updated"})
}


async function handleCreateNewUser(req, res){
    const body = req.body

    const result = await User.create({
        first_name: body.first_name,
        last_name: body.last_name,
        email: body.email,
        mobile_number: body.mobile_number,
    })

    return res.status(201).json({msg: "created"})
}

module.exports = {
    handleGetAllUsers,
    handleGetUserById,
    handleUpdateUserLastName,
    handleCreateNewUser,
}