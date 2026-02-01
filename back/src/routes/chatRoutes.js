import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import {
    createConversation,
    getUserConversations,
    getMessages,
    sendMessage,
    deleteConversation,
    markAsRead
} from "../controllers/chatController.js";

const router = express.Router();

// 1. Crear nueva conversación (o encontrar una existente)
router.post("/", verifyToken, createConversation);

// 2. Obtener todas las conversaciones del usuario actual
router.get("/", verifyToken, getUserConversations);

// 3. Obtener todos los mensajes de una conversación
router.get("/:conversationId/messages", verifyToken, getMessages);

// 🚨 RUTA para guardar un nuevo mensaje
// El cuerpo de la solicitud (req.body) contendrá conversationId y text
router.post("/message", verifyToken, sendMessage);
router.patch("/:conversationId/read", verifyToken, markAsRead);

router.delete("/:conversationId", verifyToken, deleteConversation);


export default router;