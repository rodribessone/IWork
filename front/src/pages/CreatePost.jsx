// src/pages/CreatePost.jsx
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../Context/AuthContext";
import { Camera, MapPin, Tag, MessageSquare, Mail, Type, X } from 'lucide-react';
import toast from "react-hot-toast";
import { useTranslation } from 'react-i18next';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[\+\d][\d\s\-\(\)]{6,}$/;

export default function CreatePost() {
    const { t } = useTranslation();
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
    const [fieldErrors, setFieldErrors] = useState({});

    useEffect(() => {
        if (user) {
            setFormData((prev) => ({ ...prev, email: user.email }));
        }
    }, [user]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                return toast.error("Max 5MB");
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
        setFieldErrors(prev => ({ ...prev, [e.target.name]: '' }));
    };

    const validate = () => {
        const errors = {};
        if (formData.whatsapp && !PHONE_REGEX.test(formData.whatsapp))
            errors.whatsapp = t('validation.phone_invalid');
        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!token) return toast.error(t('common.error'));
        if (!image) return toast.error(t('common.required'));
        if (!validate()) return;

        setLoading(true);
        const loadingToast = toast.loading(t('common.loading'));

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
            if (!res.ok) throw new Error(data.message || "Error");

            toast.success(t('common.success'), { id: loadingToast });
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
                    <h2 className="text-xl font-black text-zinc-900 uppercase tracking-tighter mb-2">{t('auth.login_button')}</h2>
                    <p className="text-zinc-500 text-sm font-medium mb-6">{t('validation.field_required')}</p>
                    <button onClick={() => navigate("/login")} className="w-full bg-zinc-900 text-amber-400 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-zinc-800 transition-all">{t('auth.login_button')}</button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-12">
            <div className="mb-12">
                <h1 className="text-4xl md:text-5xl font-black text-zinc-900 tracking-tighter uppercase italic">{t('post.create_title')}</h1>
                <p className="text-zinc-500 font-bold text-sm mt-2 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-8 h-[2px] bg-amber-400"></span>
                    {t('post.boost_subtitle')}
                </p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* COLUMNA IZQUIERDA: CARGA DE IMAGEN */}
                <div className="lg:col-span-1">
                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3 ml-2">{t('post.cover_image')}</label>
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
                                <p className="text-zinc-900 font-black text-[10px] uppercase tracking-widest">{t('post.click_to_upload')}</p>
                                <p className="text-zinc-400 text-[9px] font-bold mt-1 uppercase">{t('post.upload_hint')}</p>
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
                                <Type size={14} className="text-amber-500" /> {t('post.title_label')}
                            </label>
                            <input
                                type="text"
                                name="title"
                                required
                                placeholder="Ex: Professional Electrician Service"
                                className="w-full bg-zinc-50 border-2 border-zinc-50 rounded-2xl px-6 py-4 focus:border-amber-400 focus:bg-white outline-none transition-all font-bold text-zinc-700 placeholder:text-zinc-300"
                                onChange={handleChange}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Categoría */}
                            <div className="relative">
                                <label className="flex items-center gap-2 text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-2">
                                    <Tag size={14} className="text-amber-500" /> {t('post.category_label')}
                                </label>
                                <select
                                    name="category"
                                    required
                                    className="w-full bg-zinc-50 border-2 border-zinc-50 rounded-2xl px-6 py-4 focus:border-amber-400 focus:bg-white outline-none transition-all font-bold text-zinc-700 appearance-none cursor-pointer"
                                    onChange={handleChange}
                                >
                                    <option value="">{t('post.select_category')}</option>
                                    {Object.entries(t('post.categories', { returnObjects: true })).map(([value, label]) => (
                                        <option key={value} value={value}>{label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Ubicación */}
                            <div className="relative">
                                <label className="flex items-center gap-2 text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-2">
                                    <MapPin size={14} className="text-amber-500" /> {t('post.location_label')}
                                </label>
                                <input
                                    type="text"
                                    name="location"
                                    required
                                    placeholder="Ex: Buenos Aires, AR"
                                    className="w-full bg-zinc-50 border-2 border-zinc-50 rounded-2xl px-6 py-4 focus:border-amber-400 focus:bg-white outline-none transition-all font-bold text-zinc-700 placeholder:text-zinc-300"
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Descripción */}
                        <div className="relative">
                            <label className="flex items-center gap-2 text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-2">
                                <MessageSquare size={14} className="text-amber-500" /> {t('post.desc_label')}
                            </label>
                            <textarea
                                name="description"
                                required
                                rows="4"
                                placeholder="..."
                                className="w-full bg-zinc-50 border-2 border-zinc-50 rounded-2xl px-6 py-4 focus:border-amber-400 focus:bg-white outline-none transition-all font-bold text-zinc-700 placeholder:text-zinc-300 resize-none"
                                onChange={handleChange}
                            ></textarea>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* WhatsApp */}
                            <div className="relative">
                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-2 block">WhatsApp</label>
                                <input
                                    type="tel"
                                    name="whatsapp"
                                    placeholder="+61 4XX XXX XXX"
                                    className={`w-full bg-zinc-50 border-2 rounded-2xl px-6 py-4 focus:bg-white outline-none transition-all font-bold text-zinc-700 placeholder:text-zinc-300 ${fieldErrors.whatsapp ? 'border-red-400 bg-red-50' : 'border-zinc-50 focus:border-amber-400'}`}
                                    onChange={handleChange}
                                />
                                {fieldErrors.whatsapp && <p className="text-red-500 text-xs mt-1 ml-2">{fieldErrors.whatsapp}</p>}
                            </div>

                            {/* Email */}
                            <div className="relative">
                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-2 block">{t('auth.email')}</label>
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
                            {loading ? t('common.loading') : t('post.publish')}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}