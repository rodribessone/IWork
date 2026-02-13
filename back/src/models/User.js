import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["client", "worker"], default: "client" }, // Nuevo campo role
  avatar: { type: String, default: "" },
  location: { type: String, default: "" },
  skills: [String],
  hasTools: { type: Boolean, default: false },
  hasInsurance: { type: Boolean, default: false },
  coverageArea: { type: String, default: "" },
  phone: { type: String, default: "" },
  profession: { type: String, default: "" },  // agregado
  bio: { type: String, default: "" },
  experience: [{
    company: { type: String, default: "" },
    role: { type: String, default: "" },
    duration: { type: String, default: "" },
    description: { type: String, default: "" }
  }],
  portfolio: { type: [String], default: [] },
  lookingForWork: { type: Boolean, default: true }, // agregado
  rating: { type: Number, default: 0 }, // Promedio (ej: 4.5)
  reviewsCount: { type: Number, default: 0 }, // Cantidad total (ej: 10)

  verified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});
userSchema.index({ profession: "text", skills: "text", bio: "text" }); // Búsqueda de texto
userSchema.index({ location: 1 }); // Índice normal para filtros por ciudad


export default mongoose.model("User", userSchema);
