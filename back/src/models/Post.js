import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  location: { type: String, required: true },
  whatsapp: { type: String },
  email: { type: String, required: true },
  imageUrl: { type: String },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  applicants: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      message: { type: String, default: "" },
      cvUrl: {
        type: String,
        required: true, // Hacemos que la URL del CV sea obligatoria para postularse
      },
      date: { type: Date, default: Date.now },
      status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" }
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Post", postSchema);
