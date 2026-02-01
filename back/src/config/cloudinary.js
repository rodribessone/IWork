import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv'; // 🚨 IMPORTAR dotenv
dotenv.config();           // 🚨 INICIALIZAR dotenv AQUÍ

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'cvs_iwork',
        allowed_formats: ['pdf', 'doc', 'docx'], // Solo permitimos estos formatos
        resource_type: 'raw', // Importante para que Cloudinary no trate al PDF como imagen
    },
});

const portfolioStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'portfolio_iwork',
        // allowed_formats: ['jpg', 'png', 'jpeg'], // Solo imágenes
        // No ponemos resource_type: 'raw' aquí para que Cloudinary las trate como fotos
    },
});

const postStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'posts_iwork', // Carpeta específica para los anuncios
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
        transformation: [{ width: 800, height: 600, crop: 'limit' }] // Opcional: Redimensiona para ahorrar espacio
    },
});

const avatarStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'avatars_iwork',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
        transformation: [{ width: 250, height: 250, crop: 'fill', gravity: 'face' }] // Recorta centrándose en la cara
    },
});

export const uploadAvatar = multer({ storage: avatarStorage });
export const uploadPostImage = multer({ storage: postStorage });
export const upload = multer({ storage });
export const uploadPortfolio = multer({ storage: portfolioStorage });