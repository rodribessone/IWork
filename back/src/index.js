import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

// Importaciones de Rutas
import authRoutes from "./routes/auth.js";
import postRoutes from "./routes/postRoutes.js";
import usersRoute from "./routes/users.js";
import searchRoutes from "./routes/search.js";
import chatRoutes from "./routes/chatRoutes.js";
import reviewRoutes from "./routes/reviews.js";

// Otros servicios
import "./cron/autoReject.js";

dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;

// ==========================================================
// 🚨 CONFIGURACIÓN DE ORÍGENES (Whitelist)
// ==========================================================
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://iwork-project.netlify.app", // Tu app en producción
  process.env.CLIENT_URL               // Por si tienes la URL en variables de entorno
].filter(Boolean);

// ==========================================================
// 🚨 MIDDLEWARES Y CORS
// ==========================================================
app.use(express.json());

app.use((req, res, next) => {
  const origin = req.headers.origin;

  // Si el origen de la petición está en nuestra lista, lo permitimos explícitamente
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Si es una petición de preflight (OPTIONS), respondemos 200 inmediatamente
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  next();
});

// ==========================================================
// 🚨 CONFIGURAR SOCKET.IO CON LOS MISMOS ORÍGENES
// ==========================================================
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Rutas de API
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/users", usersRoute);
app.use("/api/search", searchRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/reviews", reviewRoutes);

app.get("/", (req, res) => {
  res.send("IWork API funcionando ✅");
});

// Middleware de autenticación para Sockets
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error("No autorizado: Token faltante"));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch (err) {
    next(new Error("Token inválido"));
  }
});

let onlineUsers = {};

io.on('connection', (socket) => {
  const userId = socket.userId;
  if (userId) {
    onlineUsers[userId] = socket.id;
    socket.join(userId);
    console.log(`👤 Usuario conectado: ${userId}`);
  }

  io.emit("getOnlineUsers", Object.keys(onlineUsers));

  socket.on('sendMessage', (data) => {
    const { recipientId, conversationId, text } = data;
    const receiverSocketId = onlineUsers[recipientId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('receiveMessage', data);
      io.to(receiverSocketId).emit('refreshConversations', {
        conversationId,
        lastMessage: text
      });
    }
  });

  socket.on('markMessagesAsRead', ({ conversationId, userId }) => {
    // Le avisamos AL MISMO USUARIO (socket) que actualice su navbar
    socket.emit('updateUnreadCounters');
  });

  socket.on('disconnect', () => {
    if (userId) {
      delete onlineUsers[userId];
      io.emit("getOnlineUsers", Object.keys(onlineUsers));
    }
  });
});

// Conexión a MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Conectado a MongoDB"))
  .catch((err) => console.log("❌ Error en MongoDB:", err));

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor IWork corriendo en puerto ${PORT}`);
});