const express = require('express');
const {connectDB} = require('./connection')
const userRouter = require('./routes/user')
const authRouter = require('./routes/auth')
const assetRouter = require('./routes/asset')
const animalRouter = require('./routes/animal')
const animalAssignmentRouter = require('./routes/animalAssignment.routes')
const farmUserRouter = require('./routes/farmUser.routes')
const masterRouter = require('./routes/master')
const statMaster = require('./routes/stat')
const farmRouter = require('./routes/farms')
const {logReqRes, corsOptions} = require('./middlewares')
const app = express();
const cors = require('cors')
const dotenv = require('dotenv')
const cookieParser = require('cookie-parser')
dotenv.config()

const PORT = process.env.PORT || 8000;
const MONGO_URL = process.env.MONGO_URL;
if (!MONGO_URL) throw new Error('MONGO_URL is not set in environment');

connectDB(MONGO_URL)
.then(() => console.log("DB connected"))
.catch((err) => { console.log(err); process.exit(1); })


app.use(cors(corsOptions));
app.use(express.json())
app.use(cookieParser())
app.use(logReqRes('log.txt'))


app.use("/auth", authRouter)
app.use("/user", userRouter)
app.use("/asset", assetRouter)
app.use("/animal", animalRouter)
app.use("/animals", animalAssignmentRouter)
app.use("/master", masterRouter)
app.use("/stat", statMaster)
app.use("/farms", farmRouter)
app.use("/farmUsers", farmUserRouter)

app.listen(PORT, () => console.log("Server is running"))