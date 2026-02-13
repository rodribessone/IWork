import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

// Registro
router.post("/register", async (req, res) => {
  try {
    // 1. Extraemos los campos que enviamos desde el Register.jsx
    const { name, email, password, bio, location, role, profession, phone } = req.body;

    // 2. Validación manual extra (opcional pero recomendada)
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "El email ya está registrado" });
    }

    // 3. Hashear contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Crear el nuevo usuario con los campos mapeados correctamente
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      bio,      // Se guarda en el campo bio del modelo
      location, // Se guarda en el campo location del modelo
      profession,
      phone,
      role: role || "client", // Por defecto client si no viene nada
      // Seteamos valores por defecto para que 'experience' no de error si es requerida
      experience: {
        company: "",
        role: "",
        duration: "",
        description: ""
      }
    });

    await newUser.save();
    res.status(201).json({ message: "Usuario creado correctamente" });
  } catch (err) {
    console.error("Error en Server Register:", err); // Para que tú veas el error real en la consola del backend
    res.status(500).json({ message: "Error al crear el usuario", error: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Usuario no encontrado" });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(400).json({ error: "Contraseña incorrecta" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;
    res.json({ token, user: userWithoutPassword });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🚨 NUEVA RUTA: Obtener información del usuario por el token (fetchUserFromToken)
router.get("/me", verifyToken, async (req, res) => {
  try {
    // req.userId es establecido por el middleware verifyToken si el token es válido
    const user = await User.findById(req.userId).select('-password');

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Devolvemos el objeto de usuario (sin la contraseña)
    res.json({ user });
  } catch (err) {
    console.error("Error al validar token /me:", err);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

export default router;
