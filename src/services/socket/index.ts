import chatModel from "../../models/chat.model";
import messageModel from "../../models/message.model";

import * as Jwt from "jsonwebtoken";
import { Server, Socket } from "socket.io";
import userModels from "../../models/user.models";
import Auth from "../../utils/Auth";
import moment from "moment";
import mongoose from "mongoose";

const sockets = {};
const onlineUsers = [];
export const SOCKET_CONNECT = (io) => {
  // **Authenticate socket connection**
  const checkAuthentication = async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error("Authentication Failed"));
      }
      const decoded: any = await Auth.decodeJwt(token);
      let currentUser = await userModels.findOne({ _id: decoded.id });
      socket.data.user = currentUser;
      next();
    } catch (error) {
      next(new Error("Authentication Failed"));
    }
  };

  // **Socket connection**
  io.use(checkAuthentication).on("connection", async (socket) => {
    const userId = socket.data.user._id.toString();
    sockets[userId] = socket;
    onlineUsers.push(userId);
    socket.join(userId);

    console.log(`${socket.data.user.firstName} connected`);

    // **Send Message**
    socket.on("sendMessage", async (data) => {
      const { receiverId, message, file } = data;
      const senderId = socket.data.user._id;

      let chat = await chatModel.findOne({
        participants: { $all: [senderId, receiverId] },
      });

      if (!chat) {
        chat = new chatModel({ participants: [senderId, receiverId] });
        await chat.save();
      }
      console.log("handle file change", data);

      const newMessage = new messageModel({
        chatId: chat._id,
        senderId,
        receiverId,
        message,
        file,
      });

      await newMessage.save();

      chat.lastMessage = message;
      chat.updatedAt = new Date();
      await chat.save();
      if (receiverId in sockets) {
        io.to(receiverId).emit("receiveMessage", newMessage);
      }
    });

    // **Fetch Chat History**
    socket.on("chatHistory", async (data) => {
      const { receiverId } = data;
      const senderId = socket.data.user._id;

      let chat = await chatModel.findOne({
        participants: { $all: [senderId, receiverId] },
      });

      if (!chat) {
        socket.emit("chatHistory", []);
        return;
      }
      let { page, limit } = data;
      console.log("aggregate===>>>", page, limit);

      page = Number(page) || 1;
      limit = Number(limit) || 10;
      const skip = (page - 1) * limit;

      const messages = await messageModel.aggregate([
        { $match: { chatId: chat._id } },
        { $sort: { created_at: 1 } },
        // { $skip: skip },
        // { $limit: limit },
        {
          $project: {
            _id: 1,
            senderId: 1,
            message: 1,
            isRead: 1,
            file: 1,
            date: {
              $dateToString: {
                format: "%d-%m-%Y",
                date: "$created_at",
                timezone: "Asia/Kolkata",
              },
            }, // Formats date in IST
            time: {
              $dateToString: {
                format: "%H:%M",
                date: "$created_at",
                timezone: "Asia/Kolkata",
              },
            }, // Stores time in 24-hour format
          },
        },
      ]);
      console.log("messages===>>>", messages);
      // Convert 24-hour time to 12-hour format in JavaScript
      const formattedMessages = messages.map((msg) => ({
        ...msg,
        time: moment(msg.time, "HH:mm").format("hh:mm A"), // Convert 24-hour format to 12-hour AM/PM
      }));

      // Group messages by date
      const groupedMessages = formattedMessages.reduce((acc, msg) => {
        if (!acc[msg.date]) acc[msg.date] = [];
        acc[msg.date].push({
          _id: msg._id,
          isRead: msg.isRead,
          senderId: msg.senderId,
          message: msg.message,
          file: msg.file,
          time: msg.time, // Now in 12-hour format
        });
        return acc;
      }, {});

      // Convert to array format
      const chatHistory = Object.entries(groupedMessages).map(
        ([date, messages]) => ({ date, messages })
      );

      socket.emit("chatHistory", messages);
    });
    // **Chat List**
    socket.on("chatList", async () => {
      const senderId = socket.data.user._id;
      const chatList = await chatModel.aggregate([
        {
          $match: {
            participants: { $in: [new mongoose.Types.ObjectId(senderId)] },
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
            profileImage: "$userDetails.profileImage",
            emailId: "$userDetails.emailId",
          },
        },
        {
          $match: {
            // Ensure that the logged-in user is not included in the participants list in the response
            _id: { $ne: new mongoose.Types.ObjectId(senderId) },
          },
        },
        {
          $sort: { messageAt: -1 }, // Sort by latest message
        },
      ]);
      socket.emit("chatList", chatList);
    });

    // **Mark Messages as Read**
    socket.on("markMessagesAsRead", async (data) => {
      const { receiverId } = data;
      const senderId = socket.data.user._id;
    
      let chat = await chatModel.findOne({
        participants: { $all: [new mongoose.Types.ObjectId(senderId), new mongoose.Types.ObjectId(receiverId)] },
      });
      console.log("handle check idd",chat)
      if(chat){
      await messageModel.updateMany(
        { chatId:new mongoose.Types.ObjectId(chat._id),isRead:false },
        { $set: { isRead: true } }
      );
      socket.emit("markMessagesAsReads", { success: true });
    }
    });

    // **Handle Disconnection**
    socket.on("disconnect", () => {
      delete sockets[userId];
      onlineUsers.splice(onlineUsers.indexOf(userId), 1);
      console.log(`${socket.data.user.firstName} disconnected`);
    });
  });
};
