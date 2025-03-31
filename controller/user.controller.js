import User from "../model/User.model.js"
import crypto from "crypto"
import nodemailer from "nodemailer"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
const registerUser = async(req, res) => {
    //res.send('Registered!');

    //step1: get data

const {name, email, password} = req.body;

//step2: validate date

if(!name || !email || !password){
    return res.status(400).json({
        message: "All fields are necessary"
    })
}


//db exists in another continent
try {
    //step3: check if user exists in db
    const existingUser = await User.findOne({email})
    if(existingUser){
        res.status(400).json({
            message: "User already exists"
        })
    }
    //step4: if user doesn't exist create a user
    const user = await User.create({
        name,
        email,
        password
    })
    console.log(user) //model that was created in mongodb

    if(!user){
        res.status(400).json({
            message: "user not registered"
        })
    }

    //step5: create a verification taken
    const token = crypto.randomBytes(32).toString("hex")
    console.log(token);

    //step6: save token in database
    user.verificationToken = token 
    
     //user object ko db me save
     await user.save()

     //step7: Send token to user in email
     const transporter = nodemailer.createTransport({
        host: process.env.MAILTRAP_HOST,
        port: process.env.MAILTRAP_PORT,
        secure: false, // true for port 465, false for other ports
        auth: {
          user: process.env.MAILTRAP_USERNAME,
          pass: process.env.MAILTRAP_PASSWORD
        },
      });

      const mailOption = await transporter.sendMail({
        from: process.env.MAILTRAP_SENDEREMAIL, // sender address
        to: user.email, // list of receivers
        subject: "Verify your email", // Subject line
        text: `Please click on the following link ${process.env.BASE_URL}/api/v1/users/verify/${token}`, // plain text body
        html: "<b>Hello world?</b>", // html body
      });   

      await transporter.sendMail(mailOption); 

      res.status(201).json({
        message: "User registered successfully",
        success: true
      })



}
 catch (error) {
    res.status(400).json({
        message: "User registration  fail",
        error,
        success: false
    })
}



console.log(name, email, password)


}

//verify controller

const verifyUser = async(req,res) =>{

//Step1: get token from url  
const {token} = req.params;

console.log(token);
//Step2: validate
if(!token){
    res.status(400).json({
        message: 'Token missing'
    })
}
//Step3: find user based on token
const user = await User.findOne({verificationToken: token}) //jiske paas ye token h vo user find krna
//Step4: if user doesn't exist

if(!user){
    res.status(400).json({
        message: 'Invalid Token'
    })
}

//step5: isVerified : true
user.isVerified = true

//step6: now remove verification token because user has been verified above

user.verificationToken = undefined

//step7: save
await user.save()

}

//login controller
 const login = async(req,res) =>{
    //Step1: get data
    const {email, password} = req.body

    //Step2: validate

    if(!email || !password){
        return res.status(400).json({
            message: 'invalid username or password'
        })
    }

    //Step3: check in db is user exists
    try {
        const user = await User.findOne({email})
        if(!user){
            res.status(400).json({
            message: 'invalid username or password'
            })
        }

    //Step4: check password
    const isMatch = await bcrypt.compare(password, user.password);
    console.log(isMatch);

    if(!isMatch){
        
            res.status(400).json({
            message: 'invalid username or password'
            })
        
    }

    const token = jwt.sign({id: user._id, role: user.role}, 'shhhhh',{
        expiresIn: '24h'
    })
    const cookieOptions = {
        httpOnly: true,
        secure: true,
        maxAge: 24*60*60*1000
    }
    res.cookie("token", token, {cookieOptions})
    
    
    res.status(200).json({
        success: true,
        message: 'login successful',
        token,
        user:{
            id: user._id,
            name: user.name,
            role: user.role
        },
    });
}
    catch (error) {
        
    }
    
 }
export {registerUser, verifyUser, login};