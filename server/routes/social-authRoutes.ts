import express from "express";
import { generateAuthUrl, syncAccounts } from "../controllers/social-authController.js";
import { protect } from "../middlewares/authMiddleware.js";

const socialAuthRouter=express.Router();

socialAuthRouter.get('/:platform/url',protect,generateAuthUrl)
socialAuthRouter.get('/sync',protect,syncAccounts)

export default socialAuthRouter