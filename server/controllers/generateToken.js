const jwt = require('jsonwebtoken')

function generateToken (user) {
    const token = jwt.sign(
        {id: user._id, role: user.role},
        process.env.JWT_SECRET,
        {expiresIn: '1d'}
    );

    return token
}


function validateToken(token){
    const payload = jwt.verify(token, process.env.JWT_SECRET)

    return payload
}

module.exports = {generateToken, validateToken}