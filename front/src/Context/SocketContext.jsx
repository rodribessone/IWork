import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuthContext } from '../Context/AuthContext';

const SocketContext = createContext();

export const useSocketContext = () => {
    return useContext(SocketContext);
};

export const SocketContextProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const { user, token } = useAuthContext()

    useEffect(() => {
        if (user?._id && token) {
            const newSocket = io("http://localhost:5000", {
                auth: {
                    token: token, // 👈 Usamos el token del contexto
                },
                transports: ["websocket"],
                reconnectionAttempts: 5,
            });

            setSocket(newSocket);

            // Escuchar usuarios en línea
            newSocket.on("getOnlineUsers", (users) => {
                setOnlineUsers(users);
            });

            // 4. Función de limpieza (Cleanup)
            return () => {
                newSocket.close();
                setSocket(null);
            };
        } else {
            // 5. Si no hay usuario (logout), cerramos cualquier socket activo
            if (socket) {
                socket.close();
                setSocket(null);
            }
            setOnlineUsers([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?._id, token]); // Solo re-ejecutar si el ID del usuario cambia

    return (
        <SocketContext.Provider value={{ socket, onlineUsers }}>
            {children}
        </SocketContext.Provider>
    );
};