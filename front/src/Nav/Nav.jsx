import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSocketContext } from '../Context/SocketContext'; // Importamos el socket
import { useEffect, useState } from 'react';
import { useAuthContext } from '../Context/AuthContext';
import { Search, MessageSquare, LogOut, User as UserIcon, PlusCircle } from 'lucide-react';

export default function Nav() {
  const navigate = useNavigate();
  const location = useLocation(); // Para saber en qué página estamos
  const [search, setSearch] = useState("");
  const { user, token, logout } = useAuthContext();
  const { socket } = useSocketContext();
  const [hasUnread, setHasUnread] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleSearch = (e) => {
    if (e.key === "Enter" && search.trim() !== "") {
      navigate(`/search?q=${encodeURIComponent(search.trim())}`);
      setSearch("");
    }
  };

  // Función para saber si un link está activo y cambiar su color
  const isActive = (path) => location.pathname === path ? "text-amber-400" : "text-white";

  const checkUnreadMessages = async () => {
    if (!token) return;
    try {
      const res = await fetch(import.meta.env.VITE_API_URL + "/api/chats", {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      // Verificamos si alguna conversación tiene nuestro ID en 'unreadBy'
      const unread = data.some(conv =>
        conv.unreadBy?.some(unreadId => String(unreadId) === String(user._id))
      );
      setHasUnread(unread);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!token || !user) return;

    checkUnreadMessages();

    if (socket) {
      // 1. Cuando recibo un mensaje nuevo: punto rojo ON
      socket.on('refreshConversations', () => {
        console.log("Nuevo mensaje recibido, activando punto rojo...");
        setHasUnread(true); // <--- Lo activamos sin esperar al fetch

        // Opcionalmente refrescamos los datos de fondo para estar sincronizados
        setTimeout(checkUnreadMessages, 1000);
      });

      // 2. Cuando yo mismo leo un mensaje (desde ChatPage): punto rojo OFF
      socket.on('updateUnreadCounters', () => {
        // Aquí sí hacemos el fetch para ver si quedan OTROS chats sin leer
        checkUnreadMessages();
      });

      return () => {
        socket.off('refreshConversations');
        socket.off('updateUnreadCounters');
      };
    }
  }, [socket, user?._id, token]);

  return (
    <nav className="bg-zinc-950 text-white flex justify-between items-center px-8 py-3 w-full shadow-lg sticky top-0 z-50">

      {/* Logo con estilo */}
      <Link to="/" className="text-2xl font-black tracking-tighter text-amber-400 hover:opacity-80 transition">
        IWORK<span className="text-white">.</span>
      </Link>

      {/* Buscador Profesional */}
      <div className="hidden md:flex items-center bg-zinc-900 border border-zinc-800 rounded-full px-3 py-1.5 focus-within:ring-2 focus-within:ring-amber-500/50 transition-all w-96">
        <Search size={18} className="text-zinc-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleSearch}
          placeholder="Buscar servicios, personas..."
          className="bg-transparent border-none outline-none px-3 text-sm w-full placeholder:text-zinc-600"
        />
      </div>

      {/* Enlaces y Acciones */}
      <div className="flex items-center gap-8">
        <div className="hidden lg:flex items-center gap-6 text-sm font-medium">
          <Link to="/works" className={`${isActive('/works')} hover:text-amber-400 transition`}>Trabajos</Link>
          <Link to="/people" className={`${isActive('/people')} hover:text-amber-400 transition`}>Profesionales</Link>
        </div>

        {user ? (
          <div className="flex items-center gap-5 border-l border-zinc-800 pl-6">
            {/* Icono de Mensajes con Notificación */}
            <Link to="/chat" className="relative text-zinc-400 hover:text-amber-400 transition">
              <MessageSquare size={22} />
              {hasUnread && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 border-2 border-zinc-950 rounded-full animate-pulse"></span>
              )}
            </Link>

            <Link to="/newPost" className="text-zinc-400 hover:text-amber-400 transition" title="Publicar">
              <PlusCircle size={22} />
            </Link>

            {/* Avatar del Usuario */}
            <div className="flex items-center gap-3 group cursor-pointer relative">
              <Link to="/profile" className="flex items-center gap-2">
                <img
                  src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}`}
                  className="w-8 h-8 rounded-full object-cover border border-zinc-700 group-hover:border-amber-400 transition"
                  alt="Perfil"
                />
                <span className="hidden sm:inline text-sm font-semibold group-hover:text-amber-400 transition">{user.name.split(' ')[0]}</span>
              </Link>

              <button
                onClick={handleLogout}
                className="text-zinc-500 hover:text-red-400 transition ml-2"
                title="Cerrar Sesión"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium hover:text-amber-400 transition">
              Ingresar
            </Link>
            <Link
              to="/register"
              className="bg-amber-400 text-black text-sm px-5 py-2 rounded-full font-bold hover:bg-amber-300 transition shadow-lg shadow-amber-400/10"
            >
              Registrarse
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}