//const express = require('express')
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import db from "./utils/db.js"
import cookieParser from "cookie-parser";

import userRoutes from "./routes/user.routes.js";

dotenv.config();

const app = express()

app.use(cors({
  origin: 'process.env.BASE_URL',
  credentials: true,
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json())
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
const port = process.env.PORT || 4000 


app.get('/', (req, res) => {
  res.send('Hello Hello!')
})

app.get('/tech',(req,res)=>{
    res.send('TechFosters')
})

app.get('/geek',(req,res)=>{
    res.send('Geeky Techy')
    //console.log(req)
    //console.log(res)
})



//console.log(process.env.PORT);

db();


app.use('/api/v1/users', userRoutes)
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})