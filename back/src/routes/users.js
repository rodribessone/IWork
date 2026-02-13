import mongoose from "mongoose";
import express from "express";
import User from "../models/User.js";
import Post from "../models/Post.js";
import { getUsers, addPortfolioImages, updateUser, uploadAvatarController } from "../controllers/userController.js";
import { verifyToken } from "../middleware/verifyToken.js"; // Importas tu middleware
import { uploadPortfolio, uploadAvatar } from "../config/cloudinary.js"; //

const router = express.Router();

// Obtener usuarios filtrando por lookingForWork opcional
router.get("/", getUsers);

// NUEVA RUTA: Obtener las postulaciones del usuario autenticado
router.get("/me/applications", verifyToken, async (req, res) => {
  try {
    // 1. Convertimos el string a un ObjectId real de MongoDB
    const userObjectId = new mongoose.Types.ObjectId(req.userId);

    const applications = await Post.find({
      $or: [
        // Busca si el ID está dentro del campo 'user' de los objetos del array
        { "applicants.user": userObjectId },
        // Busca si el ID está directamente en el array (para datos viejos)
        // Usamos $elemMatch para que Mongoose no intente validar el tipo de dato
        { "applicants": { $elemMatch: { $eq: userObjectId } } }
      ]
    })
      .select("title category location applicants createdAt user")
      .populate("user", "name avatar")
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    console.error("ERROR EN GET APPLICATIONS:", error);
    res.status(500).json({
      message: "Error interno",
      error: error.message
    });
  }
});

// Obtener un usuario por ID
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).lean();
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    // Traer también los posts del usuario
    const posts = await Post.find({ user: req.params.id }).lean();

    res.json({
      ...user,
      posts,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al obtener usuario" });
  }
});

router.post("/portfolio", verifyToken, uploadPortfolio.array("images", 5), addPortfolioImages);

router.post("/upload-avatar", verifyToken, uploadAvatar.single("image"), uploadAvatarController);

router.put("/:id", verifyToken, updateUser);

router.delete("/portfolio", verifyToken, async (req, res) => {
  try {
    const { imageUrl } = req.body;
    if (!req.userId) {
      return res.status(401).json({ message: "No autorizado: Usuario no identificado" });
    }

    // Usamos el ID que tu middleware guarde (revisa si es id o _id)
    const userId = req.userId;
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $pull: { portfolio: imageUrl } }, // Elimina la URL exacta del array
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json({ message: "Foto eliminada", portfolio: updatedUser.portfolio });
  } catch (error) {
    console.error("Error en DELETE /portfolio:", error);
    res.status(500).json({ message: "Error al eliminar la foto" });
  }
});



export default router;
