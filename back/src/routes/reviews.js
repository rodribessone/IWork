import express from "express";
import Review from "../models/Review.js";
import User from "../models/User.js"; // Necesitamos el modelo de usuario para actualizar su promedio
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

// 1. CREAR UNA RESEÑA
router.post("/", verifyToken, async (req, res) => {
    try {
        const { recipientId, postId, rating, comment } = req.body;

        // 1. Validaciones manuales antes de tocar la DB
        if (!recipientId || recipientId === "undefined") {
            return res.status(400).json({ message: "El ID del destinatario es inválido." });
        }
        if (!postId || postId === "undefined") {
            return res.status(400).json({ message: "El ID del post es inválido." });
        }

        // 2. Crear la reseña
        const newReview = new Review({
            author: req.userId, // Asegúrate que tu middleware verifyToken use req.userId
            recipient: recipientId,
            post: postId,
            rating: Number(rating),
            comment
        });

        await newReview.save();

        // 3. Recalcular promedio
        const reviews = await Review.find({ recipient: recipientId });

        // Evitar división por cero aunque aquí siempre habrá al menos una
        const totalRating = reviews.reduce((acc, curr) => acc + curr.rating, 0);
        const avgRating = totalRating / reviews.length;

        // 4. Actualizar usuario
        await User.findByIdAndUpdate(recipientId, {
            rating: Number(avgRating.toFixed(1)), // Convertir de nuevo a número
            reviewsCount: reviews.length
        });

        res.status(201).json(newReview);

    } catch (error) {
        // ESTO ES CLAVE: Mira tu terminal de VS Code / Nodemon para ver el error real
        console.error("DETALLE DEL ERROR:", error);

        if (error.code === 11000) {
            return res.status(400).json({ message: "Ya has dejado una reseña para este trabajo." });
        }

        res.status(500).json({
            message: "Error al guardar la reseña.",
            error: error.message // Enviamos el mensaje real para debuguear
        });
    }
});

// 2. OBTENER RESEÑAS DE UN USUARIO
router.get("/user/:userId", async (req, res) => {
    try {
        const reviews = await Review.find({ recipient: req.params.userId })
            .populate("author", "name avatar") // Traer nombre y foto de quien comentó
            .populate("post", "title")         // Traer título del trabajo (opcional)
            .sort({ createdAt: -1 });          // Las más nuevas primero

        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: "Error obteniendo reseñas" });
    }
});

export default router;