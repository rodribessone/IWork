import React, { useState, useMemo } from 'react';
import { useSocketContext } from '../../Context/SocketContext';
import { Trash2, AlertCircle } from 'lucide-react';

export default function ConversationList({ conversations, onSelectConversation, onDeleteConversation, selectedId, loggedInUserId }) {
    const { onlineUsers } = useSocketContext();
    const [idToDelete, setIdToDelete] = useState(null);

    const processedConversations = useMemo(() => {
        return conversations.map(conv => {
            const otherUser = conv.participants.find(
                p => p && String(p._id) !== String(loggedInUserId)
            );
            return { ...conv, otherUser };
        }).filter(c => c.otherUser); // Eliminamos chats sin usuario válido
    }, [conversations, loggedInUserId]);


    return (
        <div className="flex flex-col">
            {processedConversations.map((conv) => {
                const isOnline = onlineUsers.includes(String(conv.otherUser._id));
                const isSelected = conv._id === selectedId;

                return (
                    <div
                        key={conv._id}
                        onClick={() => onSelectConversation(conv)}
                        className={`p-4 border-b cursor-pointer transition-all flex items-center justify-between group ${isSelected ? 'bg-green-50 border-l-4 border-green-500' : 'hover:bg-gray-50'
                            }`}
                    >
                        <div className="flex items-center space-x-3 overflow-hidden">
                            <div className="relative flex-shrink-0">
                                <img
                                    src={conv.otherUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(conv.otherUser.name)}&background=random`}
                                    alt="Avatar"
                                    className="w-10 h-10 rounded-full object-cover"
                                />
                                {isOnline && (
                                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                                )}
                            </div>
                            <div className="overflow-hidden">
                                <p className="font-semibold text-gray-800 truncate">{conv.otherUser.name}</p>
                                <p className="text-sm text-gray-500 truncate w-32 sm:w-48">
                                    {conv.lastMessage || 'Nueva conversación...'}
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIdToDelete(conv._id);
                            }}
                            className="p-2 text-gray-400 hover:text-red-500 transition-all flex-shrink-0 opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                );
            })}

            {/* MODAL DE CONFIRMACIÓN PROFESIONAL */}
            {idToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full transform transition-all scale-100 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center space-x-3 text-amber-500 mb-4">
                            <AlertCircle size={24} />
                            <h3 className="text-lg font-bold text-gray-900">¿Ocultar chat?</h3>
                        </div>
                        <p className="text-gray-600 mb-6 text-sm">
                            Esta conversación desaparecerá de tu lista. Volverá a aparecer si recibes o envías un nuevo mensaje a este usuario.
                        </p>
                        <div className="flex space-x-3">
                            <button
                                onClick={() => setIdToDelete(null)}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => {
                                    onDeleteConversation(idToDelete);
                                    setIdToDelete(null);
                                }}
                                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium transition-colors"
                            >
                                Ocultar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}