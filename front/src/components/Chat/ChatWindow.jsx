import React, { useState, useEffect, useRef } from 'react';
import { useSocketContext } from '../../Context/SocketContext';
import { useAuthContext } from '../../Context/AuthContext';
import { useTranslation } from "react-i18next"; // <-- Importamos i18next

export default function ChatWindow({ conversation, token }) {
    const { t, i18n } = useTranslation(); // <-- Hook de traducción
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const { socket, onlineUsers } = useSocketContext();
    const { user: loggedInUser } = useAuthContext();

    // Helper para formatear hora dinámicamente según el idioma del i18n
    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        return date.toLocaleTimeString(i18n.language === 'es' ? 'es-ES' : 'en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (!loggedInUser) {
        return <div className="text-center py-10">{t('common.loading')}</div>;
    }

    const otherUser = conversation.participants.find(p => p._id !== loggedInUser._id);
    const isOnline = onlineUsers.includes(String(otherUser?._id));

    // Cargar Mensajes
    useEffect(() => {
        if (!conversation || !token) return;

        const fetchMessages = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/chats/${conversation._id}/messages`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!res.ok) throw new Error(t('chat.errors.loadMessages'));
                const data = await res.json();
                setMessages(data);
            } catch (err) {
                console.error(err);
                setMessages([]);
            } finally {
                setLoading(false);
            }
        };

        fetchMessages();
    }, [conversation._id, token, t]);

    // Marcar como leído
    useEffect(() => {
        if (!conversation?._id || !token || !socket || messages.length === 0) return;

        const markAsRead = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/chats/${conversation._id}/read`, {
                    method: 'PATCH',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    socket.emit('markMessagesAsRead', {
                        conversationId: conversation._id,
                        userId: loggedInUser._id
                    });
                }
            } catch (err) {
                console.error("Error marking as read:", err);
            }
        };
        markAsRead();
    }, [conversation._id, token, socket, messages.length]);

    // Socket: Recibir mensajes
    useEffect(() => {
        if (socket) {
            const handleReceiveMessage = (message) => {
                if (message.conversationId === conversation._id) {
                    setMessages((prevMessages) => [...prevMessages, message]);
                }
            };
            socket.on('receiveMessage', handleReceiveMessage);
            return () => socket.off('receiveMessage', handleReceiveMessage);
        }
    }, [socket, conversation._id]);

    // Scroll automático
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !socket) return;

        const messageText = newMessage.trim();
        const messageToSend = {
            conversationId: conversation._id,
            senderId: loggedInUser._id,
            text: messageText,
            recipientId: otherUser._id
        };

        // Optimista
        setMessages((prevMessages) => [...prevMessages, { ...messageToSend, createdAt: new Date().toISOString() }]);
        setNewMessage('');

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/chats/message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ conversationId: conversation._id, text: messageText }),
            });

            if (!res.ok) throw new Error();
            const persistedMessage = await res.json();

            setMessages((prevMessages) =>
                prevMessages.map(msg =>
                    msg.createdAt === messageToSend.createdAt && !msg._id ? persistedMessage : msg
                )
            );

            socket.emit('sendMessage', { ...persistedMessage, recipientId: otherUser._id });

        } catch (err) {
            console.error("Error sending message:", err);
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Encabezado del Chat */}
            <div className="p-4 border-b bg-white flex items-center justify-between shadow-sm">
                <div className="flex items-center">
                    <div className="relative mr-3">
                        <img
                            src={otherUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser.name)}&background=random`}
                            alt="Avatar"
                            className="w-10 h-10 rounded-full object-cover border border-gray-200"
                        />
                        {isOnline && (
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                        )}
                    </div>
                    <div>
                        <h3 className="font-bold">{otherUser?.name}</h3>
                        <p className={`text-xs ${isOnline ? 'text-green-500 font-medium' : 'text-gray-400'}`}>
                            {isOnline ? t('common.status.online') : t('common.status.offline')}
                        </p>
                    </div>
                </div>

                <div className="hidden sm:block text-right">
                    <p className="text-xs text-gray-400 uppercase font-bold">{t('post.title_label')}</p>
                    <p className="text-sm text-amber-600 font-semibold truncate max-w-[200px]">
                        {conversation.postId?.title || t('post.notFound')}
                    </p>
                </div>
            </div>

            {/* Área de Mensajes */}
            <div className="flex-grow p-4 overflow-y-auto space-y-4 bg-white">
                {loading ? (
                    <div className="text-center text-gray-500">{t('chat.loading')}</div>
                ) : (
                    messages.map((msg, index) => {
                        const isMyMessage = loggedInUser && msg.senderId && String(msg.senderId) === String(loggedInUser._id);
                        return (
                            <div key={msg._id || index} className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-xs lg:max-w-md p-3 rounded-lg shadow-md ${isMyMessage ? 'bg-green-500 text-white rounded-br-none' : 'bg-gray-200 text-gray-800 rounded-bl-none'
                                    }`}>
                                    <p className="text-sm">{msg.text}</p>
                                    <span className={`text-xs block mt-1 ${isMyMessage ? 'text-green-200' : 'text-gray-500'}`}>
                                        {formatTime(msg.createdAt)}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Formulario */}
            <form onSubmit={handleSendMessage} className="p-4 border-t bg-gray-50">
                <div className="flex">
                    <input
                        type="text"
                        placeholder={t('chat.inputPlaceholder')}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="flex-grow p-3 border border-gray-300 rounded-l-lg focus:ring-green-500 focus:border-green-500"
                    />
                    <button
                        type="submit"
                        className="bg-green-600 text-white p-3 rounded-r-lg hover:bg-green-700 transition duration-150"
                        disabled={!socket}
                    >
                        {t('common.send')}
                    </button>
                </div>
            </form>
        </div>
    );
}