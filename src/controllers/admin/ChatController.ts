const express = require("express");
import mongoose from "mongoose";
import _RS from "../../helpers/ResponseHelper";
import chatModel from "../../models/chat.model";
const cookieParser = require("cookie-parser");

const app = express();

app.use(cookieParser());
export class ChatController {
  static async uploadImage(req, res, next) {
    const startTime = new Date().getTime();
    const { id } = req.user;
    try {
      console.log("handle change file", req.files);
      const data = {
        userId: id,
        file: req?.files?.file[0].originalname,
      };

      // let addBlogs = await blogsModel.create(data);
      return _RS.ok(
        res,
        "SUCCESS",
        "Image upload successfully",
        data,
        startTime
      );
    } catch (err) {
      next(err);
    }
  }
  static async getChatList(req, res, next) {
    const startTime = new Date().getTime();
    const { id } = req.user; // User ID of the logged-in user
    let { page, limit, search } = req.query;

    try {
      // Validate pagination parameters
      page = Number(page) || 1;
      limit = Number(limit) || 10;

      // Calculate offset for pagination
      const offset = (page - 1) * limit;

      const matchStage: { $or?: any[]; participants?: any } = {}; // For filtering chats
      const orConditions: any[] = []; // For search filters

      // Add search filters if a search query is provided
      if (search) {
        orConditions.push(
          { "userDetails.firstName": { $regex: search, $options: "i" } }, // Search by participant first name
          { "userDetails.lastName": { $regex: search, $options: "i" } }, // Search by participant last name
          { "userDetails.emailId": { $regex: search, $options: "i" } } // Search by participant email
        );
      }

      // Add search conditions to matchStage
      if (orConditions.length > 0) {
        matchStage.$or = orConditions;
      }

      // Aggregation pipeline
      const chats = await chatModel.aggregate([
        {
          $match: {
            participants: { $in: [new mongoose.Types.ObjectId(id)] }, // Filter chats where user is a participant
            ...matchStage, // Add search filters if present
          },
        },
        {
          $lookup: {
            from: "users", // Join with the "users" collection
            localField: "participants", // Match participants field in ChatMessage
            foreignField: "_id", // Match with _id field of the User model
            as: "userDetails", // Add user details to the chat
          },
        },
        {
          $unwind: "$userDetails", // Flatten the userDetails array (since there can be multiple users)
        },
        {
          $project: {
            lastMessage: 1,
            messageAt: 1,
            // participants: 1,
            _id: "$userDetails._id",
            firstName: "$userDetails.firstName",
            lastName: "$userDetails.lastName",
            // "userDetails.profileImage": 1,
            emailId: "$userDetails.emailId",
          },
        },
        {
          $match: {
            // Ensure that the logged-in user is not included in the participants list in the response
            _id: { $ne: new mongoose.Types.ObjectId(id) },
          },
        },
        {
          $sort: { messageAt: -1 }, // Sort by latest message
        },
        {
          $skip: offset, // Apply pagination
        },
        {
          $limit: limit, // Limit the results per page
        },
      ]);
      // Convert to plain JS objects

      // Get total count for pagination
      const totalCount = await chatModel.countDocuments({
        participants: { $in: [new mongoose.Types.ObjectId(id)] },
        ...matchStage, // Apply the same search filters for the count query
      });

      return _RS.ok(
        res,
        "SUCCESS",
        "Chats found successfully",
        { chats, totalCount, page },
        startTime
      );
    } catch (err) {
      next(err);
    }
  }

  static async createChat(req, res, next) {
    const startTime = new Date().getTime();
    const { receiverId } = req.body;
    const { id } = req.user;
    try {
      const idArr = [
        id,
        receiverId,
      ];
      let chat = await chatModel.findOne({
        participants: { $all: idArr },
      });
      console.log("handle caht singh",chat)
      if (!chat) {
        const chats = new chatModel({
          participants: idArr,
          lastMessage: "",
          messageAt: new Date(),
        });
        
        await chats.save();
      }

      return _RS.ok(
        res,
        "SUCCESS",
        "Chat created successfully!!",
        {},
        startTime
      );
    } catch (err) {
      next(err);
    }
  }
}
