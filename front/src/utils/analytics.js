// src/utils/analytics.js
// ─────────────────────────────────────────────────────────────
// IWork — Google Analytics 4 helper
// Reemplaza G-XXXXXXXXXX con tu Measurement ID real de GA4
// ─────────────────────────────────────────────────────────────

export const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX';

// ─── Pageview ────────────────────────────────────────────────
// Se llama automáticamente desde usePageTracking()
export const trackPageView = (path, title) => {
    if (!window.gtag) return;
    window.gtag('config', GA_MEASUREMENT_ID, {
        page_path: path,
        page_title: title,
    });
};

// ─── Evento genérico ─────────────────────────────────────────
const trackEvent = (eventName, params = {}) => {
    if (!window.gtag) return;
    window.gtag('event', eventName, params);
};

// ═════════════════════════════════════════════════════════════
// AUTENTICACIÓN
// ═════════════════════════════════════════════════════════════

// Usuario inicia sesión
export const trackLogin = () =>
    trackEvent('login', { method: 'email' });

// Usuario se registra
export const trackSignUp = (role) =>
    trackEvent('sign_up', { method: 'email', user_role: role });

// ═════════════════════════════════════════════════════════════
// TRABAJOS (POSTS)
// ═════════════════════════════════════════════════════════════

// Usuario ve el detalle de un trabajo
export const trackViewJob = (postId, title, category) =>
    trackEvent('view_item', {
        item_id: postId,
        item_name: title,
        item_category: category,
        content_type: 'job_post',
    });

// Usuario abre el panel lateral de un trabajo (en Works)
export const trackOpenJobPreview = (postId, title, category) =>
    trackEvent('select_content', {
        content_type: 'job_preview',
        item_id: postId,
        item_name: title,
        item_category: category,
    });

// Publicación de un trabajo
export const trackCreateJob = (category, location) =>
    trackEvent('create_job_post', {
        item_category: category,
        location,
    });

// Edición de un trabajo
export const trackEditJob = (postId) =>
    trackEvent('edit_job_post', { item_id: postId });

// ═════════════════════════════════════════════════════════════
// POSTULACIONES
// ═════════════════════════════════════════════════════════════

// Usuario se postula a un trabajo
export const trackApply = (postId, postTitle, category) =>
    trackEvent('apply_to_job', {
        item_id: postId,
        item_name: postTitle,
        item_category: category,
    });

// Dueño acepta a un candidato
export const trackAcceptCandidate = (postId) =>
    trackEvent('accept_candidate', { item_id: postId });

// Dueño rechaza a un candidato
export const trackRejectCandidate = (postId) =>
    trackEvent('reject_candidate', { item_id: postId });

// ═════════════════════════════════════════════════════════════
// PROFESIONALES (PEOPLE)
// ═════════════════════════════════════════════════════════════

// Usuario ve el perfil de un profesional
export const trackViewProfile = (userId, profession) =>
    trackEvent('view_profile', {
        user_id_viewed: userId,
        profession,
    });

// Usuario abre el panel lateral de un profesional (en People)
export const trackOpenPeoplePreview = (userId, profession) =>
    trackEvent('select_content', {
        content_type: 'people_preview',
        user_id_viewed: userId,
        profession,
    });

// ═════════════════════════════════════════════════════════════
// CHAT / CONTACTO
// ═════════════════════════════════════════════════════════════

// Se inicia una conversación nueva
export const trackStartChat = (recipientId) =>
    trackEvent('start_chat', { recipient_id: recipientId });

// Se envía un mensaje
export const trackSendMessage = (conversationId) =>
    trackEvent('send_message', { conversation_id: conversationId });

// ═════════════════════════════════════════════════════════════
// RESEÑAS
// ═════════════════════════════════════════════════════════════

// Usuario envía una reseña
export const trackLeaveReview = (rating, postId) =>
    trackEvent('leave_review', {
        rating,
        item_id: postId,
    });

// ═════════════════════════════════════════════════════════════
// BÚSQUEDA
// ═════════════════════════════════════════════════════════════

// Búsqueda en el buscador del nav
export const trackSearch = (query) =>
    trackEvent('search', { search_term: query });

// Filtros usados en Works o People
export const trackFilter = (page, filters) =>
    trackEvent('apply_filter', { page, ...filters });

// ═════════════════════════════════════════════════════════════
// IDIOMA
// ═════════════════════════════════════════════════════════════

// Usuario cambia de idioma
export const trackLanguageChange = (language) =>
    trackEvent('change_language', { language });