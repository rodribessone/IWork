import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search, MapPin, Briefcase, Filter, X,
  MessageSquare, User, Star, ArrowRight, Award
} from 'lucide-react';
import { useAuthContext } from '../Context/AuthContext';

// Sub-componente para la tarjeta de profesional
const UserCard = ({ u, onClick }) => (
  <div
    onClick={() => onClick(u)}
    className="group bg-white rounded-[2rem] shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 cursor-pointer border border-zinc-100 overflow-hidden flex flex-col h-full"
  >
    {/* Banner decorativo y Avatar */}
    <div className="relative h-24 bg-zinc-950 shrink-0">
      <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
      <div className="absolute -bottom-10 left-6">
        <img
          src={u.avatar || `https://ui-avatars.com/api/?name=${u.name}&background=random`}
          alt={u.name}
          className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-lg group-hover:scale-105 transition-transform duration-500"
        />
      </div>
    </div>

    <div className="p-6 pt-12 flex flex-col flex-grow">
      <div className="flex justify-between items-start mb-2">
        <h2 className="text-xl font-black text-zinc-900 leading-none group-hover:text-amber-600 transition-colors uppercase tracking-tighter">
          {u.name}
        </h2>
        {u.verified && <Award size={18} className="text-amber-500" />}
      </div>

      <p className="text-amber-600 font-black text-[10px] uppercase tracking-[0.2em] mb-4">
        {u.profession || "Especialista Multi-oficio"}
      </p>

      <p className="text-zinc-500 text-sm line-clamp-2 mb-6 leading-relaxed flex-grow">
        {u.bio || "Profesional comprometido con la calidad y la excelencia en cada proyecto."}
      </p>

      <div className="pt-5 border-t border-zinc-50 flex items-center justify-between mt-auto">
        <span className="text-[10px] font-bold text-zinc-400 flex items-center gap-1.5 bg-zinc-100 px-3 py-1.5 rounded-full">
          <MapPin size={12} className="text-zinc-400" />
          {u.location || "Ubicación N/A"}
        </span>
        <span className="text-zinc-900 text-xs font-black uppercase tracking-widest flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
          Perfil <ArrowRight size={14} />
        </span>
      </div>
    </div>
  </div>
);

export default function People() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [profession, setProfession] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const { user: currentUser, token } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/users?lookingForWork=true", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [token]);

  useEffect(() => { setCurrentPage(1); }, [search, location, profession]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const nameMatch = u.name.toLowerCase().includes(search.toLowerCase());
      const locationMatch = (u.location || "").toLowerCase().includes(location.toLowerCase());
      const professionMatch = profession === "" ||
        (u.profession || "").toLowerCase().includes(profession.toLowerCase()) ||
        u.skills?.some((skill) => skill.toLowerCase().includes(profession.toLowerCase()));
      return nameMatch && locationMatch && professionMatch;
    });
  }, [users, search, location, profession]);

  const handleContactUser = async (recipientId) => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    try {
      const res = await fetch("http://localhost:5000/api/chats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ recipientId, postId: null }),
      });
      const data = await res.json();
      if (res.ok) navigate(`/chat/${data._id}`);
    } catch (err) { console.error(err); }
  };

  const currentUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 bg-zinc-50/50 min-h-screen font-sans">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <h1 className="text-5xl font-black text-zinc-950 tracking-tighter mb-3 uppercase">Directorio de Expertos</h1>
          <p className="text-zinc-500 text-lg">Conecta con los profesionales más calificados de tu zona.</p>
        </div>
        <div className="bg-white px-6 py-3 rounded-2xl border border-zinc-200 shadow-sm">
          <span className="text-zinc-900 font-black">{filteredUsers.length} expertos </span>
          <span className="text-zinc-400 text-sm font-medium">encontrados</span>
        </div>
      </div>

      {/* Filtros Pro (Igual que en Works) */}
      <div className="bg-white rounded-[2rem] shadow-xl shadow-zinc-200/50 border border-zinc-100 p-2 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
          <div className="md:col-span-4 relative group">
            <User className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-amber-500 transition-colors" size={20} />
            <input
              type="text"
              placeholder="Nombre del profesional..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-14 pr-6 py-5 bg-transparent rounded-2xl outline-none text-zinc-800 font-medium"
            />
          </div>
          <div className="md:col-span-4 border-l border-zinc-100 relative group">
            <Briefcase className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-amber-500 transition-colors" size={20} />
            <input
              type="text"
              placeholder="Oficio o habilidad..."
              value={profession}
              onChange={(e) => setProfession(e.target.value)}
              className="w-full pl-14 pr-6 py-5 bg-transparent rounded-2xl outline-none text-zinc-800 font-medium"
            />
          </div>
          <div className="md:col-span-2 border-l border-zinc-100 relative group">
            <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-amber-500 transition-colors" size={20} />
            <input
              type="text"
              placeholder="Ciudad"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full pl-14 pr-6 py-5 bg-transparent rounded-2xl outline-none text-zinc-800 font-medium"
            />
          </div>
          <div className="md:col-span-2 flex items-center p-2">
            <button
              onClick={() => { setSearch(""); setLocation(""); setProfession(""); }}
              className="w-full h-full bg-zinc-900 text-white rounded-2xl font-bold hover:bg-zinc-800 transition-all flex items-center justify-center gap-2"
            >
              <Filter size={18} /> Limpiar
            </button>
          </div>
        </div>
      </div>

      {/* Listado */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => <div key={i} className="h-72 bg-white rounded-[2rem] animate-pulse border border-zinc-100" />)}
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-zinc-200">
          <User size={48} className="mx-auto text-zinc-200 mb-4" />
          <p className="text-zinc-500 font-bold">No se encontraron perfiles para tu búsqueda.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {currentUsers.map((u) => <UserCard key={u._id} u={u} onClick={setSelectedUser} />)}
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-20 gap-3">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="px-6 py-3 rounded-2xl font-bold bg-white border border-zinc-200 disabled:opacity-20 transition-all flex items-center gap-2"
              >
                ← Anterior
              </button>
              <div className="flex gap-2">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-12 h-12 rounded-2xl font-black transition-all ${currentPage === i + 1 ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/20' : 'bg-white text-zinc-400 border border-zinc-100'}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="px-6 py-3 rounded-2xl font-bold bg-white border border-zinc-200 disabled:opacity-20 transition-all flex items-center gap-2"
              >
                Siguiente →
              </button>
            </div>
          )}
        </>
      )}

      {/* Sidebar de Perfil Premium */}
      <div
        onClick={() => setSelectedUser(null)}
        className={`fixed inset-0 bg-zinc-950/80 backdrop-blur-sm z-[100] transition-opacity duration-500 ${selectedUser ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className={`absolute right-0 top-0 bg-white w-full md:w-[450px] h-full shadow-2xl transform transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] flex flex-col ${selectedUser ? "translate-x-0" : "translate-x-full"}`}
        >
          {selectedUser && (
            <>
              {/* Header con Banner - QUITAMOS overflow-hidden para que permita ver lo que sobresale */}
              <div className="relative h-32 bg-zinc-900 shrink-0 z-0">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/graphy-dark.png')]"></div>

                {/* BOTÓN CERRAR - Subimos su z-index */}
                <button
                  onClick={() => setSelectedUser(null)}
                  className="absolute top-6 right-6 bg-white/10 hover:bg-white/30 backdrop-blur-md text-white w-10 h-10 rounded-full flex items-center justify-center transition-all z-50"
                >
                  <X size={20} />
                </button>

                {/* LA FOTO: Ahora vive dentro del div del banner pero posicionada absolutamente para flotar encima de la unión */}
                <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 z-40">
                  <img
                    src={selectedUser.avatar || `https://ui-avatars.com/api/?name=${selectedUser.name}&background=random`}
                    className="w-28 h-28 rounded-3xl object-cover border-4 border-white shadow-2xl bg-white"
                    alt={selectedUser.name}
                  />
                </div>
              </div>

              {/* CONTENIDO - Agregamos padding top extra para compensar que la foto ya no ocupa espacio aquí */}
              <div className="relative z-10 px-10 pb-10 pt-16 flex-grow overflow-y-auto">
                {/* Info de Perfil */}
                <div className="mb-8 text-center flex flex-col items-center">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-3xl font-black text-zinc-950 tracking-tighter uppercase">{selectedUser.name}</h2>
                    {selectedUser.verified && <Award className="text-amber-500" size={24} />}
                  </div>
                  <p className="text-amber-600 font-black text-xs uppercase tracking-widest">{selectedUser.profession || "Especialista"}</p>
                  <p className="text-zinc-400 text-sm mt-2 flex items-center gap-1.5"><MapPin size={14} /> {selectedUser.location || "Ubicación no disponible"}</p>
                </div>

                {/* Sobre mí */}
                <div className="mb-10 p-6 bg-zinc-50 rounded-[2rem] border border-zinc-100">
                  <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-3">Resumen profesional</h4>
                  <p className="text-zinc-600 leading-relaxed italic">
                    "{selectedUser.bio || "Este profesional aún no ha redactado su biografía, pero está disponible para nuevos proyectos."}"
                  </p>
                </div>

                {/* Habilidades */}
                <div className="mb-10">
                  <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-4">Habilidades destacadas</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedUser.skills?.map((skill, i) => (
                      <span key={i} className="bg-white border border-zinc-200 text-zinc-700 px-4 py-2 rounded-xl text-xs font-bold shadow-sm">
                        {skill}
                      </span>
                    )) || <span className="text-zinc-400 text-xs italic">No especificadas</span>}
                  </div>
                </div>

                {/* Acciones */}
                <div className="space-y-4">
                  {currentUser?._id !== selectedUser._id && (
                    <button
                      onClick={() => handleContactUser(selectedUser._id)}
                      className="w-full py-5 bg-amber-400 text-black rounded-[2rem] font-black uppercase tracking-widest hover:bg-amber-300 transition-all flex items-center justify-center gap-3 shadow-xl shadow-amber-400/20"
                    >
                      <MessageSquare size={20} /> Enviar Mensaje
                    </button>
                  )}

                  <Link
                    to={`/users/${selectedUser._id}`}
                    className="w-full py-5 bg-zinc-950 text-white rounded-[2rem] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all flex items-center justify-center gap-3"
                  >
                    Ver Perfil Completo
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