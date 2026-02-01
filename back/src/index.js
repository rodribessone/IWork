import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
// 🚨 NUEVAS IMPORTACIONES para Socket.io
import { createServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

// Importaciones de Rutas
import authRoutes from "./routes/auth.js";
import postRoutes from "./routes/postRoutes.js";
import usersRoute from "./routes/users.js";
import searchRoutes from "./routes/search.js";
import chatRoutes from "./routes/chatRoutes.js"; // 👈 NUEVA RUTA DE CHAT

// Otros servicios
import "./cron/autoReject.js";

dotenv.config();

const app = express();
// 🚨 1. CREAR SERVIDOR HTTP Y ENLAZAR EXPRESS A ÉL
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;

// 🚨 2. CONFIGURAR SOCKET.IO EN EL SERVIDOR HTTP
const io = new Server(httpServer, {
  cors: {
    // Asegúrate de que este sea el puerto de tu Frontend (normalmente 5173 o 3000)
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Middlewares de Express
app.use(express.json());
// 🚨 Configuración de CORS más específica para el Frontend
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));


// Rutas de API
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/users", usersRoute);
app.use("/api/search", searchRoutes);
app.use("/api/chats", chatRoutes); // 👈 Agregar la nueva ruta de chat

// Rutas base
app.get("/", (req, res) => {
  res.send("IWork API funcionando ✅");
});


// ==========================================================
// 🚨 LÓGICA CENTRAL DE SOCKET.IO
// Aquí manejamos la conexión y el seguimiento de usuarios en línea
// ==========================================================
io.use((socket, next) => {
  const token = socket.handshake.auth.token; // Ahora recibiremos el token aquí
  if (!token) return next(new Error("No autorizado: Token faltante"));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id; // Extraemos el ID real del token
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
    console.log(`Usuario autenticado conectado: ${userId}`);
  }

  io.emit("getOnlineUsers", Object.keys(onlineUsers));

  socket.on('sendMessage', (data) => {
    const { recipientId, conversationId, text } = data;
    const receiverSocketId = onlineUsers[recipientId];

    io.to(receiverSocketId).emit('receiveMessage', data);
    io.to(receiverSocketId).emit('refreshConversations', {
      conversationId,
      lastMessage: text
    });
  });

  socket.on('markRead', ({ conversationId }) => {
    // Cuando el usuario lee un mensaje, le avisamos a SUS PROPIAS pestañas
    // para que el Nav ejecute checkUnreadMessages()
    socket.emit('updateUnreadCounters');

    // Opcional: Podrías avisarle al otro usuario que viste su mensaje
    // const recipientSocketId = onlineUsers[recipientId];
    // if (recipientSocketId) io.to(recipientSocketId).emit('messageStatusUpdate', { conversationId, status: 'seen' });
  });

  socket.on('disconnect', () => {
    // Limpieza optimizada
    if (userId) {
      delete onlineUsers[userId];
      io.emit("getOnlineUsers", Object.keys(onlineUsers));
    }
  });
});
// ==========================================================


// Conexión a MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Conectado a MongoDB");
    // 🚨 3. ESCUCHAR EN EL SERVIDOR HTTP, NO EN LA APP DE EXPRESS
    httpServer.listen(PORT, () => {
      console.log(`🚀 Servidor Express & Socket.io corriendo en puerto ${PORT}`);
    });
  })
  .catch((err) => console.log("❌ Error al conectar a MongoDB:", err));