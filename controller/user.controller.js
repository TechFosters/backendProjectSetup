import User from "../model/User.model.js"
import crypto from "crypto"
import nodemailer from "nodemailer"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import cookieParser from "cookie-parser"
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


res.status(201).json({
    message: "User verified successfully",
    success: true
  })

//step7: save
await user.save()

}

/*login controller
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
        // console.log(user)
        if(!user){
            return res.status(400).json({
            message: 'invalid username or password'
            })
        }

    //Step4: check password
    const isMatch = await bcrypt.compare(password, user.password);
    console.log(isMatch);

    if(!isMatch){
        
            return res.status(400).json({
            message: 'invalid username or password'
            })
        
    }

    const token = jwt.sign({id: user._id, role: user.role}, 'shhhhh',{
        expiresIn: '24h'
    });
    const cookieOptions = {
        httpOnly: true,
        secure: true,
        maxAge: 24*60*60*1000
    }
    res.cookie("token", token, cookieOptions)
    console.log(token)
    
    res.status(200).json({
        success: true,
        message: 'login successful',
        token,
        user:{
            id: user._id,
            name: user.name,
            role: user.role
        }
    });
}
    catch (error) {
        res.status(400).json({
            success: false,
            message: 'login UNSUCCESSFUL',
            error
        
        })
    }
    
 }
    */
 const login = async (req, res) => {
    const { email, password } = req.body;
  
    if (!email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }
  
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({
          message: "Invalid email or password",
        });
      }
  
      const isMatch = await bcrypt.compare(password, user.password);
  
      console.log(isMatch);
  
      if (!isMatch) {
        return res.status(400).json({
          message: "Invalid email or password",
        });
      }
  
      //
  
      const token = jwt.sign(
        { id: user._id, role: user.role },
  
        process.env.JWT_SECRET,
        {
          expiresIn: "24h",
        }
      );
      const cookieOptions = {
        httpOnly: true,
        secure: true,
        maxAge: 24 * 60 * 60 * 1000,
      };
      res.cookie("token", token, cookieOptions);
  
      res.status(200).json({
        success: true,
        message: "Login successful",
        token,
        user: {
          id: user._id,
          name: user.name,
          role: user.role,
        },
      });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(400).json({
            success: false,
            message: "Login Unsuccessful",
            error: error.message,
        });
    }
  };
  //profile
  const getMe = async(req, res) =>{

    try {
        //const date = req.user
        //console.log('reached at profile level', data);  
        const user = await User.findById(req.user.id).select('-password')
        if(!user){
            return res.status(400).json({
                success: false,
                message: 'User not found'
            })
        }
        res.status(200).json({
            success: true,
            user
        })
    } catch (error) {
        
    }
  }
  //logout user
  const logoutUser = async(req, res) =>{
    try {
        res.cookie('token', '');
        res.status(200).json({
            success: true,
            message: 'logged out successfully'
        })
    } catch (error) {
        
    }
  }


  //reset password
  const resetPassword = async(req, res) =>{
    try {
        
    } catch (error) {
        
    }
  }
  //forgetpassword
  const forgotPassword = async(req,res) =>{
    //get email
    const {email} = req.body;

   
    try {
         //find user based on email
    const user = await User.findOne({email})
    if(!user){
        return res.status(400).json({
            success: false,
            message: 'User not found'
        })
    }

    //reset Token
    const token = crypto.randomBytes(32).toString("hex")
    console.log(token);
    user.resetPasswordToken = token;
    console.log(user.resetPasswordToken);
        
    //resetTokenEXpires
    user.resetPasswordExpires = Date.now()+ 10 * 60 * 1000;


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
            subject: "Forgot PASSWORD!?", // Subject line
            text: `Please click on the following link ${process.env.BASE_URL}/api/v1/users/forgotPassword/${token}`, // plain text body
            html: "<b>Hello world?</b>", // html body
          });   
    
          await transporter.sendMail(mailOption); 
    
          res.status(201).json({
            message: "Email sent to reset password",
            success: true
          })
    
    
    //save
    user.save()
    } catch (error) {
        console.error("Error:", error);
        res.status(400).json({
            success: false,
            message: "forgot password reset unsuccessful",
            error: error.message
    })
  }
}
export {registerUser, verifyUser, login, getMe, logoutUser, forgotPassword, resetPassword};