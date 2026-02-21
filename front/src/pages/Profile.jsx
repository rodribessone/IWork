import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from '../Context/AuthContext';
import {
  User, MapPin, Briefcase, Plus, Trash2, Edit3,
  Check, X, Camera, Image as ImageIcon, LayoutGrid, Settings, Megaphone,
  ShieldCheck, Wrench, Truck, Star
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export default function Profile() {
  const { t } = useTranslation();
  const [posts, setPosts] = useState([]);
  const [reviews, setReviews] = useState([]); // Nuevo estado para reseñas
  const [user, setUser] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [animate, setAnimate] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showPhotoConfirm, setShowPhotoConfirm] = useState(false);
  const [photoToDelete, setPhotoToDelete] = useState(null);
  const [animatePhoto, setAnimatePhoto] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    profession: "",
    experience: [],
    location: "",
    avatar: "",
    skills: [],
    bio: "",
    phone: "",
    hasTools: false,
    hasInsurance: false,
    coverageArea: ""
  });

  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { user: loggedInUser, token } = useAuthContext();
  const defaultAvatar = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";

  useEffect(() => {
    const userId = loggedInUser?._id;
    if (!userId) return;

    const fetchProfile = async () => {
      try {
        const resUser = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${userId}`);
        const dataUser = await resUser.json();
        setUser(dataUser);
        setFormData({
          name: dataUser.name || "",
          profession: dataUser.profession || "",
          experience: Array.isArray(dataUser.experience) ? dataUser.experience : [],
          location: dataUser.location || "",
          avatar: dataUser.avatar || "",
          skills: dataUser.skills || [],
          bio: dataUser.bio || "",
          phone: dataUser.phone || "",
          hasTools: dataUser.hasTools || false,
          hasInsurance: dataUser.hasInsurance || false,
          coverageArea: dataUser.coverageArea || ""
        });

        const resPosts = await fetch(`${import.meta.env.VITE_API_URL}/api/posts/user/${userId}`);
        const dataPosts = await resPosts.json();
        setPosts(dataPosts);

        // Traer reseñas recibidas
        const resReviews = await fetch(`${import.meta.env.VITE_API_URL}/api/reviews/user/${userId}`);
        const dataReviews = await resReviews.json();
        setReviews(dataReviews);

      } catch (err) {
        console.error("Error loading profile:", err);
      }
    };

    fetchProfile();
  }, [loggedInUser]);

  // --- LOGICA DE AVATAR Y PORTAFOLIO ---
  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const loadingToast = toast.loading(t('profile.updating_photo'));
    const data = new FormData();
    data.append("image", file);
    try {
      const res = await fetch(import.meta.env.VITE_API_URL + "/api/users/upload-avatar", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: data,
      });
      if (!res.ok) throw new Error();
      const result = await res.json();
      setFormData(prev => ({ ...prev, avatar: result.imageUrl }));
      setUser(prev => ({ ...prev, avatar: result.imageUrl }));
      toast.success(t('profile.photo_updated'), { id: loadingToast });
    } catch (err) { toast.error(t('common.error'), { id: loadingToast }); }
  };

  const handlePortfolioUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    const loadingToast = toast.loading(t('profile.uploading_images'));
    setUploading(true);
    const data = new FormData();
    files.forEach(file => data.append("images", file));
    try {
      const res = await fetch(import.meta.env.VITE_API_URL + "/api/users/portfolio", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: data,
      });
      const result = await res.json();
      setUser({ ...user, portfolio: result.portfolio });
      toast.success(t('profile.gallery_updated'), { id: loadingToast });
    } catch (err) { toast.error(t('common.error'), { id: loadingToast }); }
    finally { setUploading(false); }
  };

  const executeDeletePhoto = async () => {
    const loadingToast = toast.loading(t('common.loading'));
    try {
      const res = await fetch(import.meta.env.VITE_API_URL + "/api/users/portfolio", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ imageUrl: photoToDelete }),
      });
      setUser({ ...user, portfolio: user.portfolio.filter(img => img !== photoToDelete) });
      toast.success(t('common.success'), { id: loadingToast });
      closePhotoModal();
    } catch (err) { toast.error(t('common.error')); }
  };

  // --- LOGICA DE PERFIL Y SKILLS ---
  const handleSaveProfile = async () => {
    try {
      const cleanedSkills = formData.skills.map(s => s.trim()).filter(s => s !== "");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${user._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...formData, skills: cleanedSkills }),
      });
      if (!res.ok) throw new Error("Error updating");

      const updatedUser = await res.json();
      setUser(updatedUser);
      setFormData(prev => ({ ...prev, skills: cleanedSkills }));
      setEditMode(false);
      toast.success(t('profile.saved_success'));
    } catch (err) { toast.error(t('common.error')); }
  };

  const addSkill = () => setFormData({ ...formData, skills: [...formData.skills, ""] });
  const removeSkill = (index) => setFormData({ ...formData, skills: formData.skills.filter((_, i) => i !== index) });
  const handleSkillChange = (idx, val) => {
    const up = [...formData.skills]; up[idx] = val;
    setFormData({ ...formData, skills: up });
  };

  // --- LOGICA DE POSTS ---
  const deletePost = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/posts/${postToDelete}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      setPosts(posts.filter((p) => p._id !== postToDelete));
      toast.success(t('profile.post_deleted'));
      closeModal();
    } catch (err) { toast.error(t('common.error')); }
  };

  const confirmDelete = (id) => { setPostToDelete(id); setShowConfirm(true); setTimeout(() => setAnimate(true), 10); };
  const closeModal = () => { setAnimate(false); setTimeout(() => setShowConfirm(false), 300); };
  const confirmDeletePhoto = (url) => { setPhotoToDelete(url); setShowPhotoConfirm(true); setTimeout(() => setAnimatePhoto(true), 10); };
  const closePhotoModal = () => { setAnimatePhoto(false); setTimeout(() => setShowPhotoConfirm(false), 300); };

  if (!user) return <div className="min-h-screen flex items-center justify-center font-black text-zinc-400 uppercase tracking-widest text-xs">{t('profile.loading_panel')}</div>;

  return (
    <div className="min-h-screen bg-zinc-50/50 pb-20 px-4 pt-8">
      <div className="max-w-6xl mx-auto">

        {/* HEADER PREMIUM */}
        <div className="bg-white rounded-[3rem] shadow-xl shadow-zinc-200/50 overflow-hidden border border-zinc-100 relative">
          <div className="h-40 bg-zinc-900 relative">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-amber-400 via-transparent to-transparent"></div>

            {/* Botones de Edición - Posición Responsive Mejorada */}
            <div className="absolute top-4 right-4 md:top-6 md:right-8 flex gap-3 z-10">
              {!editMode ? (
                <button onClick={() => setEditMode(true)} className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-4 py-2 md:px-6 md:py-2.5 rounded-2xl border border-white/20 font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2">
                  <Edit3 size={14} /> <span className="hidden sm:inline">{t('profile.edit_profile')}</span>
                </button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={handleSaveProfile} className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 md:px-6 md:py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg transition-all flex items-center gap-2">
                    <Check size={14} /> <span className="hidden sm:inline">{t('common.save')}</span>
                  </button>
                  <button onClick={() => setEditMode(false)} className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-4 py-2 md:px-6 md:py-2.5 rounded-2xl border border-white/20 font-black text-[10px] uppercase tracking-widest transition-all">
                    {t('common.cancel')}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="px-6 md:px-10 pb-10 flex flex-col md:flex-row items-center md:items-end gap-8 -mt-16 relative">
            <div className="relative group">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] border-[6px] border-white shadow-2xl overflow-hidden bg-zinc-100">
                <img
                  src={formData.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=18181b&color=fbbf24&size=256&bold=true`}
                  className="w-full h-full object-cover"
                  alt={user.name}
                  onError={(e) => { e.target.src = defaultAvatar; }}
                />
              </div>
              {editMode && (
                <button onClick={() => fileInputRef.current.click()} className="absolute bottom-1 right-1 bg-amber-400 text-zinc-900 p-2.5 rounded-xl border-4 border-white shadow-xl hover:scale-110 transition-transform">
                  <Camera size={18} />
                  <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} className="hidden" accept="image/*" />
                </button>
              )}
            </div>

            <div className="flex-1 text-center md:text-left w-full">
              {editMode ? (
                <div className="space-y-3 max-w-md mx-auto md:mx-0">
                  <input className="text-3xl font-black text-zinc-900 border-b-2 border-amber-400 outline-none w-full bg-transparent uppercase tracking-tighter" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                  {user.role === 'worker' && (
                    <input className="text-amber-600 font-black uppercase text-[10px] tracking-widest block border-b border-zinc-200 outline-none w-full bg-transparent" placeholder={t('profile.profession_placeholder')} value={formData.profession} onChange={(e) => setFormData({ ...formData, profession: e.target.value })} />
                  )}
                  <input className="text-zinc-400 text-xs font-bold block border-b border-zinc-200 outline-none w-full bg-transparent uppercase" placeholder={t('profile.location_placeholder')} value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
                </div>
              ) : (
                <div className="mb-2">
                  <h1 className="text-3xl md:text-4xl font-black text-zinc-900 tracking-tighter uppercase">{user.name}</h1>
                  <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-2 items-center">
                    {user.role === 'worker' && (
                      <span className="bg-zinc-900 text-amber-400 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                        {t(`professions.${user.profession}`) !== `professions.${user.profession}` ? t(`professions.${user.profession}`) : user.profession}
                      </span>
                    )}
                    <span className="text-zinc-400 font-bold text-xs flex items-center gap-1 uppercase tracking-widest">
                      <MapPin size={14} className="text-amber-500" /> {user.location || t('profile.not_specified')}
                    </span>
                    {/* Estrellas (Rating) */}
                    <div className="flex items-center gap-1 bg-zinc-100 px-3 py-1 rounded-full">
                      <div className="flex text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={12} fill={i < Math.round(user.rating || 0) ? "currentColor" : "none"} className={i < Math.round(user.rating || 0) ? "" : "text-zinc-300"} />
                        ))}
                      </div>
                      <span className="text-[10px] font-black text-zinc-500">({user.reviewsCount || 0})</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* GRID PRINCIPAL */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10">

          {/* COLUMNA IZQUIERDA (Skills + Credenciales Worker) */}
          <div className="space-y-6">
            {user.role === 'worker' && (
              <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm">
                <h3 className="font-black text-zinc-900 uppercase tracking-widest text-[10px] flex items-center gap-2 mb-6">
                  <ShieldCheck size={16} className="text-amber-500" /> {t('profile.credentials')}
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Wrench size={18} className="text-zinc-400" />
                      <span className="text-xs font-bold text-zinc-600">{t('profile.tools')}</span>
                    </div>
                    {editMode ? (
                      <input
                        type="checkbox"
                        checked={formData.hasTools}
                        onChange={(e) => setFormData({ ...formData, hasTools: e.target.checked })}
                        className="w-5 h-5 accent-amber-400"
                      />
                    ) : (
                      formData.hasTools ? <Check size={18} className="text-green-500" /> : <X size={18} className="text-red-300" />
                    )}
                  </div>

                  <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <ShieldCheck size={18} className="text-zinc-400" />
                      <span className="text-xs font-bold text-zinc-600">{t('profile.insurance')}</span>
                    </div>
                    {editMode ? (
                      <input
                        type="checkbox"
                        checked={formData.hasInsurance}
                        onChange={(e) => setFormData({ ...formData, hasInsurance: e.target.checked })}
                        className="w-5 h-5 accent-amber-400"
                      />
                    ) : (
                      formData.hasInsurance ? <Check size={18} className="text-green-500" /> : <X size={18} className="text-red-300" />
                    )}
                  </div>

                  <div className="p-3 bg-zinc-50 rounded-xl">
                    <div className="flex items-center gap-3 mb-2">
                      <Truck size={18} className="text-zinc-400" />
                      <span className="text-xs font-bold text-zinc-600">{t('profile.coverage_area')}</span>
                    </div>
                    {editMode ? (
                      <input
                        className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-amber-400"
                        value={formData.coverageArea}
                        onChange={(e) => setFormData({ ...formData, coverageArea: e.target.value })}
                        placeholder={t('profile.coverage_placeholder')}
                      />
                    ) : (
                      <p className="text-xs font-bold text-zinc-800 pl-8">{formData.coverageArea || t('profile.not_specified')}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-black text-zinc-900 uppercase tracking-widest text-[10px] flex items-center gap-2">
                  <LayoutGrid size={16} className="text-amber-500" /> {t('profile.my_skills')}
                </h3>
                {editMode && <button onClick={addSkill} className="text-amber-500 hover:scale-110 transition-transform"><Plus size={20} /></button>}
              </div>
              <div className="flex flex-wrap gap-2">
                {(editMode ? formData.skills : user.skills)?.map((skill, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-zinc-50 text-zinc-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-zinc-100">
                    {editMode ? (
                      <input className="bg-transparent outline-none w-20" value={skill} onChange={(e) => handleSkillChange(idx, e.target.value)} />
                    ) : skill}
                    {editMode && <X size={14} className="text-red-400 cursor-pointer" onClick={() => removeSkill(idx)} />}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-amber-400 p-8 rounded-[2.5rem] shadow-lg shadow-amber-200/50 relative overflow-hidden group">
              <Settings className="absolute -right-4 -bottom-4 text-amber-500/20 w-32 h-32 group-hover:rotate-45 transition-transform duration-700" />
              <h3 className="font-black text-zinc-900 uppercase tracking-widest text-[10px] mb-2">{t('profile.control_panel')}</h3>
              <p className="text-zinc-800 text-xs font-bold leading-relaxed relative z-10">{t('profile.panel_description')}</p>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <section className="bg-white p-10 rounded-[3rem] border border-zinc-100 shadow-sm relative">
              <h3 className="text-xl font-black text-zinc-900 mb-6 uppercase tracking-tighter flex items-center gap-3">
                <User className="text-amber-500" /> {t('profile.bio_title')}
              </h3>

              {editMode ? (
                <div className="space-y-4">
                  <textarea
                    className="w-full bg-zinc-50 p-6 rounded-2xl border-2 border-zinc-100 focus:border-amber-400 outline-none text-zinc-600 leading-relaxed h-32 transition-all font-medium"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder={t('profile.bio_placeholder')}
                  />
                  {user.role === 'worker' && (
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-1">{t('profile.phone_label')}</label>
                      <input
                        className="w-full bg-zinc-50 p-4 rounded-xl border border-zinc-200 font-bold text-zinc-700 outline-none focus:border-amber-400"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+61 4..."
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <p className="text-zinc-600 leading-relaxed text-lg font-medium italic mb-4">"{user.bio || t('profile.no_bio')}"</p>
                  {user.phone && (
                    <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-xl text-xs font-bold border border-green-100">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      WhatsApp: {user.phone}
                    </div>
                  )}
                </div>
              )}
            </section>

            <section className="bg-white p-10 rounded-[3rem] border border-zinc-100 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-zinc-900 uppercase tracking-tighter flex items-center gap-3">
                  <ImageIcon className="text-amber-500" /> {t('profile.portfolio')}
                </h3>
                <label className="cursor-pointer bg-zinc-900 text-amber-400 px-6 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-zinc-800 transition-all">
                  {uploading ? t('common.loading') : t('profile.add_photos')}
                  <input type="file" multiple hidden onChange={handlePortfolioUpload} disabled={uploading} accept="image/*" />
                </label>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {user.portfolio?.map((img, index) => (
                  <div key={index} className="aspect-square rounded-[2rem] overflow-hidden group relative border border-zinc-100 shadow-sm">
                    <img src={img} className="w-full h-full object-cover transition duration-500 group-hover:scale-110" alt="Portfolio" />
                    <button onClick={() => confirmDeletePhoto(img)} className="absolute inset-0 bg-red-600/80 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                      <Trash2 size={24} />
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* SECCIÓN DE RESEÑAS RECIBIDAS (NUEVO) */}
            {user.role === 'worker' && (
              <section className="bg-white p-10 rounded-[3rem] border border-zinc-100 shadow-sm">
                <h3 className="text-xl font-black text-zinc-900 mb-6 uppercase tracking-tighter flex items-center gap-3">
                  <Star className="text-amber-500" /> {t('reviews.client_reviews')}
                </h3>

                {reviews.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {reviews.map((rev, i) => (
                      <div key={i} className="bg-zinc-50 p-6 rounded-[2rem] border border-zinc-100">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex text-amber-400 gap-0.5">
                            {[...Array(rev.rating)].map((_, idx) => <Star key={idx} size={12} fill="currentColor" />)}
                          </div>
                          <span className="text-[10px] text-zinc-400 font-bold">{new Date(rev.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-zinc-600 italic mb-3">"{rev.comment}"</p>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-zinc-200 overflow-hidden">
                            <img src={rev.author?.avatar || defaultAvatar} className="w-full h-full object-cover" alt="" />
                          </div>
                          <span className="text-xs font-black text-zinc-800 uppercase">{rev.author?.name || "Cliente"}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-zinc-400 text-sm font-medium italic">{t('profile.no_reviews_yet') || "No reviews yet."}</p>
                )}
              </section>
            )}

            <section className="bg-white p-10 rounded-[3rem] border border-zinc-100 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-zinc-900 uppercase tracking-tighter flex items-center gap-3">
                  <Megaphone className="text-amber-500" /> {t('profile.active_posts')}
                </h3>
                <button onClick={() => navigate('/newPost')} className="bg-amber-400 text-zinc-900 p-2.5 rounded-xl hover:scale-105 transition-transform shadow-lg shadow-amber-200">
                  <Plus size={20} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {posts.length > 0 ? posts.map((post) => (
                  <div key={post._id} className="group bg-zinc-50 border border-zinc-100 p-4 rounded-[2rem] hover:bg-white hover:shadow-xl hover:shadow-zinc-200/50 transition-all">
                    <div className="w-full h-40 overflow-hidden">
                      <img src={post.imageUrl || "/default-product.png"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" />
                    </div>
                    <div className="p-4 pb-3">
                      <h4 className="font-black text-zinc-900 text-sm uppercase truncate tracking-tight mb-1">{post.title}</h4>
                      <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">{post.category}</span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => navigate(`/ownerPostView/${post._id}`)} className="flex-[2] bg-zinc-900 text-white text-[10px] font-black uppercase py-3 rounded-xl tracking-widest hover:bg-zinc-800 transition-colors">{t('profile.manage')}</button>
                      <button onClick={() => navigate(`/editar/${post._id}`)} className="flex-1 bg-white border border-zinc-200 text-zinc-600 p-2 rounded-xl hover:bg-zinc-100 transition-colors flex items-center justify-center"><Edit3 size={16} /></button>
                      <button onClick={() => confirmDelete(post._id)} className="flex-1 bg-red-50 text-red-500 p-2 rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center"><Trash2 size={16} /></button>
                    </div>
                  </div>
                )) : (
                  <div className="col-span-full py-12 text-center border-2 border-dashed border-zinc-100 rounded-[2rem]">
                    <p className="text-zinc-400 font-black uppercase tracking-widest text-[10px]">{t('profile.no_posts')}</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* MODALES */}
      {showConfirm && (
        <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className={`bg-white p-10 rounded-[3rem] max-w-sm w-full transition-all ${animate ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
            <h2 className="text-2xl font-black text-zinc-900 text-center uppercase mb-6 tracking-tighter">{t('profile.delete_confirm_title')}</h2>
            <div className="flex gap-3">
              <button onClick={deletePost} className="flex-1 bg-red-600 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest">{t('common.delete')}</button>
              <button onClick={closeModal} className="flex-1 bg-zinc-100 text-zinc-500 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest">{t('common.cancel')}</button>
            </div>
          </div>
        </div>
      )}

      {showPhotoConfirm && (
        <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className={`bg-white p-10 rounded-[3rem] max-w-sm w-full transition-all ${animatePhoto ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
            <h2 className="text-2xl font-black text-zinc-900 text-center uppercase mb-6 tracking-tighter">{t('profile.delete_photo_confirm_title')}</h2>
            <div className="flex gap-3">
              <button onClick={executeDeletePhoto} className="flex-1 bg-red-600 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest">{t('common.delete')}</button>
              <button onClick={closePhotoModal} className="flex-1 bg-zinc-100 text-zinc-500 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest">{t('common.cancel')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}