import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Acceso no autorizado" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);


    // Guardamos el ID del usuario en la request
    req.userId = decoded.id;

    next();
  } catch (err) {
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
};
