import chatModel from "../../models/chat.model";
import messageModel from "../../models/message.model";

import * as Jwt from "jsonwebtoken";
import { Server, Socket } from "socket.io";
import userModels from "../../models/user.models";
import Auth from "../../utils/Auth";
import moment from "moment";
import mongoose from "mongoose";

// const sockets = [];
// const onlineUsers = [];
// export const SOCKET_CONNECT = (io) => {
//     // This middleware is used to validate the user using jwt token
//     const checkAuthentication = async (socket: Socket) => {
//         try {
//             const auth: any = socket.handshake.auth;
//             const token: string = auth.token;

//             if (!token) {
//                 console.log('if token not present');
//                 return  new Error('Authentication Failed');
//                 // return next(new AppError('You are not logged in, please login again', RESPONSE.HTTP_UNAUTHORIZED));
//             }
//             const decoded: any = await Auth.decodeJwt(token);
//             console.log('auth ', decoded,token);
//             let currentUser = await userModels.findOne({_id:decoded.id})
//             socket.data.user = currentUser;
//             // next();
//         } catch (error) {
//             // next(error);
//             new Error('Authentication Failed');
//         }
//     }

//     io.on('connection', async (socket: Socket) => {
//       console.log("handle check auth");
//         checkAuthentication(socket);
//         onlineUsers.push(socket.id);
//         sockets[socket?.data?.user?.id] = socket;
//         socket.join(socket?.data?.user?.id);
//         socket.on('sendMessage', (data, callback) => {
//             let memberSocket = null;
//             data.senderId = socket.data.user.id;
//             memberSocket = data.receiverId || null;
//             sendMessage(data, memberSocket, io);
//         });

//         // Second Method

//         // *@api {emit} chatHistory Chat History
//         /**
//          *@apiVersion 1.0.0
//          *@apiGroup Chat
//          *@apiParamExample Normal-Request-Body :
//          *{"receiverId":"622eec5075f7674b7cd5e86f"}
//          **/

//         socket.on('chatHistory', (data, callback) => {
//             let memberSocket = null;
//             data.senderId = socket.data.user.id;
//             chatHistory(data, io);
//         });

//         // Third Method

//         // *@api {emit} chatList Chat List
//         /**
//          *@apiVersion 1.0.0
//          *@apiGroup Chat
//          *@apiParamExample Normal-Request-Body :
//          * {"page":1,"limit":50,"search_text":"Hello"}
//          **/

//         socket.on('chatList', (data, callback) => {
//             console.log('socketData', socket.data);
//             let memberSocket = null;
//             data.senderToken = socket.handshake.auth.token;
//             data.senderId = socket.data.user.id;
//             data.user = socket.data.user;
//             chatList(data, io);
//         });

//         // Fourth Method

//         socket.on('readMessage', (data, callback) => {
//             console.log('socketData', socket.data);
//             readMessage(data, io);
//         });

//         socket.on('disconnect', async (data) => {
//             console.log('User Disconnect.');
//             let socket_key = getKeyByValue(sockets, socket);
//             delete sockets[socket_key];
//             onlineUsers.splice(onlineUsers.indexOf(socket.id), 1);
//             console.log('Online Users After Disconnect', onlineUsers.length);
//         });
//     });
// }

// function getKeyByValue(object, value) {
//     return Object.keys(object).find((key) => object[key] === value);
// }

// async function sendMessage(data, memberSocket, io) {
//     try {
//       const { senderId, receiverId, message,file } = data;
//       console.log("hello user got ur message", senderId, receiverId, message)

//       // Check if chat exists between the users
//       let chat = await chatModel.findOne({
//         participants: { $all: [senderId, receiverId] },
//       });

//       if (!chat) {
//         // Create a new chat
//         chat = new chatModel({
//           participants: [senderId, receiverId],
//         });
//         await chat.save();
//       }

//       // Save the message
//       const newMessage = new messageModel({
//         chatId: chat._id,
//         senderId,
//         receiverId,
//         message,
//         file:file || ""
//       });
//       await newMessage.save();

//       // Update the last message in the chat
//       chat.messageId = newMessage._id;
//       chat.messageAt = new Date();
//       await chat.save();

//       // Emit the message to the receiver
//       console.log("sendid",senderId)
//       if (senderId) {
//         io.to(senderId).emit('receiveMessage', { success: false, message: 'Message sent successfully!.', data: newMessage });
//       }

//     } catch (err) {
//         io.to(data.senderId).emit('receiveMessage', { success: false, message: 'Failed to send message.', data: err.message });
//     }
//   }

//   /**
//    * Fetch chat history
//    */
//   async function chatHistory(data, io) {
//     try {
//       const { senderId, receiverId } = data;

//       // Fetch the chat
//       const chat = await chatModel.findOne({
//         participants: { $all: [senderId, receiverId] },
//       });

//       if (!chat) {
//         io.to(senderId).emit('chatHistory', { success: true, message: 'Chat history get succssfully.', data: [] });
//         return;
//       }

//       // Fetch messages in the chat
//       const messages = await messageModel.find({ chatId: chat._id })
//         .sort({ createdAt: -1 })
//         .limit(50); // Fetch the latest 50 messages
//         console.log("here is  the chat history", messages)
//         io.to(senderId).emit('chatHistory', { success: true, message: 'Chat history get succssfully.', data: messages });
//     } catch (err) {
//       io.to(data.senderId).emit('chatHistory', { success: true, message: 'Failed to get chat history.', data: [] });
//     }
//   }

//   /**
//    * Fetch chat list for a user
//    */
//   async function chatList(data, io) {
//     try {
//       const { senderId } = data;

//       // Fetch all chats for the user
//       const chats = await chatModel.find({ participants: senderId })
//         .sort({ messageAt: -1 })
//         .populate('participants', 'firstName lastName emailId');

//         io.to(senderId).emit('chatLists', { success: true, message: 'Chat list get succssfully!.', data: chats });
//     } catch (err) {
//         io.to(data.senderId).emit('chatLists', { success: false, message: 'Failed to get chat list!.', data: [] });
//     }
//   }

//   /**
//    * Mark messages as read
//    */
//   async function readMessage(data, io) {
//     try {
//       const { chatId, userId } = data;

//       // Mark all messages in the chat as read
//       await messageModel.updateMany(
//         { chatId, receiverId: userId },
//         { $set: { isRead: true } }
//       );

//       io.to(userId).emit('readMessage', { success: true, message: 'message seen successfuly.', data: [] });
//     } catch (err) {
//       io.to(data.userId).emit('readMessage', { success: true, message: 'falied to seen message.', data: [] });
//     }
//   }

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
