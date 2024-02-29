import { Router } from "express";
import { getOrCreateSingleChat } from "../controllers/chat.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.get('/c',verifyJWT,getOrCreateSingleChat);

export default router;