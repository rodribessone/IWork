import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post", default: null },
  fromUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  stars: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  avatar: { type: String, default: "" },
  location: { type: String, default: "" },
  skills: [String],
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
  ratings: [ratingSchema], // 🔹 Un solo campo de valoraciones
  verified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});
userSchema.index({ profession: "text", skills: "text", bio: "text" }); // Búsqueda de texto
userSchema.index({ location: 1 }); // Índice normal para filtros por ciudad


export default mongoose.model("User", userSchema);
