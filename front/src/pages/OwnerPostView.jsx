// src/pages/OwnerPostView.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next"; // <-- Importamos i18next
import { useAuthContext } from "../Context/AuthContext";
import {
  User, Mail, Calendar, FileDown, MessageSquare,
  XCircle, CheckCircle, ChevronLeft, ExternalLink,
  Users, Loader2, AlertCircle, Star
} from 'lucide-react';
import toast from "react-hot-toast";

export default function OwnerPostView() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useTranslation(); // <-- Hook de traducción
  const { user, token } = useAuthContext();
  const [post, setPost] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token || !user?._id) return;

    const fetchPostAndApplicants = async () => {
      try {
        setLoading(true);

        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/posts/${id}`);
        if (!res.ok) throw new Error(t('ownerView.errors.loadPost'));
        const data = await res.json();

        const ownerId = data.user?._id || data.user;
        const currentUserId = user._id;

        if (String(ownerId).trim() !== String(currentUserId).trim()) {
          console.warn("Acceso denegado: No eres el dueño");
          navigate(`/post/${id}`, { replace: true });
          return;
        }

        setPost(data);

        const resApp = await fetch(`${import.meta.env.VITE_API_URL}/api/posts/${id}/applicants`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!resApp.ok) throw new Error(t('ownerView.errors.loadApplicants'));
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
  }, [id, user?._id, token, navigate, t]);

  const updateStatus = async (applicantId, status) => {
    const loadingToast = toast.loading(t('ownerView.status.updating'));
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/posts/${id}/applicants/${applicantId}/status`,
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
      if (!res.ok) throw new Error(t('ownerView.errors.updateStatus'));

      if (status === "accepted" && data.conversationId) {
        toast.success(t('ownerView.status.acceptedSuccess'), { id: loadingToast });
        setTimeout(() => navigate("/chat"), 1500);
      } else {
        const msg = status === 'rejected' ? t('ownerView.status.rejectedMsg') : t('ownerView.status.updatedMsg');
        toast.success(msg, { id: loadingToast });
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

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-zinc-400 hover:text-zinc-950 transition-colors font-black uppercase text-[10px] tracking-[0.2em] mb-4"
            >
              <ChevronLeft size={16} /> {t('ownerView.backToPanel')}
            </button>
            <h1 className="text-3xl font-black tracking-tighter uppercase text-zinc-900 flex items-center gap-3">
              {t('ownerView.title')}
            </h1>
            <p className="text-zinc-500 font-medium text-sm mt-1 flex items-center gap-2">
              {t('ownerView.postLabel')}: <span className="text-zinc-900 font-bold">{post.title}</span>
              <Link to={`/post/${id}`} className="text-amber-600 hover:text-amber-700">
                <ExternalLink size={14} />
              </Link>
            </p>
          </div>

          <div className="bg-white px-6 py-4 rounded-[2rem] border border-zinc-100 shadow-sm flex items-center gap-6">
            <div className="text-center">
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{t('ownerView.stats.applicants')}</p>
              <p className="text-xl font-black text-zinc-900">{applicants.length}</p>
            </div>
            <div className="h-8 w-[1px] bg-zinc-100"></div>
            <div className="text-center">
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{t('ownerView.stats.status')}</p>
              <p className="text-sm font-bold text-emerald-600 uppercase tracking-tighter">{t('ownerView.stats.active')}</p>
            </div>
          </div>
        </div>

        {/* Lista de Candidatos */}
        <div className="space-y-4">
          {applicants.length === 0 ? (
            <div className="bg-white rounded-[3rem] p-20 text-center border border-dashed border-zinc-200">
              <Users className="mx-auto text-zinc-200 mb-4" size={48} />
              <h3 className="text-zinc-400 font-bold">{t('ownerView.empty.title')}</h3>
              <p className="text-zinc-300 text-sm">{t('ownerView.empty.desc')}</p>
            </div>
          ) : (
            applicants.map((app) => (
              <div key={app._id} className="bg-white rounded-[2.5rem] p-8 border border-zinc-100 shadow-sm hover:shadow-md transition-all group">
                <div className="flex flex-col lg:flex-row gap-8 items-start">

                  {/* Avatar y Datos Básicos */}
                  <div className="flex items-center gap-4 min-w-[240px]">
                    <Link to={`/users/${app.user._id}`} className="flex items-center gap-4 group/author">
                      <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center text-amber-400 font-black text-xl shadow-lg transition-transform group-hover/author:scale-105">
                        {app.user.name.charAt(0)}
                      </div>
                      <div>
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

                  {/* Mensaje */}
                  <div className="flex-1 space-y-4">
                    <div className={`inline-block px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${getStatusStyle(app.status)}`}>
                      {app.status === 'pending' ? t('ownerView.status.pending') : t(`ownerView.status.${app.status}`)}
                    </div>
                    <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-100 relative">
                      <MessageSquare className="absolute -top-2 -right-2 text-zinc-200" size={20} />
                      <p className="text-zinc-600 text-sm italic leading-relaxed">
                        "{app.message || t('ownerView.noMessage')}"
                      </p>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex flex-row lg:flex-col gap-3 w-full lg:w-auto pt-4 lg:pt-0 border-t lg:border-t-0 lg:border-l border-zinc-100 lg:pl-8">
                    {app.cvUrl && (
                      <a href={app.cvUrl} target="_blank" rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-colors"
                      >
                        <FileDown size={16} /> CV
                      </a>
                    )}
                    {app.status !== "accepted" && (
                      <button onClick={() => updateStatus(app._id, "accepted")}
                        className="flex-1 flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-500 text-black px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-amber-400/10"
                      >
                        <CheckCircle size={16} /> {t('ownerView.actions.contact')}
                      </button>
                    )}
                    {app.status === "accepted" && (
                      <Link to={`/leave-review/${post._id}/${app.user._id}`}
                        className="flex-1 flex items-center justify-center gap-2 bg-purple-100 hover:bg-purple-200 text-purple-700 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                      >
                        <Star size={16} /> {t('ownerView.actions.review')}
                      </Link>
                    )}
                    {app.status !== "rejected" && (
                      <button onClick={() => updateStatus(app._id, "rejected")}
                        className="flex-1 flex items-center justify-center gap-2 bg-white border border-zinc-200 text-zinc-400 hover:text-red-500 hover:border-red-200 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                      >
                        <XCircle size={16} /> {t('ownerView.actions.reject')}
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