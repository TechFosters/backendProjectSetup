import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const db = () =>{
    mongoose
    .connect(process.env.MONGO_URL)
    .then(()=>{
         console.log('MONGODB CONNECTION DONE');
    
    })
    .catch((err)=>{
            console.log('FAILED TO CONNECT');
    
    });
}

export default db;