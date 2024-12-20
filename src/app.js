import express from "express";
import cors from "cors"
import cookieParser from "cookie-parser"

// app initialization
const app = express();


//middleware
app.use(express.json())
.use(express.json({limit: "16kb", extended: true}))
.use(express.urlencoded({extended: true, limit: "16kb"}))
.use(cors({
    origin: "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept", "X-Requested-With", "Origin", "Access-Control-Allow-Origin"],
}))
.use(cookieParser())

// import routes
import userRouter from './routes/user.routes.js';

//export routes
app.use('/api/v1/user', userRouter);

export default app;