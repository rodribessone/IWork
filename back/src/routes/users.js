// routes/users.js
import express from "express";
import User from "../models/User.js";
import Post from "../models/Post.js";
import { getUsers, addPortfolioImages, updateUser, uploadAvatarController } from "../controllers/userController.js";
import { verifyToken } from "../middleware/verifyToken.js"; // Importas tu middleware
import { uploadPortfolio, uploadAvatar } from "../config/cloudinary.js"; //

const router = express.Router();

// Obtener usuarios filtrando por lookingForWork opcional
router.get("/", getUsers);

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
