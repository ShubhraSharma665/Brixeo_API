import chatModel from "../../models/chat.model";
import messageModel from "../../models/message.model";

import * as Jwt from 'jsonwebtoken';
import { Server, Socket } from 'socket.io';
import userModels from "../../models/user.models";
// import { ChatController } from "../controllers/chat/ChatController";
import Auth from '../../utils/Auth';

export class SocketService {
	io: any;
	public sockets: any;
	public onlineUsers: any;
	public blockData: any;
	static activeSockets: any = [];

	constructor() {
		this.io;
		this.sockets = [];
		this.onlineUsers = [];
		this.blockData;
	}

	init(server) {
		this.io = new Server(server, {
			cors: {
			  origin: ["http://localhost:3000"], // Your frontend URL
			  methods: ["GET", "POST"],
			  credentials: true,
			},
			transports: ["websocket", "polling"],
			pingInterval: 25000,
			pingTimeout: 5000,
		  });
		// this.io = new Server(server, {
		//   maxHttpBufferSize: 100000000,
		//   connectTimeout: 5000,
		//   transports: ['websocket', 'polling'],
		//   pingInterval: 25 * 1000,
		//   pingTimeout: 5000,
		//   cors: {
		// 	origin: ["http://localhost:3000", "http://admin.thelotusonline777.com"], // Allow these origins
		// 	methods: ["GET", "POST"], // Allow specific HTTP methods
		// 	credentials: true, // Enable cookies and credentials
		//   },
		// });
	  }

	async provideSocket(id) {
		console.log('Provide Socket For ID', id);
		let userSocket = this.sockets[id];
		return userSocket;
	}

	globalSocket() {
		return this.io;
	}

	async connect() {
		// This middleware is used to validate the user using jwt token
		this.io.use(async (socket: Socket, next) => {
			try {
				const auth: any = socket.handshake.auth;
				const token: string = auth.token;


				if (!token) {
					console.log('if token not present');
					// return next(new AppError('You are not logged in, please login again', RESPONSE.HTTP_UNAUTHORIZED));
				}
				const decoded: any = await Auth.decodeJwt(token);
				console.log('auth ', decoded,token);
				let currentUser = await userModels.findOne({_id:decoded.id})
				socket.data.user = currentUser;

				// Jwt.verify(token, 'game', async (err, decoded) => {
				// 	if (err) {
				// 		console.log(err);
				// 	} else {
				// 		let currentUser = await userModels.findById(decoded).lean();
				// 		socket.data.user = currentUser;
				// 		console.log('CurrentUser', currentUser);
				// 		next();
				// 	}
				// });
				// next();
			} catch (error) {
				next(error);
			}
		});

		this.io.on('connection', async (socket: Socket) => {
			this.onlineUsers.push(socket.id);
			this.sockets[socket?.data?.user?.id] = socket;
			socket.join(socket?.data?.user?.id);

			socket.on('sendMessage', (data, callback) => {
				let memberSocket = null;
				data.senderId = socket.data.user.id;
				memberSocket = data.receiverId || null;

				ChatController.sendMessage(data, memberSocket, this.io);
			});

			// Second Method

			// *@api {emit} chatHistory Chat History
			/**
			 *@apiVersion 1.0.0
			 *@apiGroup Chat
			 *@apiParamExample Normal-Request-Body :
			 *{"receiverId":"622eec5075f7674b7cd5e86f"}
			 **/

			socket.on('chatHistory', (data, callback) => {
				let memberSocket = null;
				data.senderId = socket.data.user.id;
				ChatController.chatHistory(data, this.io);
			});

			// Third Method

			// *@api {emit} chatList Chat List
			/**
			 *@apiVersion 1.0.0
			 *@apiGroup Chat
			 *@apiParamExample Normal-Request-Body :
			 * {"page":1,"limit":50,"search_text":"Hello"}
			 **/

			socket.on('chatList', (data, callback) => {
				console.log('socketData', socket.data);
				let memberSocket = null;
				data.senderToken = socket.handshake.auth.token;
				data.senderId = socket.data.user.id;
				data.user = socket.data.user;
				ChatController.chatList(data, this.io);
			});

			// Fourth Method

			socket.on('readMessage', (data, callback) => {
				console.log('socketData', socket.data);
				ChatController.readMessage(data, this.io);
			});

			socket.on('disconnect', async (data) => {
				console.log('User Disconnect.');
				let socket_key = this.getKeyByValue(this.sockets, socket);
				delete this.sockets[socket_key];
				this.onlineUsers.splice(this.onlineUsers.indexOf(socket.id), 1);
				console.log('Online Users After Disconnect', this.onlineUsers.length);
			});
		});
	}

	getKeyByValue(object, value) {
		return Object.keys(object).find((key) => object[key] === value);
	}
}

let socketObj = new SocketService();
export default socketObj;

export class ChatController {
  /**
   * Send a message
   */
  static async sendMessage(data, memberSocket, io) {
    try {
      const { senderId, receiverId, message,file } = data;
	  console.log("hello user got ur message", senderId, receiverId, message)

      // Check if chat exists between the users
      let chat = await chatModel.findOne({
        participants: { $all: [senderId, receiverId] },
      });

      if (!chat) {
        // Create a new chat
        chat = new chatModel({
          participants: [senderId, receiverId],
        });
        await chat.save();
      }

      // Save the message
      const newMessage = new messageModel({
        chatId: chat._id,
        senderId,
        receiverId,
        message,
		file:file || ""
      });
      await newMessage.save();

      // Update the last message in the chat
      chat.messageId = newMessage._id;
      chat.messageAt = new Date();
      await chat.save();

      // Emit the message to the receiver
      if (memberSocket) {
        io.to(memberSocket).emit('receiveMessage', { success: false, message: 'Message sent successfully!.', data: newMessage });
      }

    } catch (err) {
		io.to(data.senderId).emit('receiveMessage', { success: false, message: 'Failed to send message.', data: err.message });
    }
  }

  /**
   * Fetch chat history
   */
  static async chatHistory(data, io) {
    try {
      const { senderId, receiverId } = data;

      // Fetch the chat
      const chat = await chatModel.findOne({
        participants: { $all: [senderId, receiverId] },
      });

      if (!chat) {
        io.to(senderId).emit('chatHistory', { success: true, message: 'Chat history get succssfully.', data: [] });
        return;
      }

      // Fetch messages in the chat
      const messages = await messageModel.find({ chatId: chat._id })
        .sort({ createdAt: -1 })
        .limit(50); // Fetch the latest 50 messages

		io.to(senderId).emit('chatHistory', { success: true, message: 'Chat history get succssfully.', data: messages });
    } catch (err) {
      io.to(data.senderId).emit('chatHistory', { success: true, message: 'Failed to get chat history.', data: [] });
    }
  }

  /**
   * Fetch chat list for a user
   */
  static async chatList(data, io) {
    try {
      const { senderId } = data;

      // Fetch all chats for the user
      const chats = await chatModel.find({ participants: senderId })
        .sort({ messageAt: -1 })
        .populate('participants', 'firstName lastName emailId');

		io.to(senderId).emit('chatList', { success: true, message: 'Chat list get succssfully!.', data: chats });
    } catch (err) {
		io.to(data.senderId).emit('chatList', { success: false, message: 'Failed to get chat list!.', data: [] });
    }
  }

  /**
   * Mark messages as read
   */
  static async readMessage(data, io) {
    try {
      const { chatId, userId } = data;

      // Mark all messages in the chat as read
      await messageModel.updateMany(
        { chatId, receiverId: userId },
        { $set: { isRead: true } }
      );

      io.to(userId).emit('readMessage', { success: true, message: 'message seen successfuly.', data: [] });
    } catch (err) {
      io.to(data.userId).emit('readMessage', { success: true, message: 'falied to seen message.', data: [] });
    }
  }
}



