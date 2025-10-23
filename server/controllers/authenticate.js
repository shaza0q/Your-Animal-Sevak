const bcrypt = require('bcryptjs')
const newUser = require('../models/newUsers')
const {generateToken} = require('./generateToken')

const cookieOptions = {
    httpOnly: true,
    // Set to false for HTTP (localhost) development, true for HTTPS production
    secure: false, 
    sameSite: 'Lax', 
    maxAge: 24 * 60 * 60 * 1000 // 1 day
};


async function registerUser(req, res){
    const {fullName, email, mobile, password, role} = req.body;
    // console.log(req.body)

    if(!fullName || !email || !mobile || !password || !role){
        return res.status(400).json({message: "All fields are required"});
    }

    try{
        const existingUser = await newUser.findOne({email})

        if(existingUser){
            return res.status(409).json({message: "User with this email already exists"});
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = new newUser({
            full_name: fullName,
            email,
            mobile,
            password: hashedPassword,
            role
        })

        await user.save();

        const token = generateToken(user)

        // console.log("line 34 of controller - authenticate ", token)

        res.cookie('jwt', token, cookieOptions)

        return res.status(201).json({fullName, role})
    }
    catch(error){
        console.error('Registration error: ', error)
        res.status(500).json({message: 'An internal server error occured'})
    }

}



async function authenticateUser(req, res){
    const {email, password} = req.body;

    if(!email || !password){
        return res.status(400).json({message: "All fields are required"})
    }

    try{
        const user = await newUser.findOne({email});

        // console.log("66 user: ", user)

        if(!user){
            return res.status(409).json({message: "User with this email does not exists"});
        }
        
        const isPasswordCorrect = await bcrypt.compare(password, user.password)

        if (!isPasswordCorrect){
            return res.status(401).json({ message: "Invalid credentials" });
        }


        const token = generateToken(user)

        res.cookie('jwt', token, cookieOptions)

        return res.status(201).json({fullName: user.full_name, role: user.role})

    } catch(error) {
        console.error('Authentication error:', error);
        return res.status(500).json({ message: 'An internal server error occurred' });
    }
        

}



async function handleLogout(req, res){
    res.clearCookie('jwt')
    return res.json({status: true})
}


module.exports = {registerUser, authenticateUser, handleLogout}