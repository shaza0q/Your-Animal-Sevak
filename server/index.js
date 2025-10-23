const express = require('express');
const {connectDB} = require('./connection')
const userRouter = require('./routes/user')
const authRouter = require('./routes/auth')
const assetRouter = require('./routes/asset')
const {logReqRes, corsOptions} = require('./middlewares')
const app = express();
const cors = require('cors')
const dotenv = require('dotenv')
const cookieParser = require('cookie-parser')
const PORT = 8000;
dotenv.config()


connectDB('mongodb://127.0.0.1:27017/animal-management-system')
.then(() => console.log("DB connected"))
.catch((err) => console.log(err))


app.use(cors(corsOptions));
app.use(express.json())
app.use(cookieParser())
app.use(logReqRes('log.txt'))


app.use("/auth", authRouter)
app.use("/user", userRouter)
app.use("/asset", assetRouter)

app.listen(PORT, () => console.log("Server is running"))