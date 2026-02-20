import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search, MapPin, Tag, Filter, X, ArrowRight, Briefcase, Info, AlertCircle } from 'lucide-react';
import ApplyButton from "../components/ApplyButton";
import { useAuthContext } from '../Context/AuthContext';
import { useTranslation } from 'react-i18next';

const PostCard = ({ post, onClick, t }) => (
  <div
    onClick={() => onClick(post)}
    className="group bg-white rounded-3xl shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 cursor-pointer border border-zinc-100 flex flex-col h-full overflow-hidden"
  >
    <div className="relative w-full h-48 bg-zinc-200 shrink-0 overflow-hidden">
      <img
        src={post.imageUrl || "https://images.unsplash.com/photo-1581578731522-745d05142206?auto=format&fit=crop&q=80&w=400"}
        alt={post.title}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
      />
      <div className="absolute top-4 left-4">
        <span className="bg-white/90 backdrop-blur-md text-zinc-900 text-[10px] font-black uppercase tracking-tighter px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5">
          <Tag size={12} className="text-amber-500" />
          {post.category}
        </span>
      </div>
    </div>

    <div className="p-6 flex flex-col flex-grow">
      <h2 className="text-xl font-bold mb-3 text-zinc-900 line-clamp-2 leading-tight group-hover:text-amber-600 transition-colors">
        {post.title}
      </h2>
      <p className="text-zinc-500 mb-6 line-clamp-3 text-sm flex-grow leading-relaxed">
        {post.description}
      </p>
      <div className="pt-5 border-t border-zinc-50 flex items-center justify-between">
        <span className="text-xs font-bold text-zinc-400 flex items-center gap-1.5 bg-zinc-100 px-3 py-1 rounded-full">
          <MapPin size={14} className="text-zinc-400" />
          {post.location}
        </span>
        <span className="text-amber-500 text-xs font-black uppercase tracking-widest flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {t('works.details')} <ArrowRight size={14} />
        </span>
      </div>
    </div>
  </div>
);

export default function Works() {
  const { t } = useTranslation();
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [selectedPost, setSelectedPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const { user, token } = useAuthContext();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch(import.meta.env.VITE_API_URL + "/api/posts");
        const data = await res.json();
        setPosts(data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  useEffect(() => { setCurrentPage(1); }, [search, category, location]);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => (
      post.title.toLowerCase().includes(search.toLowerCase()) &&
      post.category.toLowerCase().includes(category.toLowerCase()) &&
      post.location.toLowerCase().includes(location.toLowerCase())
    ));
  }, [posts, search, category, location]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPosts.length / itemsPerPage);

  const handleApplySuccess = (postId, userId) => {
    const newApplicant = { user: userId, status: 'pending' };
    setPosts(prev => prev.map(p =>
      p._id === postId
        ? { ...p, applicants: [...(p.applicants || []), newApplicant] }
        : p
    ));
    if (selectedPost?._id === postId) {
      setSelectedPost(prev => ({
        ...prev,
        applicants: [...(prev.applicants || []), newApplicant]
      }));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16 bg-zinc-50/50 min-h-screen font-sans">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-12 gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-zinc-950 tracking-tighter mb-2 md:mb-3">{t('works.title')}</h1>
          <p className="text-zinc-500 text-base md:text-lg">{t('home.hero_subtitle')}</p>
        </div>
        <div className="bg-white px-6 py-3 rounded-2xl border border-zinc-200 shadow-sm self-start">
          <span className="text-zinc-400 text-sm font-medium italic">Showing </span>
          <span className="text-zinc-900 font-black">{filteredPosts.length} results</span>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-[2rem] shadow-xl shadow-zinc-200/50 border border-zinc-100 p-2 mb-8 md:mb-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
          <div className="md:col-span-4 relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-amber-500 transition-colors" size={20} />
            <input
              type="text"
              placeholder={t('common.search')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-14 pr-6 py-4 md:py-5 bg-transparent rounded-2xl outline-none text-zinc-800 placeholder:text-zinc-400 font-medium"
            />
          </div>
          <div className="md:col-span-3 md:border-l border-zinc-100 relative group">
            <Tag className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-amber-500 transition-colors" size={20} />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full pl-14 pr-6 py-4 md:py-5 bg-transparent rounded-2xl outline-none appearance-none cursor-pointer text-zinc-800 font-medium"
            >
              <option value="">{t('works.filter_category')}</option>
              {["Carpintería", "Pintura", "Jardinería", "Mudanza", "Electricidad", "Limpieza"].map(cat => (
                <option key={cat} value={cat.toLowerCase()}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-3 md:border-l border-zinc-100 relative group">
            <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-amber-500 transition-colors" size={20} />
            <input
              type="text"
              placeholder={t('works.filter_location')}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full pl-14 pr-6 py-4 md:py-5 bg-transparent rounded-2xl outline-none text-zinc-800 placeholder:text-zinc-400 font-medium"
            />
          </div>
          <div className="md:col-span-2 flex items-center p-2">
            <button
              onClick={() => { setSearch(""); setCategory(""); setLocation(""); }}
              className="w-full py-3 md:h-full bg-zinc-900 text-white rounded-2xl font-bold hover:bg-zinc-800 transition-all flex items-center justify-center gap-2"
            >
              <Filter size={18} /> {t('common.filter')}
            </button>
          </div>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-72 md:h-80 bg-white rounded-3xl border border-zinc-100 animate-pulse p-6">
              <div className="w-full h-36 bg-zinc-200 rounded-2xl mb-6" />
              <div className="w-3/4 h-6 bg-zinc-200 rounded-full mb-4" />
              <div className="w-full h-10 bg-zinc-100 rounded-2xl" />
            </div>
          ))}
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center py-16 md:py-32 bg-white rounded-[3rem] border-2 border-dashed border-zinc-200">
          <AlertCircle size={48} className="mx-auto text-zinc-300 mb-6" />
          <h3 className="text-2xl font-bold text-zinc-900 mb-2">{t('works.no_jobs')}</h3>
          <p className="text-zinc-400 mb-8">Try adjusting your search.</p>
          <button onClick={() => { setSearch(""); setCategory(""); setLocation(""); }} className="text-amber-600 font-black uppercase tracking-widest text-sm hover:text-amber-700 transition-colors">{t('common.cancel')}</button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
            {currentPosts.map((post) => (
              <PostCard key={post._id} post={post} onClick={setSelectedPost} t={t} />
            ))}
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-12 md:mt-20 gap-2 md:gap-3 flex-wrap">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="px-4 md:px-6 py-3 rounded-2xl font-bold hover:bg-white border border-zinc-200 disabled:opacity-20 transition-all flex items-center gap-2 text-sm"
              >
                ← {t('common.back')}
              </button>
              <div className="flex gap-2">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl font-black transition-all text-sm ${currentPage === i + 1 ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/20' : 'bg-white text-zinc-400 hover:border-zinc-300 border border-zinc-100'}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="px-4 md:px-6 py-3 rounded-2xl font-bold hover:bg-white border border-zinc-200 disabled:opacity-20 transition-all flex items-center gap-2 text-sm"
              >
                {t('common.next')} →
              </button>
            </div>
          )}
        </>
      )}

      {/* Modal Lateral — full screen en móvil, 500px en desktop */}
      <div
        onClick={() => setSelectedPost(null)}
        className={`fixed inset-0 bg-zinc-950/60 backdrop-blur-md z-[100] transition-opacity duration-500 ${selectedPost ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className={`absolute right-0 top-0 bg-white w-full md:w-[500px] h-full shadow-2xl transform transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] flex flex-col ${selectedPost ? "translate-x-0" : "translate-x-full"}`}
        >
          {selectedPost && (
            <>
              <div className="relative h-[220px] md:h-[300px] shrink-0">
                <img src={selectedPost.imageUrl || "https://images.unsplash.com/photo-1581578731522-745d05142206?auto=format&fit=crop&q=80&w=600"} className="w-full h-full object-cover" alt="" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <button onClick={() => setSelectedPost(null)} className="absolute top-4 right-4 bg-white/10 hover:bg-white/30 backdrop-blur-xl text-white w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all">
                  <X size={20} />
                </button>
                <div className="absolute bottom-6 left-6 right-6">
                  <span className="inline-block bg-amber-400 text-black text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter mb-2">
                    {selectedPost.category}
                  </span>
                  <h2 className="text-2xl md:text-3xl font-black text-white leading-tight uppercase tracking-tighter">{selectedPost.title}</h2>
                </div>
              </div>

              <div className="p-6 md:p-10 overflow-y-auto flex-grow bg-white rounded-t-[2.5rem] -mt-8 relative z-10">
                <div className="flex items-center gap-4 mb-8 pb-8 border-b border-zinc-100">
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-zinc-950 rounded-2xl flex items-center justify-center font-black text-xl text-amber-400 shrink-0">
                    {selectedPost.user?.name?.charAt(0).toUpperCase() || "?"}
                  </div>
                  <div>
                    <p className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-0.5">{t('works.posted_by')}</p>
                    <p className="font-bold text-zinc-900">{selectedPost.user?.name || "Usuario de la plataforma"}</p>
                  </div>
                </div>

                <div className="mb-8">
                  <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Info size={14} /> {t('post.desc_label')}
                  </h4>
                  <p className="text-zinc-600 leading-relaxed">{selectedPost.description}</p>
                </div>

                <div className="flex flex-wrap items-center gap-6 mb-10">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-zinc-400 uppercase">{t('works.filter_location')}</span>
                    <span className="font-bold text-zinc-900 flex items-center gap-1.5"><MapPin size={16} className="text-amber-500" /> {selectedPost.location}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-zinc-400 uppercase">{t('people.skills')}</span>
                    <span className="font-bold text-zinc-900 flex items-center gap-1.5"><Briefcase size={16} className="text-amber-500" /> Profesionales</span>
                  </div>
                </div>

                <div className="space-y-4 pt-6">
                  {!user && (
                    <Link to="/login" className="w-full py-4 md:py-5 bg-amber-400 text-black rounded-[2rem] text-center font-black uppercase tracking-widest hover:bg-amber-300 transition-all block shadow-xl shadow-amber-400/20">
                      {t('auth.login_button')}
                    </Link>
                  )}
                  {user && selectedPost.user && String(user._id) !== String(selectedPost.user._id || selectedPost.user) && (
                    <ApplyButton
                      postId={selectedPost._id}
                      user={user}
                      token={token}
                      hasApplied={selectedPost.applicants?.some(app => (typeof app === 'string' ? app : app.user) === user._id)}
                      onApplySuccess={(userId) => handleApplySuccess(selectedPost._id, userId)}
                    />
                  )}
                  {user && selectedPost.user && String(user._id) === String(selectedPost.user._id || selectedPost.user) && (
                    <div className="p-6 bg-zinc-50 border border-zinc-100 rounded-3xl text-center">
                      <p className="text-zinc-500 font-bold flex items-center justify-center gap-2"><Briefcase size={18} /> Esta es tu publicación</p>
                    </div>
                  )}
                  <Link
                    to={`/post/${selectedPost._id}`}
                    className="w-full py-4 md:py-5 bg-zinc-100 text-zinc-900 rounded-[2rem] text-center font-black uppercase tracking-widest hover:bg-zinc-200 transition-all block"
                  >
                    {t('works.details')}
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}