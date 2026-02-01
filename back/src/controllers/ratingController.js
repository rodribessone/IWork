import User from "../models/User.js";
import Post from "../models/Post.js";

export const rateUser = async (req, res) => {
  try {
    const { userId } = req.params;     // usuario que recibe la valoración
    const { postId, stars, review } = req.body;
    const ratedBy = req.userId;        // usuario que hace la valoración

    // 1️⃣ Validar estrellas
    if (!stars || stars < 1 || stars > 5) {
      return res.status(400).json({ message: "Las estrellas deben ser entre 1 y 5" });
    }

    // 2️⃣ Validar que el post exista
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post no encontrado" });

    // 3️⃣ Usuario a valorar
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    // 4️⃣ Agregar valoración
    user.ratings.push({
      postId,
      ratedBy,
      type: post.type, // "job" | "profile"
      stars,
      review
    });

    await user.save();

    res.json({ message: "Valoración registrada con éxito" });

  } catch (err) {
    console.error("Error al valorar usuario:", err);
    res.status(500).json({ error: err.message });
  }
};
