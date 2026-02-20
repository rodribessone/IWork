// src/hooks/usePageTracking.js
// ─────────────────────────────────────────────────────────────
// Hook que trackea automáticamente cada cambio de ruta en GA4
// Úsalo UNA sola vez dentro del componente App()
// ─────────────────────────────────────────────────────────────
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '../utils/analytics';

// Mapa de rutas a títulos legibles (para GA4 reports)
const PAGE_TITLES = {
    '/': 'Home',
    '/works': 'Jobs',
    '/people': 'Professionals',
    '/login': 'Login',
    '/register': 'Register',
    '/profile': 'My Profile',
    '/chat': 'Chat',
    '/myApplications': 'My Applications',
    '/newPost': 'Create Post',
    '/search': 'Search',
};

const getPageTitle = (pathname) => {
    // Rutas exactas
    if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];

    // Rutas dinámicas
    if (pathname.startsWith('/post/')) return 'Job Detail';
    if (pathname.startsWith('/users/')) return 'User Profile';
    if (pathname.startsWith('/ownerPostView/')) return 'Manage Applicants';
    if (pathname.startsWith('/editar/')) return 'Edit Post';
    if (pathname.startsWith('/chat/')) return 'Chat Conversation';
    if (pathname.startsWith('/leave-review/')) return 'Leave Review';

    return 'IWork';
};

export default function usePageTracking() {
    const location = useLocation();

    useEffect(() => {
        const title = getPageTitle(location.pathname);
        trackPageView(location.pathname + location.search, title);
    }, [location]);
}