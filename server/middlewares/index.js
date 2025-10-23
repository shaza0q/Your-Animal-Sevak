const fs = require('fs')
const cors = require('cors')
const dotenv = require('dotenv')
dotenv.config()

function logReqRes(filename){
    return (req, res, next) => {
        fs.appendFile(
            filename,
            `\n${Date.now()} : ${req.method} : ${req.path}\n`,
            (err, data) => {
                next();
            }
        )
    }
}


const corsOptions = {
    origin: process.env.BASE_URL,
    credentials: true,
    methods: 'GET, HEAD, PUT, PATCH, POST, DELETE',
    allowedHeaders: 'Content-Type, Authorization',
}

module.exports = {logReqRes, corsOptions}