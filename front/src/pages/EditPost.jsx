import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthContext } from "../Context/AuthContext";
import {
  Save, ArrowLeft, Type, AlignLeft,
  Layers, MapPin, Phone, Mail, AlertCircle, Loader2
} from 'lucide-react';
import toast from "react-hot-toast";
import { useTranslation } from 'react-i18next';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[\+\d][\d\s\-\(\)]{6,}$/;

export default function EditPost() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const { token } = useAuthContext();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/posts/${id}`);
        if (!res.ok) throw new Error("Error loading post");
        const data = await res.json();
        setPost(data);
      } catch (err) {
        setError(t('common.error'));
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id, t]);

  const handleChange = (e) => {
    setPost({ ...post, [e.target.name]: e.target.value });
    setFieldErrors(prev => ({ ...prev, [e.target.name]: '' }));
  };

  const validate = () => {
    const errors = {};
    if (post.email && !EMAIL_REGEX.test(post.email))
      errors.email = t('validation.email_invalid');
    if (post.whatsapp && !PHONE_REGEX.test(post.whatsapp))
      errors.whatsapp = t('validation.phone_invalid');
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error(t('common.error'));
      return;
    }

    if (!validate()) return;
    setSaving(true);
    const loadingToast = toast.loading(t('common.loading'));

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/posts/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(post),
      });

      if (!res.ok) throw new Error("Error updating");

      toast.success(t('common.success'), { id: loadingToast });
      setTimeout(() => navigate("/profile"), 1500);
    } catch (err) {
      toast.error(t('common.error'), { id: loadingToast });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50">
      <Loader2 className="animate-spin text-amber-500" size={40} />
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 p-6">
      <AlertCircle className="text-red-500 mb-4" size={48} />
      <p className="text-zinc-800 font-bold text-xl">{error}</p>
      <button onClick={() => navigate(-1)} className="mt-4 text-amber-600 font-bold flex items-center gap-2">
        <ArrowLeft size={18} /> {t('common.back')}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-50/50 py-12 px-6">
      <div className="max-w-4xl mx-auto">

        {/* Header de Navegación */}
        <button
          onClick={() => navigate(-1)}
          className="group mb-8 flex items-center gap-2 text-zinc-400 hover:text-zinc-950 transition-colors font-bold uppercase text-[10px] tracking-[0.2em]"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          {t('common.back')}
        </button>

        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-zinc-200/50 border border-zinc-100 overflow-hidden">

          {/* Encabezado Visual */}
          <div className="bg-zinc-950 p-10 text-white relative">
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
            <div className="relative z-10">
              <h1 className="text-4xl font-black tracking-tighter uppercase mb-2">{t('post.edit_title')}</h1>
              <p className="text-zinc-400 font-medium">{t('post.edit_subtitle')}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} noValidate className="p-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

              {/* Columna Izquierda: Info Principal */}
              <div className="space-y-6">
                <h3 className="text-xs font-black text-amber-600 uppercase tracking-widest border-b border-zinc-100 pb-2">General Info</h3>

                <div className="space-y-4">
                  <div>
                    <label className="flex items-center gap-2 text-[11px] font-black text-zinc-400 uppercase tracking-wider mb-2">
                      <Type size={14} /> {t('post.title_label')}
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={post.title || ""}
                      onChange={handleChange}
                      placeholder="Ex: Professional Service"
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3.5 focus:ring-2 focus:ring-amber-400 outline-none transition-all font-medium text-zinc-800"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-[11px] font-black text-zinc-400 uppercase tracking-wider mb-2">
                      <Layers size={14} /> {t('post.category_label')}
                    </label>
                    <input
                      type="text"
                      name="category"
                      value={post.category || ""}
                      onChange={handleChange}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3.5 focus:ring-2 focus:ring-amber-400 outline-none transition-all font-medium text-zinc-800"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-[11px] font-black text-zinc-400 uppercase tracking-wider mb-2">
                      <AlignLeft size={14} /> {t('post.desc_label')}
                    </label>
                    <textarea
                      name="description"
                      value={post.description || ""}
                      onChange={handleChange}
                      rows="5"
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3.5 focus:ring-2 focus:ring-amber-400 outline-none transition-all font-medium text-zinc-800 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Columna Derecha: Contacto y Ubicación */}
              <div className="space-y-6">
                <h3 className="text-xs font-black text-amber-600 uppercase tracking-widest border-b border-zinc-100 pb-2">{t('profile.contact')}</h3>

                <div className="space-y-4">
                  <div>
                    <label className="flex items-center gap-2 text-[11px] font-black text-zinc-400 uppercase tracking-wider mb-2">
                      <MapPin size={14} /> {t('post.location_label')}
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={post.location || ""}
                      onChange={handleChange}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3.5 focus:ring-2 focus:ring-amber-400 outline-none transition-all font-medium text-zinc-800"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-[11px] font-black text-zinc-400 uppercase tracking-wider mb-2">
                      <Phone size={14} /> WhatsApp
                    </label>
                    <input
                      type="tel"
                      name="whatsapp"
                      value={post.whatsapp || ""}
                      onChange={handleChange}
                      placeholder="+61 4XX XXX XXX"
                      className={`w-full bg-zinc-50 border rounded-2xl px-4 py-3.5 focus:ring-2 outline-none transition-all font-medium text-zinc-800 ${fieldErrors.whatsapp ? 'border-red-400 bg-red-50 focus:ring-red-300' : 'border-zinc-200 focus:ring-amber-400'}`}
                    />
                    {fieldErrors.whatsapp && <p className="text-red-500 text-xs mt-1">{fieldErrors.whatsapp}</p>}
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-[11px] font-black text-zinc-400 uppercase tracking-wider mb-2">
                      <Mail size={14} /> {t('auth.email')}
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={post.email || ""}
                      onChange={handleChange}
                      className={`w-full bg-zinc-50 border rounded-2xl px-4 py-3.5 focus:ring-2 outline-none transition-all font-medium text-zinc-800 ${fieldErrors.email ? 'border-red-400 bg-red-50 focus:ring-red-300' : 'border-zinc-200 focus:ring-amber-400'}`}
                    />
                    {fieldErrors.email && <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>}
                  </div>
                </div>

                {/* Info Card de ayuda */}
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3 mt-6">
                  <AlertCircle size={20} className="text-amber-600 shrink-0" />
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    {t('post.edit_subtitle')}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer de Acciones */}
            <div className="mt-12 pt-8 border-t border-zinc-100 flex flex-col md:flex-row gap-4 justify-end">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest text-zinc-400 hover:text-zinc-950 transition-all"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-10 py-4 bg-amber-400 text-black rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-amber-300 transition-all shadow-xl shadow-amber-400/20 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Save size={18} />
                )}
                {t('post.update')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}