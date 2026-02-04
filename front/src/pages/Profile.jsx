import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from '../Context/AuthContext';
import {
  User, MapPin, Briefcase, Plus, Trash2, Edit3,
  Check, X, Camera, Image as ImageIcon, LayoutGrid, Settings, Megaphone
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Profile() {
  const [posts, setPosts] = useState([]);
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
    bio: ""
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
        const resUser = await fetch(`http://localhost:5000/api/users/${userId}`);
        const dataUser = await resUser.json();
        setUser(dataUser);
        setFormData({
          name: dataUser.name || "",
          profession: dataUser.profession || "",
          experience: Array.isArray(dataUser.experience) ? dataUser.experience : [],
          location: dataUser.location || "",
          avatar: dataUser.avatar || "",
          skills: dataUser.skills || [],
          bio: dataUser.bio || ""
        });

        const resPosts = await fetch(`http://localhost:5000/api/posts/user/${userId}`);
        const dataPosts = await resPosts.json();
        setPosts(dataPosts);
      } catch (err) {
        console.error("Error al cargar perfil:", err);
      }
    };

    fetchProfile();
  }, [loggedInUser]);

  // --- LOGICA DE AVATAR Y PORTAFOLIO ---
  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const loadingToast = toast.loading("Actualizando foto...");
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
      toast.success("Foto actualizada", { id: loadingToast });
    } catch (err) { toast.error("Error al subir", { id: loadingToast }); }
  };

  const handlePortfolioUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    const loadingToast = toast.loading("Subiendo imágenes...");
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
      toast.success("Galería actualizada", { id: loadingToast });
    } catch (err) { toast.error("Error al subir", { id: loadingToast }); }
    finally { setUploading(false); }
  };

  const executeDeletePhoto = async () => {
    const loadingToast = toast.loading("Eliminando...");
    try {
      const res = await fetch(import.meta.env.VITE_API_URL + "/api/users/portfolio", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ imageUrl: photoToDelete }),
      });
      setUser({ ...user, portfolio: user.portfolio.filter(img => img !== photoToDelete) });
      toast.success("Eliminada", { id: loadingToast });
      closePhotoModal();
    } catch (err) { toast.error("Error"); }
  };

  // --- LOGICA DE PERFIL Y SKILLS ---
  const handleSaveProfile = async () => {
    try {
      const cleanedSkills = formData.skills.map(s => s.trim()).filter(s => s !== "");
      const res = await fetch(`http://localhost:5000/api/users/${user._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...formData, skills: cleanedSkills }),
      });
      const updatedUser = await res.json();
      setUser(updatedUser);
      setFormData(prev => ({ ...prev, skills: cleanedSkills }));
      setEditMode(false);
      toast.success("Perfil guardado");
    } catch (err) { toast.error("Error al guardar"); }
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
      const res = await fetch(`http://localhost:5000/api/posts/${postToDelete}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      setPosts(posts.filter((p) => p._id !== postToDelete));
      toast.success("Anuncio eliminado");
      closeModal();
    } catch (err) { toast.error("Error al eliminar"); }
  };

  const confirmDelete = (id) => { setPostToDelete(id); setShowConfirm(true); setTimeout(() => setAnimate(true), 10); };
  const closeModal = () => { setAnimate(false); setTimeout(() => setShowConfirm(false), 300); };
  const confirmDeletePhoto = (url) => { setPhotoToDelete(url); setShowPhotoConfirm(true); setTimeout(() => setAnimatePhoto(true), 10); };
  const closePhotoModal = () => { setAnimatePhoto(false); setTimeout(() => setShowPhotoConfirm(false), 300); };

  if (!user) return <div className="min-h-screen flex items-center justify-center font-black text-zinc-400 uppercase tracking-widest text-xs">Cargando Panel...</div>;

  return (
    <div className="min-h-screen bg-zinc-50/50 pb-20 px-4 pt-8">
      <div className="max-w-6xl mx-auto">

        {/* HEADER PREMIUM */}
        <div className="bg-white rounded-[3rem] shadow-xl shadow-zinc-200/50 overflow-hidden border border-zinc-100 relative">
          <div className="h-40 bg-zinc-900 relative">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-amber-400 via-transparent to-transparent"></div>
            <div className="absolute top-6 right-8 flex gap-3">
              {!editMode ? (
                <button onClick={() => setEditMode(true)} className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-6 py-2.5 rounded-2xl border border-white/20 font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2">
                  <Edit3 size={14} /> Editar Perfil
                </button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={handleSaveProfile} className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg transition-all flex items-center gap-2">
                    <Check size={14} /> Guardar
                  </button>
                  <button onClick={() => setEditMode(false)} className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-6 py-2.5 rounded-2xl border border-white/20 font-black text-[10px] uppercase tracking-widest transition-all">
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="px-10 pb-10 flex flex-col md:flex-row items-center md:items-end gap-8 -mt-16 relative">
            <div className="relative group">
              <div className="w-40 h-40 rounded-[2.5rem] border-[6px] border-white shadow-2xl overflow-hidden bg-zinc-100">
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

            <div className="flex-1 text-center md:text-left">
              {editMode ? (
                <div className="space-y-3 max-w-md">
                  <input className="text-3xl font-black text-zinc-900 border-b-2 border-amber-400 outline-none w-full bg-transparent uppercase tracking-tighter" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                  <input className="text-amber-600 font-black uppercase text-[10px] tracking-widest block border-b border-zinc-200 outline-none w-full bg-transparent" placeholder="TU PROFESIÓN" value={formData.profession} onChange={(e) => setFormData({ ...formData, profession: e.target.value })} />
                  <input className="text-zinc-400 text-xs font-bold block border-b border-zinc-200 outline-none w-full bg-transparent uppercase" placeholder="📍 CIUDAD, PROVINCIA" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
                </div>
              ) : (
                <div className="mb-2">
                  <h1 className="text-4xl font-black text-zinc-900 tracking-tighter uppercase">{user.name}</h1>
                  <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-2 items-center">
                    <span className="bg-zinc-900 text-amber-400 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                      {user.profession || "Profesional"}
                    </span>
                    <span className="text-zinc-400 font-bold text-xs flex items-center gap-1 uppercase tracking-widest">
                      <MapPin size={14} className="text-amber-500" /> {user.location || "Sin ubicación"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* GRID PRINCIPAL */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10">

          {/* COLUMNA IZQUIERDA (Skills) */}
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-black text-zinc-900 uppercase tracking-widest text-[10px] flex items-center gap-2">
                  <LayoutGrid size={16} className="text-amber-500" /> Mis Habilidades
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
              <h3 className="font-black text-zinc-900 uppercase tracking-widest text-[10px] mb-2">Panel de Control</h3>
              <p className="text-zinc-800 text-xs font-bold leading-relaxed relative z-10">Gestiona tus publicaciones, actualiza tu portafolio y mantén tu perfil al día para atraer más clientes.</p>
            </div>
          </div>

          {/* COLUMNA DERECHA (Bio, Experiencia, Portafolio, Anuncios) */}
          <div className="lg:col-span-2 space-y-8">

            {/* SOBRE MI */}
            <section className="bg-white p-10 rounded-[3rem] border border-zinc-100 shadow-sm relative">
              <h3 className="text-xl font-black text-zinc-900 mb-6 uppercase tracking-tighter flex items-center gap-3">
                <User className="text-amber-500" /> Bio Profesional
              </h3>
              {editMode ? (
                <textarea
                  className="w-full bg-zinc-50 p-6 rounded-2xl border-2 border-zinc-100 focus:border-amber-400 outline-none text-zinc-600 leading-relaxed h-32 transition-all font-medium"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Describe tu experiencia..."
                />
              ) : (
                <p className="text-zinc-600 leading-relaxed text-lg font-medium italic">"{user.bio || "Sin biografía redactada."}"</p>
              )}
            </section>

            {/* PORTAFOLIO */}
            <section className="bg-white p-10 rounded-[3rem] border border-zinc-100 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-zinc-900 uppercase tracking-tighter flex items-center gap-3">
                  <ImageIcon className="text-amber-500" /> Galería de Trabajos
                </h3>
                <label className="cursor-pointer bg-zinc-900 text-amber-400 px-6 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-zinc-800 transition-all">
                  {uploading ? "Subiendo..." : "Añadir Fotos"}
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

            {/* ANUNCIOS ACTIVOS */}
            <section className="bg-white p-10 rounded-[3rem] border border-zinc-100 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-zinc-900 uppercase tracking-tighter flex items-center gap-3">
                  <Megaphone className="text-amber-500" /> Mis Anuncios Activos
                </h3>
                <button onClick={() => navigate('/newPost')} className="bg-amber-400 text-zinc-900 p-2.5 rounded-xl hover:scale-105 transition-transform shadow-lg shadow-amber-200">
                  <Plus size={20} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {posts.length > 0 ? posts.map((post) => (
                  <div key={post._id} className="group bg-zinc-50 border border-zinc-100 p-4 rounded-[2rem] hover:bg-white hover:shadow-xl hover:shadow-zinc-200/50 transition-all">
                    <div className="flex gap-4 items-center mb-4">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-md">
                        <img src={post.imageUrl || "/default-product.png"} className="w-full h-full object-cover" alt="" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-black text-zinc-900 text-sm uppercase truncate tracking-tight">{post.title}</h4>
                        <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">{post.category}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => navigate(`/ownerPostView/${post._id}`)} className="flex-[2] bg-zinc-900 text-white text-[10px] font-black uppercase py-3 rounded-xl tracking-widest hover:bg-zinc-800 transition-colors">Gestionar</button>
                      <button onClick={() => navigate(`/editar/${post._id}`)} className="flex-1 bg-white border border-zinc-200 text-zinc-600 p-2 rounded-xl hover:bg-zinc-100 transition-colors flex items-center justify-center"><Edit3 size={16} /></button>
                      <button onClick={() => confirmDelete(post._id)} className="flex-1 bg-red-50 text-red-500 p-2 rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center"><Trash2 size={16} /></button>
                    </div>
                  </div>
                )) : (
                  <div className="col-span-full py-12 text-center border-2 border-dashed border-zinc-100 rounded-[2rem]">
                    <p className="text-zinc-400 font-black uppercase tracking-widest text-[10px]">No tienes anuncios activos</p>
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
            <h2 className="text-2xl font-black text-zinc-900 text-center uppercase mb-6 tracking-tighter">¿Borrar Anuncio?</h2>
            <div className="flex gap-3">
              <button onClick={deletePost} className="flex-1 bg-red-600 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest">Eliminar</button>
              <button onClick={closeModal} className="flex-1 bg-zinc-100 text-zinc-500 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {showPhotoConfirm && (
        <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className={`bg-white p-10 rounded-[3rem] max-w-sm w-full transition-all ${animatePhoto ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
            <h2 className="text-2xl font-black text-zinc-900 text-center uppercase mb-6 tracking-tighter">¿Eliminar foto?</h2>
            <div className="flex gap-3">
              <button onClick={executeDeletePhoto} className="flex-1 bg-red-600 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest">Eliminar</button>
              <button onClick={closePhotoModal} className="flex-1 bg-zinc-100 text-zinc-500 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}