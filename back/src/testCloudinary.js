
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ajusta la ruta al .env si es necesario (el script está en back/src/scripts normalmente, pero lo pondremos en back/src para simplificar)
dotenv.config({ path: path.join(__dirname, '../.env') });

console.log("Checking Cloudinary Config...");
console.log("Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME);

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

cloudinary.api.ping()
    .then(res => {
        console.log("✅ Cloudinary Ping Successful:", res);
    })
    .catch(err => {
        console.error("❌ Cloudinary Ping Failed:", err);
    });
