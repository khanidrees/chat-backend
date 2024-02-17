import { Router } from "express";
import { RegisterUser, loginUser } from "../controllers/user.controller.js";


const userRouter = Router();

userRouter.route('/register').post( RegisterUser);
userRouter.route('/login').post( loginUser);

export default userRouter;