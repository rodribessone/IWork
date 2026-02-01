import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import Post from "../models/Post.js";
import User from "../models/User.js";
import { upload, uploadPostImage } from "../config/cloudinary.js";
import { getPosts, getPostById, createPost, applyToPost, getPostApplicants, updateApplicantStatus } from "../controllers/postController.js";

const router = express.Router();

// Crear trabajo (cualquier usuario logueado)
router.post("/", verifyToken, uploadPostImage.single('image'), createPost);

// Obtener todos los trabajos
router.get("/", getPosts);

// Obtener trabajos de un usuario específico
router.get("/user/:userId", async (req, res) => {
  try {
    const posts = await Post.find({ user: req.params.userId })
      .populate("user", "name email") // 🚨 Agregamos populate aquí también
      .sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener los posts del usuario" });
  }
});

// Obtener un trabajo por ID
router.get("/:id", getPostById);

// Editar trabajo (solo dueño)
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Trabajo no encontrado" });

    if (post.user.toString() !== req.userId) {
      return res.status(403).json({ message: "No autorizado para editar este trabajo" });
    }

    const updatedPost = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updatedPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar el trabajo" });
  }
});

// Eliminar trabajo (solo dueño)
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Trabajo no encontrado" });

    if (post.user.toString() !== req.userId) {
      return res.status(403).json({ message: "No autorizado para eliminar este trabajo" });
    }

    await Post.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Trabajo eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar el trabajo:", error);
    res.status(500).json({ message: "Error al eliminar el trabajo" });
  }
});

// APLICACIONES (Aquí estaba el error)

// 1. Aplicar a un trabajo
router.post("/:id/apply", verifyToken, upload.single("cv"), applyToPost);

// 2. Obtener lista de postulantes (USA SOLO ESTA LÍNEA)
// Borré el bloque largo que tenías aquí porque ya tienes la lógica en el controller
router.get("/:id/applicants", verifyToken, getPostApplicants);

// 3. Actualizar status de postulante
router.put("/:id/applicants/:applicantId/status", verifyToken, updateApplicantStatus);


export default router;
