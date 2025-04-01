import express from 'express';
import { isLoggedIn } from '../middleware/auth.middleware.js';
import { registerUser, verifyUser, login, getMe, logoutUser, forgotPassword } from '../controller/user.controller.js';

const router = express.Router()

router.post("/register", registerUser)
router.get("/verify/:token", verifyUser) //GET TOKEN FROM USER const {token} = req.params
router.post("/login", login)
router.get("/me", isLoggedIn, getMe)//jaise hi /me route pe aaenge phle isLoggedIn check hoga then getMe
router.post("/logout", isLoggedIn, logoutUser) 
router.post("/forgotPassword", forgotPassword)
export default router;