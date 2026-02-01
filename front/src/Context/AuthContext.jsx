import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuthContext = () => {
    return useContext(AuthContext);
};

export const AuthContextProvider = ({ children }) => {
    // 🚨 El estado inicial debería intentar cargar el usuario y token del localStorage
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(
        localStorage.getItem("iwork_token") || null
    );
    const [loading, setLoading] = useState(true);


    const fetchUserFromToken = async (userToken) => {
        try {
            setLoading(true);
            const res = await fetch("http://localhost:5000/api/auth/me", { // 🚨 ASEGÚRATE DE TENER ESTA RUTA
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${userToken}`, // Envías el token
                },
            });

            if (res.ok) {
                const data = await res.json();
                setUser(data.user); // Actualiza el estado con el usuario REAL
                // 🚨 Opcional: Podrías guardar el objeto user en localStorage aquí si quieres evitar el flicker, pero lo ideal es solo usarlo para el estado.
            } else {
                console.error("Token inválido o expirado. Forzando logout.");
                logout(); // Si el token falla la validación, hacemos logout
            }
        } catch (err) {
            console.error("Error al validar token:", err);
            logout();
        } finally {
            setLoading(false);
        }
    };

    // EFECTO: Se ejecuta al cargar la aplicación si hay un token
    useEffect(() => {
        if (token) {
            fetchUserFromToken(token);
        } else {
            setLoading(false); // Si no hay token, terminamos la carga inicial
        }
        // Solo depende del token. Si cambia, vuelve a cargar el usuario.
    }, [token]);

    // Puedes añadir funciones de login/logout aquí
    const login = (userToken) => {
        setUser(null);
        setToken(userToken);
        localStorage.setItem("iwork_token", userToken);
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem("iwork_token");
    };

    const contextValue = {
        user,
        token,
        login,
        logout,
        // Puedes añadir 'loading' si tu lógica de token lo requiere
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};