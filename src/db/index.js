import mongoose from 'mongoose';

export const connectDB = async ()=>{
    try{
        const connectionInstance = await mongoose.connect(process.env.MONGODB_URL);
        console.log('connected to mongodb DB HOST', connectionInstance.connection.db.databaseName);
    } catch(err){
        console.log('err', err);
    }
   
}