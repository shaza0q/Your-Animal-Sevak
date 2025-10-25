const jwt = require('jsonwebtoken')

function protect(req, res, next){
    const token = req.cookies.jwt;
    // console.log("", token)

    if(!token){
        return res.status(401).json({message: 'Not authorised, invalid or null token'})
    }

    try{
        const payload = jwt.verify(token, process.env.JWT_SECRET)

        req.user = payload
        // console.log("15 from middleware auth", payload)

        next()
    }
    catch(error){
        console.error('Token verification failed:', error.message);
        return res.status(401).json({ message: 'Not authorized, token failed' });
    }
}

module.exports = {protect}