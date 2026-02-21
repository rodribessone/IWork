import mongoose from 'mongoose';
import Post from "../models/Post.js";
import Conversation from "../models/Conversation.js";

// --- CREATE POST ---
export const createPost = async (req, res) => {
  try {
    console.log("📥 Datos recibidos:", req.body);
    console.log("👤 Usuario ID:", req.userId);

    const {
      title,
      description,
      category,
      location,
      whatsapp,
      email,
    } = req.body;

    // La URL la pone Cloudinary en req.file, NO en req.body
    const imageUrl = req.file?.path || req.file?.secure_url || null;

    if (!imageUrl) {
      return res.status(400).json({ error: "La imagen es obligatoria" });
    }

    const newPost = new Post({
      title,
      description,
      category,
      location,
      whatsapp,
      email,
      imageUrl,
      user: req.userId,
    });

    await newPost.save();

    res.status(201).json({
      message: "Post creado con éxito",
      post: newPost
    });

  } catch (err) {
    console.error("❌ Error al crear el post:", err);
    res.status(500).json({ error: err.message || "Error al crear el post" });
  }
};

// --- APPLY TO POST (CORREGIDO) ---
export const applyToPost = async (req, res) => {
  try {
    // 🚨 CORRECCIÓN CLAVE: El userId viene de la request, no de la conversión
    const userId = String(req.userId);
    const { message } = req.body;
    const { id: postId } = req.params;

    if (!req.file) {
      return res.status(400).json({ message: "Es obligatorio adjuntar un CV" });
    }
    const cvUrl = req.file.path || req.file.secure_url;

    // 🚨 LÍNEA CRÍTICA: Aquí se define la variable 'post'
    const post = await Post.findById(postId);

    // Validamos si el post existe inmediatamente después de la búsqueda
    if (!post) {
      // Si no se encuentra el post, devolvemos el error y salimos del try
      return res.status(404).json({ message: "Post no encontrado" });
    }

    // Defensive check: Initialize applicants if undefined
    if (!post.applicants) {
      post.applicants = [];
    }

    // 🧹 LIMPIEZA DE DATOS CORRUPTOS:
    // Filtramos cualquier postulante que no tenga usuario (esto arregla el error "applicants.0.user: Path `user` is required" si había basura en la BD)
    post.applicants = post.applicants.filter(app => app.user);

    // Validación extra: Asegurarnos de que tenemos un userId válido
    if (!userId || userId === "undefined") {
      console.error("❌ Error CRÍTICO: req.userId no definido o inválido en applyToPost");
      return res.status(500).json({ error: "Error interno: Usuario no identificado correctamente." });
    }

    // Evitar doble postulación: convertimos a.user a string para asegurar la comparación
    const alreadyApplied = post.applicants.some(a => a.user && String(a.user) === userId);

    if (alreadyApplied) {
      return res.status(400).json({ message: "Ya estás postulado" });
    }

    // Guardar postulación
    post.applicants.push({
      user: userId,
      message,
      cvUrl,
      date: new Date(),
      status: "pending"
    });

    await post.save();

    res.json({ message: "Postulación enviada con éxito" });

  } catch (err) {
    console.error("❌ Error en applyToPost:", err);
    res.status(500).json({ error: err.message });
  }
};

// --- GET POST APPLICANTS ---
export const getPostApplicants = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id)
      .populate("applicants.user", "name email avatar skills");

    if (!post) return res.status(404).json({ message: "Post no encontrado" });

    // Usamos String() para asegurar la comparación de IDs
    if (String(post.user) !== String(req.userId)) {
      return res.status(403).json({ message: "No autorizado" });
    }

    res.json(post.applicants);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// --- UPDATE APPLICANT STATUS ---
export const updateApplicantStatus = async (req, res) => {
  try {
    const { id: postId, applicantId } = req.params;
    const { status } = req.body; // "accepted" o "rejected"

    // ... (Código de validación y seguridad, que ya tienes) ...
    const post = await Post.findById(postId); // <--- ESTO DEBE ESTAR ANTES DE USAR 'post'

    if (!post) {
      return res.status(404).json({ message: "Post no encontrado" });
    }
    if (String(post.user) !== String(req.userId)) {
      return res.status(403).json({ message: "No autorizado" });
    }

    const applicant = post.applicants.id(applicantId);
    if (!applicant) return res.status(404).json({ message: "Postulante no encontrado" });

    applicant.status = status;

    if (status === "accepted") {

      const employerObjectId = new mongoose.Types.ObjectId(req.userId);
      const employeeObjectId = new mongoose.Types.ObjectId(applicant.user);
      const participantsArray = [employerObjectId, employeeObjectId];

      console.log("👷 Creando chat entre:", employerObjectId, "y", employeeObjectId);

      // 🚨 CAMBIO CLAVE: PRIMER PASO - BUSCAR
      let conversation = await Conversation.findOne({
        participants: { $all: participantsArray }
      });

      // 🚨 SEGUNDO PASO: SI NO EXISTE, CREAR
      if (!conversation) {
        conversation = await Conversation.create({
          participants: participantsArray,
          postId: postId,
          // Puedes inicializar otros campos aquí si es necesario
        });
        console.log(`✨ Nueva conversación creada: ${conversation._id}`);
      } else {
        console.log(`✅ Conversación existente encontrada: ${conversation._id}`);
      }

      await post.save();

      return res.json({
        message: "Estado actualizado y chat iniciado correctamente",
        status: "accepted",
        conversationId: conversation._id
      });
    }

    // Si es rejected u otro estado
    await post.save();
    res.json({ message: "Estado actualizado correctamente" });

  } catch (err) {
    console.error("❌ Error CRÍTICO en updateApplicantStatus:", err);
    res.status(500).json({ error: err.message });
  }
};

// --- GET ALL POSTS ---
export const getPosts = async (req, res) => {
  try {
    // El secreto está en .populate()
    // Traemos el post y le pedimos a Mongoose que busque el "user" 
    // y nos traiga solo el name y el email.
    const posts = await Post.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 }); // Los más nuevos primero

    res.status(200).json(posts);
  } catch (err) {
    console.error("❌ Error al obtener posts:", err);
    res.status(500).json({ error: "Error al obtener los posts" });
  }
};

// --- GET SINGLE POST (Si tienes una ruta para ver detalle) ---
export const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("user", "name email");

    if (!post) return res.status(404).json({ message: "Post no encontrado" });
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};