import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../Context/AuthContext';
import { useSocketContext } from '../Context/SocketContext';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// Importa los componentes que crearemos
import ConversationList from '../components/Chat/ConversationList.jsx';
import ChatWindow from '../components/Chat/ChatWindow.jsx';

export default function ChatPage() {
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { conversationId } = useParams();
    const navigate = useNavigate();
    const { socket } = useSocketContext();

    // SIMULACIÓN DE TOKEN Y USER ID (REEMPLAZA CON TU LÓGICA DE AUTENTICACIÓN)
    const { token, user } = useAuthContext();

    // Función para cargar la lista de conversaciones
    useEffect(() => {
        if (!token) return;

        const fetchConversations = async () => {
            try {
                const res = await fetch(import.meta.env.VITE_API_URL + "/api/chats", {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!res.ok) throw new Error("Error al cargar las conversaciones");
                const data = await res.json();
                setConversations(data);

                if (conversationId) {
                    const targetChat = data.find(c => c._id === conversationId);
                    if (targetChat) setSelectedConversation(targetChat);
                } else if (data.length > 0 && !selectedConversation) {
                    setSelectedConversation(data[0]);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchConversations();
        // Escuchamos actualizaciones de la lista vía socket
        if (socket) {
            socket.on('refreshConversations', fetchConversations);
            return () => socket.off('refreshConversations');
        }
    }, [token, conversationId, socket]);

    const handleDeleteConversation = async (id) => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/chats/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                // 1. Quitamos la conversación de la lista local
                setConversations(prev => prev.filter(c => c._id !== id));

                // 2. Si el chat borrado era el que estaba abierto, lo cerramos
                if (selectedConversation?._id === id) {
                    setSelectedConversation(null);
                    navigate('/chat');
                }
                toast.success("Conversación ocultada");
            } else {
                const errorData = await res.json();
                toast.error(errorData.message || "No se pudo ocultar");
            }
        } catch (err) {
            console.error("Error eliminando chat:", err);
            toast.error("Error de conexión");
        }
    };

    const handleSelectConversation = async (conv) => {
        setSelectedConversation(conv);
        navigate(`/chat/${conv._id}`);

        if (conv.unreadBy?.includes(user._id)) {
            try {
                await fetch(`${import.meta.env.VITE_API_URL}/api/chats/${conv._id}/read`, {
                    method: 'PATCH',
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                // 🚨 IMPORTANTE: Emitimos un evento global para que mi propio Nav escuche
                if (socket) {
                    socket.emit('markRead', { conversationId: conv._id });
                }

                // Actualizamos la lista local de chats para que el punto desaparezca de la lista izquierda
                setConversations(prev => prev.map(c =>
                    c._id === conv._id
                        ? { ...c, unreadBy: c.unreadBy.filter(id => id !== user._id) }
                        : c
                ));
            } catch (err) {
                console.error("Error al marcar como leído", err);
            }
        }
    };

    if (loading) return <div className="text-center mt-10">Cargando chats...</div>;
    if (error) return <div className="text-center mt-10 text-red-500">Error: {error}</div>;

    return (
        <div className="flex h-[80vh] bg-gray-50 border border-gray-200 rounded-lg shadow-xl mx-auto my-8 max-w-6xl">

            {/* Panel Izquierdo: Lista de Conversaciones */}
            <div className="w-1/3 border-r border-gray-300 overflow-y-auto bg-white">
                <h2 className="text-xl font-bold p-4 bg-gray-100 sticky top-0">Conversaciones</h2>
                <ConversationList
                    conversations={conversations}
                    onSelectConversation={handleSelectConversation}
                    onDeleteConversation={handleDeleteConversation}
                    selectedId={selectedConversation?._id}
                    loggedInUserId={user._id}
                />
            </div>

            {/* Panel Derecho: Ventana de Chat Activa */}
            <div className="w-2/3 flex flex-col">
                {selectedConversation ? (
                    <ChatWindow
                        conversation={selectedConversation}
                        token={token}
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        Selecciona un chat para comenzar
                    </div>
                )}
            </div>
        </div>
    );
}