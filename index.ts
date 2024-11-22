import { Server } from './src/server';
import cors  from "cors"
const http = require('http'); // Require http module for creating HTTP server
const express = require('express');
const NextFunction = require("express")

const app = express();
const server = http.createServer(new Server().app); // Create HTTP server using Express app

const port = process.env.PORT || 8004;


app.use(cors({
  origin: true,
  credentials: true,
}));


server.listen(port, async() => {
  console.log(`Server is listening at port ${port}`);
});

