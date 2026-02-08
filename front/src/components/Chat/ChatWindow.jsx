import React, { useState, useEffect, useRef } from 'react';
import { useSocketContext } from '../../Context/SocketContext';
import { useAuthContext } from '../../Context/AuthContext';

const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    // Ejemplo: Devuelve la hora y los minutos (hh:mm)
    return date.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
    });
};

export default function ChatWindow({ conversation, token }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const { socket, onlineUsers } = useSocketContext();

    const { user: loggedInUser } = useAuthContext();
    if (!loggedInUser) {
        return <div className="text-center py-10">Cargando usuario...</div>;
    }

    const otherUser = conversation.participants.find(p => p._id !== loggedInUser._id); // El otro participante

    // 1. Cargar Mensajes al seleccionar una nueva conversación
    useEffect(() => {
        if (!conversation || !token) return;

        const fetchMessages = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/chats/${conversation._id}/messages`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!res.ok) throw new Error("Error al cargar mensajes.");

                const data = await res.json();
                setMessages(data);
            } catch (err) {
                console.error("Error al cargar mensajes:", err);
                setMessages([]);
            } finally {
                setLoading(false);
            }
        };

        fetchMessages();
    }, [conversation._id, token]);

    // 2. Escuchar mensajes entrantes en tiempo real
    useEffect(() => {
        if (socket) {
            const handleReceiveMessage = (message) => {
                // Solo añadir el mensaje si pertenece a la conversación actual
                if (message.conversationId === conversation._id) {
                    setMessages((prevMessages) => [...prevMessages, message]);
                }
            };

            socket.on('receiveMessage', handleReceiveMessage);

            return () => {
                socket.off('receiveMessage', handleReceiveMessage);
            };
        }
    }, [socket, conversation._id]);


    // Scroll automático al último mensaje
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);


    // 3. Enviar un nuevo mensaje (al backend y por Socket.io)
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !socket) return;

        const messageText = newMessage.trim();

        const messageToSend = {
            conversationId: conversation._id,
            senderId: loggedInUser._id,
            text: messageText,
            // recipientId es para Socket.io, no para el modelo de Mongoose
            recipientId: otherUser._id
        };

        // 1. Guardar mensaje localmente (optimista) y limpiar input
        setMessages((prevMessages) => [...prevMessages, { ...messageToSend, createdAt: new Date().toISOString() }]);
        setNewMessage('');

        try {
            // 2. 🚨 Paso de Persistencia: Llamada a Express/MongoDB
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/chats/message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                // Solo enviamos conversationId y text, el senderId se obtiene del token en el backend
                body: JSON.stringify({
                    conversationId: conversation._id,
                    text: messageText
                }),
            });

            if (!res.ok) {
                // Si falla la persistencia, mostrar error (o revertir el mensaje local si se implementa lógica más compleja)
                console.error("Error al persistir el mensaje en DB.");
            }

            const persistedMessage = await res.json();

            setMessages((prevMessages) =>
                prevMessages.map(msg =>
                    // Asume que el mensaje optimista no tiene _id, y el persistido sí lo tiene
                    msg.createdAt === messageToSend.createdAt && !msg._id
                        ? persistedMessage
                        : msg
                )
            );

            // 3. Emitir el mensaje por Socket.io SÓLO DESPUÉS DE LA PERSISTENCIA (o idealmente usar el objeto devuelto por el backend)
            socket.emit('sendMessage', {
                ...persistedMessage, // Usamos el objeto con _id y createdAt de la DB
                recipientId: otherUser._id // ID del receptor para que el socket.io backend lo retransmita
            });

        } catch (err) {
            console.error("Error en la secuencia de envío:", err);
            // Aquí podrías mostrar un error al usuario y/o eliminar el mensaje optimista.
        }
    };
    const isOnline = onlineUsers.includes(String(otherUser?._id));
    return (
        <div className="flex flex-col h-full">
            {onlineUsers.includes(String(otherUser._id)) && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
            )}
            {/* Encabezado del Chat */}
            <div className="p-4 border-b bg-white flex items-center justify-between shadow-sm">
                <div className="flex items-center">
                    <div className="relative mr-3"> {/* Contenedor relativo para la foto + punto */}
                        <img
                            src={otherUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser.name)}&background=random`}
                            alt="Avatar"
                            className="w-10 h-10 rounded-full object-cover border border-gray-200"
                        />
                        {/* El punto verde ahora sí aparecerá sobre la foto */}
                        {isOnline && (
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                        )}
                    </div>
                    <div>
                        <h3 className="font-bold">{otherUser?.name}</h3>
                        <p className={`text-xs ${isOnline ? 'text-green-500 font-medium' : 'text-gray-400'}`}>
                            {isOnline ? 'En línea' : 'Desconectado'}
                        </p>
                    </div>
                </div>

                {/* Este badge le recuerda al usuario el contexto del chat */}
                <div className="hidden sm:block text-right">
                    <p className="text-xs text-gray-400 uppercase font-bold">Postulación para:</p>
                    <p className="text-sm text-amber-600 font-semibold truncate max-w-[200px]">
                        {conversation.postId?.title || "Trabajo solicitado"}
                    </p>
                </div>
            </div>

            {/* Área de Mensajes */}
            <div className="flex-grow p-4 overflow-y-auto space-y-4 bg-white">
                {loading ? (
                    <div className="text-center text-gray-500">Cargando mensajes...</div>
                ) : (
                    messages.map((msg, index) => {
                        // 🚨 CORRECCIÓN 2: Asegurar la comparación de IDs
                        // Compara el senderId del mensaje con el _id del usuario logueado, convirtiéndolos a string.
                        const isMyMessage = loggedInUser && msg.senderId && String(msg.senderId) === String(loggedInUser._id);

                        return (
                            <div
                                key={msg._id || index} // Usar msg._id si existe, sino index (para mensajes optimistas)
                                // Mensajes del usuario actual a la derecha, del otro usuario a la izquierda
                                className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`max-w-xs lg:max-w-md p-3 rounded-lg shadow-md 
                                    ${isMyMessage
                                        ? 'bg-green-500 text-white rounded-br-none'
                                        : 'bg-gray-200 text-gray-800 rounded-bl-none'
                                    }`}
                                >
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

            {/* Formulario de Envío de Mensajes */}
            <form onSubmit={handleSendMessage} className="p-4 border-t bg-gray-50">
                <div className="flex">
                    <input
                        type="text"
                        placeholder="Escribe un mensaje..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="flex-grow p-3 border border-gray-300 rounded-l-lg focus:ring-green-500 focus:border-green-500"
                    />
                    <button
                        type="submit"
                        className="bg-green-600 text-white p-3 rounded-r-lg hover:bg-green-700 transition duration-150"
                        disabled={!socket}
                    >
                        Enviar
                    </button>
                </div>
            </form>
        </div>
    );
}