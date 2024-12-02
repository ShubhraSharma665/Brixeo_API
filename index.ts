import { Server } from "./src/server";
import http from "http";
import cors from "cors";
import express , { Request, Response, NextFunction } from "express";

const app = express(); // Create a new Express instance
const server = http.createServer(app); // Create an HTTP server

const port = process.env.PORT || 8004;

// Configure CORS globally
app.use(
  cors({
    origin: (origin, callback) => {
      // Allowed origins for CORS
      const allowedOrigins = ['http://localhost:3000/login', 'https://brixeopro.com/login'];
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true, // Allow cookies and credentials
  })
);

app.use((req: Request, res: any, next: NextFunction) => {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Requested-With, Origin, Accept'
  );
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});

app.use(new Server().app);

server.listen(port, async () => {
  console.log(`Server is listening at port ${port}`);
});
