// src/pages/CreatePost.jsx
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../Context/AuthContext";
import { Camera, MapPin, Tag, MessageSquare, Mail, Type, Image as ImageIcon, X } from 'lucide-react';
import toast from "react-hot-toast";

export default function CreatePost() {
    const navigate = useNavigate();
    const { user, token } = useAuthContext();
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        category: "",
        location: "",
        whatsapp: "",
        email: "",
    });

    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData((prev) => ({ ...prev, email: user.email }));
        }
    }, [user]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                return toast.error("La imagen es muy pesada (máx 5MB)");
            }
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const removeImage = () => {
        setImage(null);
        setPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!token) return toast.error("Debes iniciar sesión");
        if (!image) return toast.error("Por favor, sube una imagen para tu anuncio");

        setLoading(true);
        const loadingToast = toast.loading("Publicando tu anuncio...");

        try {
            const dataToSend = new FormData();
            Object.keys(formData).forEach(key => {
                dataToSend.append(key, formData[key]);
            });
            dataToSend.append("image", image);

            const res = await fetch(import.meta.env.VITE_API_URL + "/api/posts", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: dataToSend,
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Error al crear el post");

            toast.success("¡Anuncio publicado con éxito!", { id: loadingToast });
            navigate(`/ownerPostView/${data.post._id}`);

        } catch (err) {
            toast.error(err.message, { id: loadingToast });
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-zinc-200/50 text-center max-w-sm border border-zinc-100">
                    <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Mail size={32} />
                    </div>
                    <h2 className="text-xl font-black text-zinc-900 uppercase tracking-tighter mb-2">Acceso Requerido</h2>
                    <p className="text-zinc-500 text-sm font-medium mb-6">Debes iniciar sesión para publicar y gestionar tus servicios profesionales.</p>
                    <button onClick={() => navigate("/login")} className="w-full bg-zinc-900 text-amber-400 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-zinc-800 transition-all">Ir al Login</button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-12">
            <div className="mb-12">
                <h1 className="text-4xl md:text-5xl font-black text-zinc-900 tracking-tighter uppercase italic">Crear Nuevo Anuncio</h1>
                <p className="text-zinc-500 font-bold text-sm mt-2 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-8 h-[2px] bg-amber-400"></span>
                    Impulsa tu trabajo hoy mismo
                </p>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* COLUMNA IZQUIERDA: CARGA DE IMAGEN */}
                <div className="lg:col-span-1">
                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3 ml-2">Imagen de Portada</label>
                    <div
                        onClick={() => !preview && fileInputRef.current.click()}
                        className={`relative aspect-[4/5] rounded-[2.5rem] border-4 border-dashed transition-all overflow-hidden flex flex-col items-center justify-center cursor-pointer
                            ${preview ? 'border-transparent shadow-2xl' : 'border-zinc-200 bg-zinc-50 hover:bg-zinc-100 hover:border-amber-300'}`}
                    >
                        {preview ? (
                            <>
                                <img src={preview} className="w-full h-full object-cover" alt="Preview" />
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); removeImage(); }}
                                    className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-xl shadow-xl hover:scale-110 transition-transform"
                                >
                                    <X size={20} />
                                </button>
                            </>
                        ) : (
                            <div className="text-center p-6">
                                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4 text-zinc-400">
                                    <Camera size={32} />
                                </div>
                                <p className="text-zinc-900 font-black text-[10px] uppercase tracking-widest">Click para subir</p>
                                <p className="text-zinc-400 text-[9px] font-bold mt-1 uppercase">JPG, PNG (Máx 5MB)</p>
                            </div>
                        )}
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
                </div>

                {/* COLUMNA DERECHA: DATOS */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-8 md:p-10 rounded-[3rem] shadow-xl shadow-zinc-200/50 border border-zinc-100 space-y-6">

                        {/* Título */}
                        <div className="relative">
                            <label className="flex items-center gap-2 text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-2">
                                <Type size={14} className="text-amber-500" /> Título Profesional
                            </label>
                            <input
                                type="text"
                                name="title"
                                required
                                placeholder="Ej: Servicio de Electricidad Matriculado"
                                className="w-full bg-zinc-50 border-2 border-zinc-50 rounded-2xl px-6 py-4 focus:border-amber-400 focus:bg-white outline-none transition-all font-bold text-zinc-700 placeholder:text-zinc-300"
                                onChange={handleChange}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Categoría */}
                            <div className="relative">
                                <label className="flex items-center gap-2 text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-2">
                                    <Tag size={14} className="text-amber-500" /> Categoría
                                </label>
                                <select
                                    name="category"
                                    required
                                    className="w-full bg-zinc-50 border-2 border-zinc-50 rounded-2xl px-6 py-4 focus:border-amber-400 focus:bg-white outline-none transition-all font-bold text-zinc-700 appearance-none cursor-pointer"
                                    onChange={handleChange}
                                >
                                    <option value="">Seleccionar...</option>
                                    <option value="carpintería">Carpintería</option>
                                    <option value="pintura">Pintura</option>
                                    <option value="jardinería">Jardinería</option>
                                    <option value="mudanza">Mudanza</option>
                                    <option value="electricidad">Electricidad</option>
                                    <option value="limpieza">Limpieza</option>
                                </select>
                            </div>

                            {/* Ubicación */}
                            <div className="relative">
                                <label className="flex items-center gap-2 text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-2">
                                    <MapPin size={14} className="text-amber-500" /> Ubicación
                                </label>
                                <input
                                    type="text"
                                    name="location"
                                    required
                                    placeholder="Ej: Buenos Aires, AR"
                                    className="w-full bg-zinc-50 border-2 border-zinc-50 rounded-2xl px-6 py-4 focus:border-amber-400 focus:bg-white outline-none transition-all font-bold text-zinc-700 placeholder:text-zinc-300"
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Descripción */}
                        <div className="relative">
                            <label className="flex items-center gap-2 text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-2">
                                <MessageSquare size={14} className="text-amber-500" /> Descripción del Servicio
                            </label>
                            <textarea
                                name="description"
                                required
                                rows="4"
                                placeholder="Explica detalladamente qué servicios ofreces..."
                                className="w-full bg-zinc-50 border-2 border-zinc-50 rounded-2xl px-6 py-4 focus:border-amber-400 focus:bg-white outline-none transition-all font-bold text-zinc-700 placeholder:text-zinc-300 resize-none"
                                onChange={handleChange}
                            ></textarea>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* WhatsApp */}
                            <div className="relative">
                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-2 block">WhatsApp</label>
                                <input
                                    type="text"
                                    name="whatsapp"
                                    placeholder="+54 9 11 ..."
                                    className="w-full bg-zinc-50 border-2 border-zinc-50 rounded-2xl px-6 py-4 focus:border-amber-400 focus:bg-white outline-none transition-all font-bold text-zinc-700 placeholder:text-zinc-300"
                                    onChange={handleChange}
                                />
                            </div>

                            {/* Email */}
                            <div className="relative">
                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-2 block">Email Público</label>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    value={formData.email}
                                    readOnly
                                    className="w-full bg-zinc-100 border-2 border-transparent rounded-2xl px-6 py-4 text-zinc-400 font-bold outline-none cursor-not-allowed"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl transition-all
                                ${loading
                                    ? "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                                    : "bg-amber-400 text-zinc-900 hover:bg-zinc-900 hover:text-amber-400 shadow-amber-200/50"
                                }`}
                        >
                            {loading ? "Procesando..." : "Publicar Anuncio Profesional"}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}