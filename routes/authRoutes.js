import express from "express";
import { adminLogin, googleLogin, login, logout, register } from "../controllers/authController.js";

const authRouter = express.Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.get("/logout", logout);
authRouter.post("/googlelogin" , googleLogin)
authRouter.post("/adminlogin", adminLogin)

export default authRouter;