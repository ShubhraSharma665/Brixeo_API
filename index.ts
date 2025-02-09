import { Server } from "./src/server";
import http from "http";
import express from "express";
import { Server as SocketServer } from "socket.io";
import cors from "cors";
import { SOCKET_CONNECT } from "./src/services/socket/index";

const app = new Server().app;
const port = process.env.PORT || 8004;

app.use(cors({ origin: true, credentials: true }));

const server = http.createServer(app);

const io = new SocketServer(server, {
  cors: {
    origin: ["https://brixeopro.com", "http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

server.listen(port, () => {
  SOCKET_CONNECT(io);
  console.log(`Server is running on port ${port}`);
});
