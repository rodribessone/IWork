import User from "../models/User.js";

export const getUsers = async (req, res) => {
  try {
    const { lookingForWork, profession, location } = req.query;

    let filter = {};
    if (lookingForWork === "true") filter.lookingForWork = true;
    if (profession) {
      filter.$or = [
        { profession: { $regex: profession, $options: "i" } },
        { skills: { $regex: profession, $options: "i" } }
      ];
    }
    if (location) filter.location = { $regex: location, $options: "i" };

    const users = await User.find(filter);

    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const addPortfolioImages = async (req, res) => {
  try {
    // El ID viene del middleware de autenticación (suponiendo que usas uno)
    const userId = req.userId;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No se subieron imágenes" });
    }

    // Obtenemos las URLs que Multer + Cloudinary generaron
    const newImages = req.files.map(file => file.path);

    // Actualizamos el usuario agregando las nuevas fotos al array existente
    const user = await User.findByIdAndUpdate(
      userId,
      { $push: { portfolio: { $each: newImages } } },
      { new: true, upsert: true }
    );

    res.json({ message: "Galería actualizada con éxito", portfolio: user.portfolio });
  } catch (err) {
    console.log("DETALLE DEL ERROR:", err); // console.log imprime mejor los objetos que console.error en algunos casos
    res.status(500).json({ error: err.message, stack: err.stack });
  }
};


export const updateUser = async (req, res) => {
  try {
    // Verificamos que el usuario que edita sea el mismo del token
    if (req.params.id !== req.userId) {
      return res.status(403).json({ message: "No tienes permiso para editar este perfil" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: req.body }, // Esto tomará name, profession, experience, location, etc.
      { new: true }
    ).select("-password");

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const uploadAvatarController = async (req, res) => {
  try {
    const userId = req.userId;

    if (!req.file) {
      return res.status(400).json({ message: "No se recibió ninguna imagen" });
    }

    // La URL de la imagen en Cloudinary
    const imageUrl = req.file.path;

    // Actualizamos el usuario en la BD
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { avatar: imageUrl } },
      { new: true }
    ).select("-password");

    res.json({
      message: "Foto de perfil actualizada",
      imageUrl: user.avatar
    });
  } catch (err) {
    console.error("Error en uploadAvatar:", err);
    res.status(500).json({ error: "Error interno al subir el avatar" });
  }
};