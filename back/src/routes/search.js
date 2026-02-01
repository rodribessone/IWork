import express from "express";
import User from "../models/User.js";
import Post from "../models/Post.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const query = req.query.q || "";

    // Si no enviaron nada
    if (query.trim() === "") {
      return res.json({ users: [], posts: [] });
    }

    const regex = new RegExp(query, "i"); // "i" = case insensitive

    // Buscar usuarios por nombre
    const users = await User.find(
      { name: regex },
      "_id name imageUrl isVerified"
    );

    // Buscar posts por título
    const posts = await Post.find(
      { title: regex },
      "_id title description category location imageUrl user createdAt"
    ).populate("user", "name imageUrl isVerified");

    res.json({ users, posts });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error en búsqueda" });
  }
});

export default router;
