import express from "express";
import cors from "cors"
import cookieParser from "cookie-parser";
import { Server } from "socket.io";
import { createServer } from "http";


import userRouter from "./routes/user.routes.js";
import chatRouter from "./routes/chat.routes.js";
import { initializeSocketIO } from "./socket/index.js";


const app = express()

const httpServer = createServer(app);

const io = new Server(httpServer, {
  pingTimeout: 60000,
  cors: {
    origin: "*",
    credentials: true,
  },
});

app.set("io", io); // using set method to mount the `io` instance on the app to avoid usage of `global`

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

// app.use("/", (req, res, next)=>{
//     return res.json({success: true});
// });

app.use('/api/v1/users' , userRouter);
app.use('/api/v1/chat' , chatRouter);

initializeSocketIO(io);

export { app};