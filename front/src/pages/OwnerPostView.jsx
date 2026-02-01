import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useAuthContext } from "../Context/AuthContext";
import {
  User, Mail, Calendar, FileDown, MessageSquare,
  XCircle, CheckCircle, ChevronLeft, ExternalLink,
  Users, Loader2, AlertCircle
} from 'lucide-react';
import toast from "react-hot-toast";

export default function OwnerPostView() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, token } = useAuthContext();
  const [post, setPost] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Evitamos ejecutar si no hay usuario o token aún
    if (!token || !user?._id) return;

    const fetchPostAndApplicants = async () => {
      try {
        setLoading(true);

        // 1. Obtener post
        const res = await fetch(`http://localhost:5000/api/posts/${id}`);
        if (!res.ok) throw new Error("No se pudo cargar el anuncio");
        const data = await res.json();

        // --- LA CORRECCIÓN CRÍTICA AQUÍ ---
        // Usamos .toString() y .trim() para asegurar que comparamos strings puros
        const ownerId = data.user?._id || data.user; // Por si el backend mandó el objeto poblado o solo el ID
        const currentUserId = user._id;

        if (String(ownerId).trim() !== String(currentUserId).trim()) {
          console.warn("Acceso denegado: No eres el dueño");
          navigate(`/post/${id}`, { replace: true });
          return;
        }
        // ----------------------------------

        setPost(data);

        // 2. Obtener postulantes solo si la verificación pasó
        const resApp = await fetch(`http://localhost:5000/api/posts/${id}/applicants`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!resApp.ok) throw new Error("Error al cargar la lista de candidatos");
        const dataApp = await resApp.json();
        setApplicants(dataApp);

      } catch (err) {
        setError(err.message);
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPostAndApplicants();
  }, [id, user?._id, token, navigate]);

  const updateStatus = async (applicantId, status) => {
    const loadingToast = toast.loading("Actualizando estado...");
    try {
      const res = await fetch(
        `http://localhost:5000/api/posts/${id}/applicants/${applicantId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error("No se pudo actualizar el estado");

      if (status === "accepted" && data.conversationId) {
        toast.success("¡Candidato aceptado! Iniciando chat...", { id: loadingToast });
        setTimeout(() => navigate("/chat"), 1500);
      } else {
        toast.success(`Candidato ${status === 'rejected' ? 'rechazado' : 'actualizado'}`, { id: loadingToast });
      }

      setApplicants((prev) =>
        prev.map((a) => (a._id === applicantId ? { ...a, status } : a))
      );
    } catch (err) {
      toast.error(err.message, { id: loadingToast });
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'accepted': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'rejected': return 'bg-zinc-100 text-zinc-500 border-zinc-200';
      default: return 'bg-amber-100 text-amber-700 border-amber-200';
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
      <p className="text-zinc-800 font-bold">{error}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-50/50 py-12 px-6">
      <div className="max-w-5xl mx-auto">

        {/* Header con navegación rápida */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-zinc-400 hover:text-zinc-950 transition-colors font-black uppercase text-[10px] tracking-[0.2em] mb-4"
            >
              <ChevronLeft size={16} /> Volver al panel
            </button>
            <h1 className="text-3xl font-black tracking-tighter uppercase text-zinc-900 flex items-center gap-3">
              Gestión de Candidatos
            </h1>
            <p className="text-zinc-500 font-medium text-sm mt-1 flex items-center gap-2">
              Anuncio: <span className="text-zinc-900 font-bold">{post.title}</span>
              <Link to={`/post/${id}`} className="text-amber-600 hover:text-amber-700">
                <ExternalLink size={14} />
              </Link>
            </p>
          </div>

          <div className="bg-white px-6 py-4 rounded-[2rem] border border-zinc-100 shadow-sm flex items-center gap-6">
            <div className="text-center">
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Postulantes</p>
              <p className="text-xl font-black text-zinc-900">{applicants.length}</p>
            </div>
            <div className="h-8 w-[1px] bg-zinc-100"></div>
            <div className="text-center">
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Estado</p>
              <p className="text-sm font-bold text-emerald-600 uppercase tracking-tighter">Activo</p>
            </div>
          </div>
        </div>

        {/* Lista de Candidatos */}
        <div className="space-y-4">
          {applicants.length === 0 ? (
            <div className="bg-white rounded-[3rem] p-20 text-center border border-dashed border-zinc-200">
              <Users className="mx-auto text-zinc-200 mb-4" size={48} />
              <h3 className="text-zinc-400 font-bold">Aún no hay postulaciones para este anuncio.</h3>
              <p className="text-zinc-300 text-sm">Aparecerán aquí en cuanto los usuarios apliquen.</p>
            </div>
          ) : (
            applicants.map((app) => (
              <div key={app._id} className="bg-white rounded-[2.5rem] p-8 border border-zinc-100 shadow-sm hover:shadow-md transition-all group">
                <div className="flex flex-col lg:flex-row gap-8 items-start">

                  {/* Avatar y Datos Básicos */}
                  <div className="flex items-center gap-4 min-w-[240px]">
                    <Link
                      to={`/users/${app.user._id}`}
                      className="flex items-center gap-4 group/author"
                    >
                      {/* Avatar con efecto de escala al hacer hover */}
                      <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center text-amber-400 font-black text-xl shadow-lg transition-transform group-hover/author:scale-105">
                        {app.user.name.charAt(0)}
                      </div>

                      <div>
                        {/* Nombre con subrayado animado al hacer hover */}
                        <h3 className="font-black text-zinc-900 uppercase tracking-tighter text-lg group-hover/author:text-amber-600 transition-colors">
                          {app.user.name}
                        </h3>
                        <div className="flex flex-col gap-1 mt-1">
                          <span className="text-zinc-400 text-xs flex items-center gap-1">
                            <Mail size={12} /> {app.user.email}
                          </span>
                          <span className="text-zinc-400 text-xs flex items-center gap-1">
                            <Calendar size={12} /> {new Date(app.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </Link>
                  </div>

                  {/* Mensaje y Skills */}
                  <div className="flex-1 space-y-4">
                    <div className={`inline-block px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${getStatusStyle(app.status)}`}>
                      {app.status === 'pending' ? 'Pendiente de Revisión' : app.status}
                    </div>

                    <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-100 relative">
                      <MessageSquare className="absolute -top-2 -right-2 text-zinc-200" size={20} />
                      <p className="text-zinc-600 text-sm italic leading-relaxed">
                        "{app.message || "Sin mensaje de presentación."}"
                      </p>
                    </div>

                    {app.user.skills?.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {app.user.skills.map((skill, i) => (
                          <span key={i} className="text-[10px] bg-white border border-zinc-200 text-zinc-500 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Acciones Verticales */}
                  <div className="flex flex-row lg:flex-col gap-3 w-full lg:w-auto pt-4 lg:pt-0 border-t lg:border-t-0 lg:border-l border-zinc-100 lg:pl-8">
                    {app.cvUrl && (
                      <a
                        href={app.cvUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-colors"
                      >
                        <FileDown size={16} /> CV
                      </a>
                    )}

                    {app.status !== "accepted" && (
                      <button
                        onClick={() => updateStatus(app._id, "accepted")}
                        className="flex-1 flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-500 text-black px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-amber-400/10"
                      >
                        <CheckCircle size={16} /> Contactar
                      </button>
                    )}

                    {app.status !== "rejected" && (
                      <button
                        onClick={() => updateStatus(app._id, "rejected")}
                        className="flex-1 flex items-center justify-center gap-2 bg-white border border-zinc-200 text-zinc-400 hover:text-red-500 hover:border-red-200 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                      >
                        <XCircle size={16} /> Descartar
                      </button>
                    )}
                  </div>

                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}