import { Router,  } from "express";
import { RegisterUser, getAllUsers, loginUser } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const userRouter = Router();



userRouter.route('/register').post( RegisterUser);
userRouter.route('/login').post( loginUser);

userRouter.route('/').get(verifyJWT,getAllUsers);


export default userRouter;