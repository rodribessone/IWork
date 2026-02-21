// src/pages/UserProfile.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuthContext } from '../Context/AuthContext';
import { Star, MapPin, Briefcase, User, MessageCircle, Calendar, ArrowLeft, Award, Image as ImageIcon } from "lucide-react";
import { useTranslation } from 'react-i18next';

const UserProfile = () => {
  const { t } = useTranslation();
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, token } = useAuthContext();

  const [user, setUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const defaultAvatar = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${userId}`);
        const data = await res.json();
        setUser(data);

        // Fetch Reviews
        const resReviews = await fetch(`${import.meta.env.VITE_API_URL}/api/reviews/user/${userId}`);
        const dataReviews = await resReviews.json();
        setReviews(dataReviews);

      } catch (err) {
        console.error("Error loading profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserProfile();
  }, [userId]);

  // Función para renderizar estrellas según el puntaje
  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            fill={star <= Math.round(rating) ? "currentColor" : "none"}
            className={`${star <= Math.round(rating) ? "text-amber-400" : "text-zinc-300"}`}
          />
        ))}
      </div>
    );
  };

  const handleContactUser = async () => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    try {
      const res = await fetch(import.meta.env.VITE_API_URL + "/api/chats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ recipientId: userId, postId: null }),
      });

      const data = await res.json();
      if (res.ok) navigate(`/chat/${data._id}`);
    } catch (err) {
      console.error("Error de red:", err);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse flex flex-col items-center">
        <div className="w-12 h-12 bg-amber-200 rounded-full mb-4"></div>
        <p className="text-zinc-400 font-black uppercase tracking-widest text-xs">{t('common.loading')}</p>
      </div>
    </div>
  );

  if (!user) return <div className="text-center mt-20 font-black text-zinc-400">{t('userProfile.notFound') || 'Usuario no encontrado'}</div>;

  return (
    <div className="max-w-7xl mx-auto pb-20 px-4">

      {/* HEADER / COVER AREA */}
      <div className="relative mt-6 mb-8">
        <div className="h-52 md:h-60 bg-zinc-900 rounded-[3rem] overflow-hidden relative">
          <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
          <div className="absolute inset-0 bg-gradient-to-tr from-zinc-900 via-zinc-900/50 to-amber-500/20"></div>

          <button
            onClick={() => navigate(-1)}
            className="absolute top-6 left-6 z-10 flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest border border-white/10"
          >
            <ArrowLeft size={16} /> {t('common.back')}
          </button>
        </div>

        {/* INFO DE PERFIL FLOTANTE */}
        <div className="relative -mt-12 md:-mt-16 px-4 md:px-8 flex flex-col md:flex-row items-center md:items-end gap-6 z-20">
          <div className="relative shrink-0">
            <img
              src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=random&size=256`}
              className="w-36 h-36 md:w-44 md:h-44 rounded-[2rem] border-4 border-white shadow-2xl object-cover bg-white"
              alt={user.name}
              onError={(e) => { e.target.src = defaultAvatar; }}
            />
            {user.verified && (
              <div className="absolute bottom-4 right-4 bg-blue-500 text-white p-2 rounded-full border-4 border-white shadow-lg">
                <Award size={20} />
              </div>
            )}
          </div>

          <div className="flex-1 text-center md:text-left pb-4">
            <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
              <h1 className="text-4xl font-black text-zinc-900 tracking-tighter uppercase italic">{user.name}</h1>
              <div className="flex items-center justify-center md:justify-start gap-2 bg-zinc-100 px-3 py-1 rounded-full">
                {renderStars(user.rating || 0)}
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-tighter">
                  ({user.reviewsCount || 0} {t('profile.reviews')})
                </span>
              </div>
            </div>

            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <p className="text-amber-500 font-black uppercase text-[11px] tracking-[0.2em] bg-amber-50 px-3 py-1 rounded-lg">
                {/* Intento de traducción dinámica */}
                {user.profession ? (t(`professions.${user.profession.toLowerCase()}`) !== `professions.${user.profession.toLowerCase()}` ? t(`professions.${user.profession.toLowerCase()}`) : user.profession) : "Professional"}
              </p>
              <p className="text-zinc-400 font-bold text-[11px] uppercase flex items-center gap-1">
                <MapPin size={14} className="text-zinc-300" /> {user.location || t('profile.not_specified')}
              </p>
            </div>
          </div>

          <div className="pb-4">
            {currentUser?._id !== user._id && (
              <button
                onClick={handleContactUser}
                className="bg-zinc-900 text-amber-400 px-10 py-4 rounded-2xl hover:bg-zinc-800 transition shadow-xl shadow-zinc-200 font-black text-[11px] uppercase tracking-widest flex items-center gap-2"
              >
                <MessageCircle size={18} /> {t('profile.contact_me')}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-8">

        {/* COLUMNA IZQUIERDA: STATS Y INFO (4 cols) */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-zinc-50 p-8 rounded-[2.5rem] border border-zinc-100">
            <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-6">{t('people.skills')}</h3>
            <div className="flex flex-wrap gap-2">
              {user.skills?.length > 0 ? user.skills.map((s, i) => (
                <span key={i} className="bg-white text-zinc-800 px-4 py-2 rounded-xl text-[10px] font-black uppercase border border-zinc-200 shadow-sm">
                  {s}
                </span>
              )) : <p className="text-zinc-400 text-[10px] italic uppercase">{t('profile.no_skills')}</p>}
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm">
            <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4">Stats</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-zinc-500 uppercase">{t('profile.member_since')}</span>
                <span className="text-xs font-black text-zinc-900">{new Date(user.createdAt).getFullYear()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-zinc-500 uppercase">{t('profile.completed_jobs')}</span>
                <span className="text-xs font-black text-zinc-900">{user.completedJobs || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMNA CENTRAL: BIO Y EXPERIENCIA (8 cols) */}
        <div className="lg:col-span-8 space-y-12">

          {/* BIO */}
          <section>
            <h3 className="text-xs font-black text-zinc-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-4">
              {t('profile.about')} <span className="h-[1px] flex-1 bg-zinc-100"></span>
            </h3>
            <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm text-zinc-600 leading-relaxed font-medium">
              {user.bio || t('profile.no_bio')}
            </div>
          </section>

          {/* EXPERIENCIA */}
          <section>
            <h3 className="text-xs font-black text-zinc-400 uppercase tracking-[0.3em] mb-8 flex items-center gap-4">
              {t('profile.experience')} <span className="h-[1px] flex-1 bg-zinc-100"></span>
            </h3>
            <div className="space-y-6">
              {Array.isArray(user.experience) && user.experience.length > 0 ? (
                user.experience.map((exp, i) => (
                  <div key={i} className="group relative pl-10 border-l-2 border-zinc-100 hover:border-amber-400 transition-colors pb-8 last:pb-0">
                    <div className="absolute -left-[9px] top-0 w-4 h-4 bg-white border-4 border-zinc-200 rounded-full group-hover:border-amber-400 transition-colors shadow-sm"></div>
                    <div className="flex flex-col sm:flex-row justify-between mb-2">
                      <h4 className="text-lg font-black text-zinc-900 uppercase italic tracking-tighter">{exp.role}</h4>
                      <span className="text-[10px] font-black bg-zinc-100 text-zinc-500 px-3 py-1 rounded-full h-fit">{exp.duration}</span>
                    </div>
                    <p className="text-amber-600 font-black text-[10px] uppercase tracking-widest mb-3">{exp.company}</p>
                    <p className="text-zinc-500 text-sm font-medium leading-relaxed">{exp.description}</p>
                  </div>
                ))
              ) : (
                <div className="p-8 bg-zinc-50 rounded-[2rem] border border-dashed border-zinc-200 text-zinc-400 text-xs font-bold uppercase text-center">{t('profile.no_experience')}</div>
              )}
            </div>
          </section>

          {/* PORTAFOLIO VISUAL */}
          <section>
            <h3 className="text-xs font-black text-zinc-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-4">
              {t('profile.portfolio')} <span className="h-[1px] flex-1 bg-zinc-100"></span>
            </h3>
            {user.portfolio?.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {user.portfolio.map((img, index) => (
                  <div key={index} className="aspect-square rounded-[2rem] overflow-hidden group relative cursor-zoom-in shadow-md">
                    <img src={img} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" alt="Trabajo" />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-[2rem] p-12 text-center">
                <ImageIcon className="mx-auto text-zinc-300 mb-2" size={32} />
                <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">{t('profile.no_images')}</p>
              </div>
            )}
          </section>

          {/* RESEÑAS */}
          <section>
            <h3 className="text-xs font-black text-zinc-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-4">
              {t('reviews.client_reviews')} <span className="h-[1px] flex-1 bg-zinc-100"></span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews?.length > 0 ? reviews.map((rev, i) => (
                <div key={i} className="bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    {renderStars(rev.rating)}
                    <span className="text-[9px] font-black text-zinc-300 uppercase italic">{new Date(rev.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-zinc-600 text-sm font-medium italic mb-4">"{rev.comment}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-[10px] font-black uppercase overflow-hidden">
                      <img src={rev.author?.avatar || defaultAvatar} className="w-full h-full object-cover" alt="" />
                    </div>
                    <span className="text-[10px] font-black text-zinc-900 uppercase tracking-tighter">{rev.author?.name || 'Cliente'}</span>
                  </div>
                </div>
              )) : (
                <div className="col-span-2 text-center py-10 bg-zinc-50 rounded-[2rem] text-zinc-400 text-[10px] font-black uppercase tracking-[0.2em]">{t('profile.no_reviews_yet')}</div>
              )}
            </div>
          </section>

          {/* PUBLICACIONES ACTIVAS */}
          <section>
            <h3 className="text-xs font-black text-zinc-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-4">
              {t('profile.active_posts')} <span className="h-[1px] flex-1 bg-zinc-100"></span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {user.posts?.map((post) => (
                <Link key={post._id} to={`/post/${post._id}`} className="group flex items-center gap-4 bg-white p-4 rounded-[2rem] border border-zinc-100 shadow-sm hover:shadow-xl hover:border-amber-200 transition-all">
                  <img src={post.imageUrl || post.image || "/default.png"} className="w-20 h-20 rounded-2xl object-cover shadow-sm group-hover:rotate-3 transition-transform" alt="" />
                  <div>
                    <h4 className="font-black text-zinc-900 uppercase italic tracking-tighter text-sm line-clamp-1">{post.title}</h4>
                    <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest mt-1">{t('works.details')}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default UserProfile;