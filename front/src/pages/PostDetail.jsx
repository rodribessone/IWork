import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  MapPin, Tag, Calendar, ChevronLeft,
  Share2, ShieldCheck, Clock, ArrowRight,
  Briefcase, Loader2, AlertCircle
} from 'lucide-react';
import ApplyButton from "../components/ApplyButton";
import { useAuthContext } from '../Context/AuthContext';

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, token } = useAuthContext();

  const handleApplySuccess = (userId) => {
    setPost((prev) =>
      prev && !prev.applicants.includes(userId)
        ? { ...prev, applicants: [...prev.applicants, userId] }
        : prev
    );
  };

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/posts/${id}`);
        const data = await res.json();
        setPost(data);
      } catch (err) {
        console.error("Error al cargar el post:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50">
      <Loader2 className="animate-spin text-amber-500" size={40} />
    </div>
  );

  if (!post) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50">
      <AlertCircle size={48} className="text-zinc-300 mb-4" />
      <p className="text-zinc-500 font-bold">Anuncio no encontrado</p>
      <Link to="/works" className="mt-4 text-amber-600 font-black uppercase text-xs tracking-widest">Volver al listado</Link>
    </div>
  );

  const isPostOwner = user &&
    post &&
    String(user._id) === String(post.user?._id || post.user);

  return (
    <div className="min-h-screen bg-zinc-50/50 pb-20">
      {/* Header de Navegación */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-zinc-400 hover:text-zinc-950 transition-colors font-black uppercase text-[10px] tracking-[0.2em]"
        >
          <ChevronLeft size={16} /> Volver a la búsqueda
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12">

        {/* COLUMNA PRINCIPAL (Izquierda) */}
        <div className="lg:col-span-8">
          {/* Imagen Principal Artística */}
          <div className="relative h-[400px] w-full rounded-[3rem] overflow-hidden shadow-2xl mb-10 group">
            <img
              src={post.imageUrl || "https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=2070&auto=format&fit=crop"}
              alt={post.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent"></div>
            <div className="absolute bottom-10 left-10 right-10">
              <span className="bg-amber-400 text-black text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full mb-4 inline-block">
                {post.category}
              </span>
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase leading-none">
                {post.title}
              </h1>
            </div>
          </div>

          {/* Contenido del Anuncio */}
          <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-zinc-100">
            <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
              <Briefcase size={14} className="text-amber-500" /> Descripción del proyecto
            </h3>
            <div className="text-zinc-600 text-lg leading-relaxed space-y-4 whitespace-pre-line font-medium">
              {post.description}
            </div>

            {/* Tags o Detalles Extras */}
            <div className="mt-12 pt-8 border-t border-zinc-100 flex flex-wrap gap-4">
              <div className="flex items-center gap-2 px-5 py-3 bg-zinc-50 rounded-2xl text-zinc-500 text-sm font-bold">
                <ShieldCheck size={18} className="text-green-500" /> Verificado por la plataforma
              </div>
              <div className="flex items-center gap-2 px-5 py-3 bg-zinc-50 rounded-2xl text-zinc-500 text-sm font-bold">
                <Clock size={18} className="text-amber-500" /> Respuesta rápida
              </div>
            </div>
          </div>
        </div>

        {/* SIDEBAR DE ACCIONES (Derecha) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-zinc-950 rounded-[2.5rem] p-8 text-white shadow-xl shadow-zinc-200 sticky top-10">
            <h4 className="text-[10px] font-black text-amber-400 uppercase tracking-[0.2em] mb-8">Información Clave</h4>

            <div className="space-y-6 mb-10">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                  <MapPin size={20} className="text-amber-400" />
                </div>
                <div>
                  <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Ubicación</p>
                  <p className="text-white font-bold">{post.location}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                  <Calendar size={20} className="text-amber-400" />
                </div>
                <div>
                  <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Publicado</p>
                  <p className="text-white font-bold">{new Date(post.createdAt).toLocaleDateString("es-ES", { day: 'numeric', month: 'long' })}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                  <Tag size={20} className="text-amber-400" />
                </div>
                <div>
                  <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Categoría</p>
                  <p className="text-white font-bold">{post.category}</p>
                </div>
              </div>
            </div>

            {/* BOTONES DE ACCIÓN */}
            <div className="space-y-4 pt-6 border-t border-white/10">
              {isPostOwner ? (
                /* CASO 1: ES MI PROPIO ANUNCIO */
                <div className="space-y-4">
                  <div className="bg-amber-400/10 border border-amber-400/20 p-6 rounded-[2rem] text-center">
                    <Briefcase className="mx-auto text-amber-400 mb-2" size={24} />
                    <p className="text-amber-400 text-[10px] font-black uppercase tracking-widest">
                      Esta es tu publicación
                    </p>
                    <p className="text-zinc-400 text-xs mt-1 font-medium italic">
                      Gestiona a los candidatos desde el panel de control.
                    </p>
                  </div>
                  <Link
                    to={`/ownerPostView/${post._id}`}
                    className="flex items-center justify-center gap-3 w-full bg-white text-black py-5 rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] hover:bg-zinc-200 transition-all shadow-lg"
                  >
                    Gestionar Candidatos <ArrowRight size={16} />
                  </Link>
                </div>
              ) : (
                /* CASO 2: NO ES MI ANUNCIO */
                <>
                  {user ? (
                    /* Si estoy logueado y no soy el dueño, muestro el botón de aplicar */
                    <ApplyButton
                      postId={post._id}
                      user={user}
                      token={token}
                      hasApplied={post.applicants?.some(app =>
                        (typeof app === 'string' ? app : (app.user || app._id)) === user._id
                      )}
                      onApplySuccess={handleApplySuccess}
                    />
                  ) : (
                    /* Si no estoy logueado */
                    <Link
                      to="/login"
                      className="flex items-center justify-center gap-3 w-full bg-amber-400 text-black py-5 rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] hover:bg-amber-300 transition-all"
                    >
                      Login para Postular
                    </Link>
                  )}

                  <button className="flex items-center justify-center gap-3 w-full bg-white/5 text-white py-5 rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] hover:bg-white/10 transition-all border border-white/10">
                    <Share2 size={16} /> Compartir Anuncio
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}