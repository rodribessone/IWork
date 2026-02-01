import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";

// 1. CREAR o ENCONTRAR CONVERSACIÓN
export const createConversation = async (req, res) => {
    try {
        const { recipientId, postId } = req.body;
        const senderId = req.userId;

        // 1. Buscar si ya existe la conversación
        let conversation = await Conversation.findOne({
            participants: { $all: [senderId, recipientId] },
            postId: postId
        });

        if (conversation) {
            // 🚨 SOLUCIÓN: Si existe, nos aseguramos de que NO esté en deletedBy para el que inicia
            if (conversation.deletedBy.includes(senderId)) {
                conversation.deletedBy = conversation.deletedBy.filter(
                    id => id.toString() !== senderId.toString()
                );
                await conversation.save();
            }
            return res.status(200).json(conversation);
        }

        // 2. Si no existe, crearla normal
        const newConversation = new Conversation({
            participants: [senderId, recipientId],
            postId: postId,
            deletedBy: []
        });
        await newConversation.save();
        res.status(201).json(newConversation);

    } catch (error) {
        res.status(500).json({ message: "Error al crear chat" });
    }
};

// 2. OBTENER CONVERSACIONES DEL USUARIO
export const getUserConversations = async (req, res) => {
    try {
        const userId = req.userId;

        // Buscar todas las conversaciones donde el usuario es participante
        const conversations = await Conversation.find({
            participants: { $in: [userId] },
            deletedBy: { $ne: userId }
        })
            .populate('participants', 'name avatar') // Traemos a todos
            .populate('postId', 'title')
            .sort({ updatedAt: -1 });

        res.status(200).json(conversations);

    } catch (err) {
        console.error("Error al obtener conversaciones:", err);
        res.status(500).json({ error: "Error interno del servidor." });
    }
};

// 3. OBTENER MENSAJES DE UNA CONVERSACIÓN
export const getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;

        const messages = await Message.find({ conversationId })
            .sort({ createdAt: 1 }); // Ordenar por fecha ascendente

        res.status(200).json(messages);

    } catch (err) {
        console.error("Error al obtener mensajes:", err);
        res.status(500).json({ error: "Error interno del servidor." });
    }
};

// --- 4. ENVIAR Y PERSISTIR MENSAJE ---
export const sendMessage = async (req, res) => {
    try {
        const { conversationId, text } = req.body;
        const senderId = req.userId;

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) return res.status(404).json({ message: "No encontrado" });

        const newMessage = new Message({ conversationId, senderId, text });
        await newMessage.save();

        // Buscamos al receptor
        const recipientId = conversation.participants.find(p => p.toString() !== senderId.toString());

        // ACTUALIZACIÓN ÚNICA: Marcamos como no leído para el receptor y actualizamos mensaje
        await Conversation.findByIdAndUpdate(conversationId, {
            lastMessage: text,
            updatedAt: newMessage.createdAt,
            deletedBy: [],
            $addToSet: { unreadBy: recipientId } // Solo el receptor tiene el punto rojo
        });

        res.status(201).json(newMessage);
    } catch (err) {
        res.status(500).json({ error: "Error al enviar" });
    }
};

// --- NUEVA FUNCIÓN: BORRADO LÓGICO ---
export const deleteConversation = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const userId = req.userId;

        // Agregamos al usuario al array deletedBy sin duplicarlo ($addToSet)
        const conversation = await Conversation.findByIdAndUpdate(
            conversationId,
            { $addToSet: { deletedBy: userId } },
            { new: true }
        );

        if (!conversation) return res.status(404).json({ message: "Conversación no encontrada" });

        res.status(200).json({ message: "Conversación eliminada correctamente" });
    } catch (err) {
        res.status(500).json({ error: "Error al eliminar" });
    }
};

export const markAsRead = async (req, res) => {
    const { conversationId } = req.params;
    const userId = req.userId;

    await Conversation.findByIdAndUpdate(conversationId, {
        $pull: { unreadBy: userId } // Quitamos al usuario de la lista de no leídos
    });

    res.status(200).json({ message: "Leído" });
};