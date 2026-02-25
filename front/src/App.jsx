import './App.css';
import Nav from './Nav/Nav';
import Home from './pages/Home';
import OwnerPostView from './pages/OwnerPostView';
import Works from './pages/Works';
import People from './pages/People';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from "./pages/Profile";
import EditPost from "./pages/EditPost";
import PostDetail from "./pages/PostDetail";
import UserProfile from './pages/UserProfile';
import Search from './search/Search';
import CreatePost from './pages/CreatePost';
import Chat from './pages/ChatPage';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from 'react-hot-toast';
import MyApplications from './pages/MyApplications';
import LeaveReview from './pages/LeaveReview';
import usePageTracking from './hooks/usePageTracking'; // 👈 GA4
import Footer from './components/Footer';

import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

import { useAuthContext } from './Context/AuthContext';
import { GA_MEASUREMENT_ID } from './utils/analytics'; // 👈 GA4

// ─── Inyección del script de GA4 ──────────────────────────────
// Se ejecuta una sola vez al montar la app.
// Equivale a pegar el snippet de Google en el <head> del HTML.
function injectGAScript(measurementId) {
  if (document.getElementById('ga4-script')) return; // evitar doble inyección

  // Paso 1: Preparar dataLayer y gtag() ANTES de cargar el script externo
  // Así los eventos que llegan temprano quedan encolados y no se pierden
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', measurementId, { send_page_view: false });

  // Paso 2: Cargar el script de Google (ya hay cola, nada se pierde)
  const script = document.createElement('script');
  script.id = 'ga4-script';
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);
}

function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

function App() {
  const { user, loading } = useAuthContext();
  const navigate = useNavigate();

  // ─── Inicializar GA4 una sola vez ──────────────────────────
  useEffect(() => {
    injectGAScript(GA_MEASUREMENT_ID);
  }, []);

  // ─── Trackear cada cambio de página automáticamente ────────
  usePageTracking();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-xl font-semibold text-gray-600">
          Cargando usuario...
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
        }}
      />
      <Nav />
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/works" element={<Works />} />
        <Route path="/people" element={<People />} />
        <Route path="/post/:id" element={<PostDetail />} />
        <Route path="/users/:userId" element={<UserProfile />} />
        <Route path="/search" element={<Search />} />

        {/* Rutas Protegidas */}
        <Route element={<ProtectedRoute />}>
          <Route path="/newPost" element={<CreatePost user={user} />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/ownerPostView/:id" element={<OwnerPostView user={user} />} />
          <Route path="/editar/:id" element={<EditPost />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/chat/:conversationId" element={<Chat />} />
          <Route path="/myApplications" element={<MyApplications />} />
          <Route path="/leave-review/:postId/:recipientId" element={<LeaveReview />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </>
  );
}

export default AppWrapper;