import chatModel from "../../models/chat.model";
import messageModel from "../../models/message.model";
import userModels from "../../models/user.models";
import Auth from "../../utils/Auth";
import moment from "moment";
import mongoose from "mongoose";
import admin from "../firebase";
import firebaseModel from "../../models/firebase.model";

const sockets = {};
const onlineUsers = new Set();

export const SOCKET_CONNECT = (io) => {
  io.use(checkAuthentication).on("connection", (socket) => handleConnection(socket, io));
};

// **Authenticate Socket Connection**
const checkAuthentication = async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Authentication token is required"));

    const decoded:any = await Auth.decodeJwt(token);
    if (!decoded?.id) return next(new Error("Invalid token"));

    const currentUser = await userModels.findById(decoded.id);
    if (!currentUser) return next(new Error("User not found"));

    socket.data.user = currentUser;
    next();
  } catch (error) {
    console.error("Socket Authentication Error:", error.message);
    next(new Error("Authentication Failed"));
  }
};

// **Handle Socket Connection**
const handleConnection = async (socket, io) => {
  try {
    const userId = socket.data.user._id.toString();
    sockets[userId] = socket;
    onlineUsers.add(userId);
    socket.join(userId);
    console.log(`${socket.data.user.firstName} connected`);

    socket.on("sendMessage", (data) => handleSendMessage(socket, data, io)); // Pass io
    socket.on("chatHistory", (data) => handleChatHistory(socket, data));
    socket.on("chatList", () => handleChatList(socket));
    socket.on("markMessagesAsRead", (data) => handleMarkMessagesAsRead(socket, data));
    socket.on("disconnect", () => handleDisconnect(socket));
  } catch (error) {
    console.error("Socket Connection Error:", error.message);
    throw new error(error)
  }
};

// **Handle Sending Messages**
const handleSendMessage = async (socket, data, io) => {
  try {
    const { receiverId, message, file } = data;
    const senderId = socket.data.user._id;

    if (!receiverId || (!message && !file)) {
      socket.emit("error", { message: "Invalid message data" });
    }
    if (!mongoose.Types.ObjectId.isValid(receiverId)) {
      io.to(senderId).emit("error",{ success: false, message: "Invalid receiver ID" });
    }

    let chat = await chatModel.findOne({ participants: { $all: [senderId, receiverId] } });
    if (!chat) {
      chat = await new chatModel({ participants: [senderId, receiverId] }).save();
    }

    let newMessage = await new messageModel({
      chatId: chat._id,
      senderId,
      receiverId,
      message,
      file,
    }).save();
    
    chat.lastMessage = message || "File sent";
    chat.updatedAt = new Date();
    await chat.save();
    const formattedMessage = {
      ...newMessage.toObject(),
      time: moment(newMessage.created_at).format("hh:mm A"),
      date: moment(newMessage.created_at).format("DD-MM-YYYY"),
    };
    if (receiverId && !onlineUsers.has(receiverId)) {
      // Send push notification

      const getFCMToken:any = await firebaseModel.findOne({userId:new mongoose.Types.ObjectId(receiverId)}) 
      
      const messagePayload = {
        notification: {
          title: "New Message",
          body: `You have a new message from ${senderId}`,
        },
        data: {
          click_action: "FLUTTER_NOTIFICATION_CLICK", // Required for web push
          url: "http://localhost:3000/chats", // Custom data field for handling redirection
        },
        token: getFCMToken.fcmToken, // Ensure this is a valid string token
      };
      console.log("check for fcm token for firebase",receiverId, onlineUsers, getFCMToken)

      try {
        await admin.messaging().send(messagePayload);
        console.log("Notification sent!");
      } catch (error) {
        console.error("Error sending notification:", error);
      }
    }
    if (sockets[receiverId]) {
      io.to(receiverId).emit("receiveMessage", formattedMessage);
    }
  } catch (error) {
    console.error("Send Message Error:", error.message);
    socket.emit("error", { message: "Failed to send message" });
  }
};

// **Fetch Chat History**
const handleChatHistory = async (socket, data) => {
  try {
    const { receiverId, page = 1, limit = 20, skip } = data;
    const senderId = socket.data.user._id;

    if (!receiverId) return socket.emit("error", {success:false, message: "Receiver ID required" });
    if (!mongoose.Types.ObjectId.isValid(receiverId)) {
      return socket.emit("error",{ success: false, message: "Invalid receiver ID" });
    }
    const chat = await chatModel.findOne({ participants: { $all: [senderId, receiverId] } });
    if (!chat) return socket.emit("chatHistory", []);

    const messages = await messageModel
      .find({ chatId: chat._id })
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
      const totalRecords = await messageModel
      .countDocuments({ chatId: chat._id })
      const isMoreData = !totalRecords? false: Number(skip) + limit >= Number(totalRecords) ? false :Number(totalRecords) !== Number(skip) + limit
    messages.forEach((msg) => {
      msg.time = moment(msg.created_at).format("hh:mm A");
      msg.date = moment(msg.created_at).format("DD-MM-YYYY");
    });
    
    const response = {
      isMoreData,
      messages:messages.reverse()
    }
    console.log("isMoreData===>>>",isMoreData)

    socket.emit("chatHistory", response);
  } catch (error) {
    console.error("Chat History Error:", error.message);
    socket.emit("error", { message: "Failed to fetch chat history" });
  }
};

// **Fetch Chat List**
const handleChatList = async (socket) => {
  try {
    const senderId = socket.data.user._id;
    const chatList = await chatModel.aggregate([
      { $match: { participants: { $in: [new mongoose.Types.ObjectId(senderId)] } } },
      {
        $lookup: {
          from: "users",
          localField: "participants",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      { $unwind: "$userDetails" },
      {
        $project: {
          lastMessage: 1,
          messageAt: 1,
          _id: "$userDetails._id",
          firstName: "$userDetails.firstName",
          lastName: "$userDetails.lastName",
          profileImage: "$userDetails.profileImage",
          emailId: "$userDetails.emailId",
        },
      },
      { $match: { _id: { $ne: new mongoose.Types.ObjectId(senderId) } } },
      { $sort: { messageAt: -1 } },
    ]);

    socket.emit("chatList", chatList);
  } catch (error) {
    console.error("Chat List Error:", error.message);
    socket.emit("error", { message: "Failed to fetch chat list" });
  }
};

// **Mark Messages as Read**
const handleMarkMessagesAsRead = async (socket, data) => {
  try {
    const { receiverId } = data;
    const senderId = socket.data.user._id;

    if (!receiverId) return socket.emit("error", { message: "Receiver ID required" });

    const chat = await chatModel.findOne({
      participants: { $all: [new mongoose.Types.ObjectId(senderId), new mongoose.Types.ObjectId(receiverId)] },
    });

    if (chat) {
      await messageModel.updateMany({ chatId: chat._id, isRead: false }, { $set: { isRead: true } });
      socket.emit("markMessagesAsReads", { success: true });
    }
  } catch (error) {
    console.error("Mark Messages as Read Error:", error.message);
    socket.emit("error", { message: "Failed to mark messages as read" });
  }
};

// **Handle Disconnection**
const handleDisconnect = (socket) => {
  try {
    const userId = socket.data.user?._id?.toString();
    if (userId) {
      delete sockets[userId];
      onlineUsers.delete(userId);
      console.log(`${socket.data.user.firstName} disconnected`);
    }
  } catch (error) {
    console.error("Disconnection Error:", error.message);
  }
};
