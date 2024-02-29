import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

const generateAccessAndRefereshTokens = async(userId) =>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token",error)
    }
}

const RegisterUser =asyncHandler( async (req, res, next)=>{
    let {username, email, fullname, password} = req?.body;

    if (
        [fullname, email, username, password].some((field) => field? field?.trim() === "":true)
    ) {
        throw new ApiError(400, "All fields are required")
    }
    console.log('email == ""', email == "");

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        console.log('existedUser', existedUser);
        throw new ApiError(409, "User with email or username already exists")
    }
    
    
    const user = await User.create({
        fullname,
        email,
        username:username.toLowerCase(),
        password
    });

    const createdUser = await User.find({_id: user._id}).select(
        '-password -refreshToken'
    );

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )
    
})

const loginUser = asyncHandler( async(req, res, next)=>{
    const { username, email, password} = req.body;

    if(!(username ||email)){
        throw new ApiError(400, "Email or username is required");
    }

    const user = await User.findOne({
        $or :[ {email}, {username}]
    });
console.log('user', user);
    if(!user){
        throw new ApiError(404, "User does not exist");
    }
    const isPasswordCorrect =await user.isPasswordCorrect(password);

    

    if(!isPasswordCorrect){
        throw new ApiError(401, "Email or password is incorrect.");
    }

    const { accessToken, refreshToken} = await generateAccessAndRefereshTokens(user._id);

    console.log('accessToken', accessToken);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200, 
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged In Successfully"
        )
    )


});

const getAllUsers = asyncHandler( async(req, res, next)=>{
    try{
        const users =await User.find({_id: {$ne:req.user._id}});

        if(!Array.isArray(users)){
            throw new ApiError(500, "Error while getting users.");
        }

        return res.status(201).json(
            new ApiResponse(200, users, "All users")
        );
    }catch(e){
        throw new ApiError(500, "Error while getting users"+e);
    };
    

});

export { RegisterUser, loginUser, getAllUsers};