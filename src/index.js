import dotenv from "dotenv";
import {app} from "./app.js";
import { connectDB } from "./db/index.js";



dotenv.config({
    path: './.env'
})

const PORT = process.env.PORT || 8000;

connectDB()
.then(()=>{
    app.listen(PORT , ()=>{
        console.log('server started at ',PORT);
    })
})
.catch((e=>console.log('err', err)));

