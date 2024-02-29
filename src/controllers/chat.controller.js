import mongoose from "mongoose";
import { Chat } from "../models/chat.models.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { emitSocketEvent } from "../socket/index.js";
import { ChatEventEnum } from "../constants.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const getOrCreateSingleChat = asyncHandler(async(req, res, next)=>{
    const { receiverId } = req.body;

    const receiver = await User.findById(receiverId);
    if(!receiver){
        throw new ApiError(500, "receiver does not exists.");
    }

     // check if receiver is not the user who is requesting a chat
    if (receiver._id.toString() === req.user._id.toString()) {
        throw new ApiError(400, "You cannot chat with yourself");
    }

    const chat = await Chat.find({
        participants: { $elemMatch: { $eq: req.user._id } },
    });

    if (chat.length) {
        // if we find the chat that means user already has created a chat
        return res
        .status(200)
        .json(new ApiResponse(200, chat[0], "Chat retrieved successfully"));
    }

    // if not we need to create a new one on one chat
    const newChatInstance = await Chat.create({
        name: "One on one chat",
        participants: [req.user._id, new mongoose.Types.ObjectId(receiverId)], // add receiver and logged in user as participants
        admin: req.user._id,
    });

    if(!newChatInstance){
        throw new ApiError(500, "Internal server error");
    }

    newChatInstance?.participants?.forEach((participant) => {
        if (participant._id.toString() === req.user._id.toString()) return; // don't emit the event for the logged in use as he is the one who is initiating the chat
    
        // emit event to other participants with new chat as a payload
        emitSocketEvent(
          req,
          participant._id?.toString(),
          ChatEventEnum.NEW_CHAT_EVENT,
          newChatInstance
        );
      });
    
      return res
        .status(201)
        .json(new ApiResponse(201, newChatInstance, "Chat retrieved successfully"));


});

export  {
    getOrCreateSingleChat
};