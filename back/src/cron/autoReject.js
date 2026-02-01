import cron from "node-cron";
import Post from "../models/Post.js";

// Configura cuántos días deben pasar para auto-rechazar
const DAYS_LIMIT = 14;

cron.schedule("0 3 * * *", async () => {
  // Corre todos los días a las 3 AM
  console.log("⏳ Ejecutando cron: revisión de postulaciones...");

  try {
    const posts = await Post.find();

    const now = new Date();

    for (const post of posts) {
      let updated = false;

      post.applicants = post.applicants.map(applicant => {
        if (!applicant.status) applicant.status = "pending";

        if (applicant.status === "pending") {
          const diffDays = Math.floor((now - applicant.date) / (1000 * 60 * 60 * 24));

          if (diffDays >= DAYS_LIMIT) {
            applicant.status = "auto_rejected";
            updated = true;
          }
        }

        return applicant;
      });

      if (updated) {
        await post.save();
        console.log(`🔻 Postulaciones auto-rechazadas en el post: ${post._id}`);
      }
    }

    console.log("✔️ Cron finalizado.");

  } catch (err) {
    console.error("❌ Error en el cron de auto-rechazo:", err);
  }
});
