// src/pages/ChatPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../Context/AuthContext';
import { useSocketContext } from '../Context/SocketContext';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

import ConversationList from '../components/Chat/ConversationList.jsx';
import ChatWindow from '../components/Chat/ChatWindow.jsx';

export default function ChatPage() {
    const { t } = useTranslation();
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { conversationId } = useParams();
    const navigate = useNavigate();
    const { socket } = useSocketContext();
    const { token, user } = useAuthContext();

    useEffect(() => {
        if (!token) return;

        const fetchConversations = async () => {
            try {
                const res = await fetch(import.meta.env.VITE_API_URL + "/api/chats", {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!res.ok) throw new Error(t('chat.errors.loadConversations'));
                const data = await res.json();
                setConversations(data);

                if (conversationId) {
                    const targetChat = data.find(c => c._id === conversationId);
                    if (targetChat) setSelectedConversation(targetChat);
                } else if (data.length > 0 && !selectedConversation) {
                    // En desktop auto-seleccionamos la primera, en móvil no
                    const isMobile = window.innerWidth < 768;
                    if (!isMobile) setSelectedConversation(data[0]);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchConversations();

        if (socket) {
            socket.on('refreshConversations', fetchConversations);
            return () => socket.off('refreshConversations');
        }
    }, [token, conversationId, socket, t]);

    const handleDeleteConversation = async (id) => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/chats/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                setConversations(prev => prev.filter(c => c._id !== id));
                if (selectedConversation?._id === id) {
                    setSelectedConversation(null);
                    navigate('/chat');
                }
                toast.success(t('chat.status.deleted'));
            } else {
                const errorData = await res.json();
                toast.error(errorData.message || t('chat.errors.generic'));
            }
        } catch (err) {
            console.error("Error eliminando chat:", err);
            toast.error(t('chat.errors.connection'));
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
                if (socket) socket.emit('markRead', { conversationId: conv._id });
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

    const handleBackToList = () => {
        setSelectedConversation(null);
        navigate('/chat');
    };

    if (loading) return (
        <div className="text-center mt-10 text-zinc-500">{t('chat.loading')}</div>
    );
    if (error) return (
        <div className="text-center mt-10 text-red-500">{t('chat.errors.prefix')}: {error}</div>
    );

    return (
        <div className="max-w-6xl mx-auto my-4 md:my-8 mx-2 md:mx-auto h-[calc(100vh-120px)] md:h-[80vh] bg-gray-50 border border-gray-200 rounded-xl shadow-xl overflow-hidden flex">

            {/* Panel Izquierdo: Lista de conversaciones
                - Móvil: visible solo cuando NO hay conversación seleccionada
                - Desktop: siempre visible como columna izquierda */}
            <div className={`
                flex-col bg-white border-r border-gray-200
                w-full md:w-1/3 md:flex
                ${selectedConversation ? 'hidden' : 'flex'}
            `}>
                <h2 className="text-lg md:text-xl font-bold p-4 bg-gray-100 sticky top-0 border-b border-gray-200">
                    {t('chat.sidebarTitle')}
                </h2>
                <div className="overflow-y-auto flex-1">
                    <ConversationList
                        conversations={conversations}
                        onSelectConversation={handleSelectConversation}
                        onDeleteConversation={handleDeleteConversation}
                        selectedId={selectedConversation?._id}
                        loggedInUserId={user._id}
                    />
                </div>
            </div>

            {/* Panel Derecho: Ventana de chat
                - Móvil: visible solo cuando HAY conversación seleccionada
                - Desktop: siempre visible como columna derecha */}
            <div className={`
                flex-col
                w-full md:w-2/3 md:flex
                ${selectedConversation ? 'flex' : 'hidden md:flex'}
            `}>
                {selectedConversation ? (
                    <>
                        {/* Botón "Volver" solo visible en móvil */}
                        <div className="md:hidden px-4 py-2 bg-white border-b border-gray-200">
                            <button
                                onClick={handleBackToList}
                                className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 font-bold text-sm transition-colors"
                            >
                                <ArrowLeft size={18} /> {t('common.back')}
                            </button>
                        </div>
                        <ChatWindow
                            conversation={selectedConversation}
                            token={token}
                        />
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 text-sm font-medium">
                        {t('chat.noSelected')}
                    </div>
                )}
            </div>
        </div>
    );
}