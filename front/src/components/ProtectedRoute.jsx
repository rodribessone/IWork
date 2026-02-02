import { Navigate, Outlet } from "react-router-dom";
import { useAuthContext } from "../Context/AuthContext";

const ProtectedRoute = () => {
  const { user, loading } = useAuthContext();

  // Mientras se verifica el usuario (loading true), mostramos nada o un spinner
  // Para evitar "parpadeos" de redirección
  if (loading) return null;

  // Si no hay usuario, mandamos al login
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
