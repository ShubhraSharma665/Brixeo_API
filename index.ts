import { Server } from "./src/server";
const http = require("http");
const express = require("express");
const socketIo = require("socket.io");
const cors = require("cors");
import { SOCKET_CONNECT } from './src/services/socket/index';

const app = express();
const port = process.env.PORT || 8004;

// CORS middleware
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

const server = http.createServer(new Server().app); // Use the Express app instance

// Socket.io setup
export const io = socketIo(server, {
  cors: {
    origin: ["https://brixeopro.com/", "https://brixeopro.com/login"],
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true,
  },
});

server.listen(port, () => {
  // socketObj.init(server);
  // socketObj.connect();
  SOCKET_CONNECT(io)
  console.log(`Server is listening at port ${port}`);
});
