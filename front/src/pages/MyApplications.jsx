import React, { useState, useEffect } from 'react';
import {
    Clock, Eye, Download, CheckCircle2,
    Star, MessageSquare, ChevronRight, AlertCircle,
    Trophy, ExternalLink
} from 'lucide-react';
import { useAuthContext } from '../Context/AuthContext';
import { Link } from 'react-router-dom';

const StatusStep = ({ icon: Icon, label, description, active, completed }) => (
    <div className={`flex gap-4 relative ${!completed && !active ? 'opacity-40' : 'opacity-100'}`}>
        <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center z-10 transition-all ${active ? 'bg-amber-400 text-black shadow-lg shadow-amber-200' :
                completed ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-400'
                }`}>
                {completed ? <CheckCircle2 size={20} /> : <Icon size={20} />}
            </div>
            <div className="w-0.5 h-full bg-zinc-100 absolute top-10"></div>
        </div>
        <div className="pb-10">
            <p className={`text-[10px] font-black uppercase tracking-widest ${active ? 'text-amber-600' : 'text-zinc-400'}`}>
                {label}
            </p>
            <p className="text-zinc-600 text-sm font-medium">{description}</p>
        </div>
    </div>
);

export default function MyApplications() {
    const { user, token } = useAuthContext();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchApplications = async () => {
            if (!token) return; // Esperar a tener token

            try {
                // Ajustá la URL si tu backend corre en otro puerto (ej: 5000 o 3000)
                const res = await fetch(import.meta.env.VITE_API_URL + "/api/users/me/applications", {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!res.ok) throw new Error('Error al cargar postulaciones');

                const data = await res.json();
                setApplications(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchApplications();
    }, [token]);

    const jobsToReview = applications.filter(app => {
        const myApp = app.applicants.find(a => {
            const applicantId = (typeof a === 'object' && a !== null) ? a.user?.toString() : a?.toString();
            return applicantId === user?._id;
        });
        return myApp?.status === 'accepted'; // Solo mostramos para calificar los aceptados
    });

    return (
        <div className="max-w-6xl mx-auto px-6 py-16 bg-zinc-50/50 min-h-screen">
            <header className="mb-12">
                <h1 className="text-4xl font-black text-zinc-950 tracking-tighter uppercase">Mi Actividad</h1>
                <p className="text-zinc-500 font-medium">Sigue el estado de tus propuestas y califica tus trabajos finalizados.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                {/* LISTADO DE POSTULACIONES (Izquierda) */}
                <div className="lg:col-span-7 space-y-6">
                    {loading ? (
                        <p className="text-zinc-400 text-center py-10">Cargando tus postulaciones...</p>
                    ) : applications.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-[2.5rem] border border-zinc-100">
                            <p className="text-zinc-400 mb-4">Aún no te has postulado a ningún trabajo.</p>
                            <Link to="/works" className="text-amber-500 font-bold hover:underline">
                                ¡Explorar trabajos ahora!
                            </Link>
                        </div>
                    ) : (
                        applications.map((app) => {
                            // Buscamos TU estado específico en este post
                            // (El backend filtra, pero por seguridad buscamos tu ID en el array)
                            const myApp = app.applicants.find(a => {
                                const applicantId = (typeof a === 'object' && a !== null) ? a.user?.toString() : a?.toString();
                                return applicantId === user?._id;
                            }) || {};

                            const status = myApp.status || 'pending';

                            return (
                                <div key={app._id} className="bg-white rounded-[2.5rem] p-8 border border-zinc-100 shadow-sm hover:shadow-md transition-all">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <span className="bg-zinc-100 text-zinc-500 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                                                {app.category}
                                            </span>
                                            <h2 className="text-2xl font-bold text-zinc-900 mt-2">{app.title}</h2>
                                            <p className="text-zinc-500 text-xs mt-1">{app.location}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-zinc-400 uppercase italic">Estado Actual</p>
                                            <p className={`font-black text-sm uppercase ${status === 'accepted' ? 'text-green-500' :
                                                status === 'rejected' ? 'text-red-500' : 'text-amber-500'
                                                }`}>
                                                {status === 'pending' ? 'En revisión' :
                                                    status === 'accepted' ? 'Aceptado' : 'Rechazado'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Línea de Tiempo Dinámica */}
                                    <div className="mt-8">
                                        <StatusStep
                                            icon={Clock}
                                            label="Postulado"
                                            description="Tu propuesta fue enviada."
                                            completed={true}
                                        />
                                        <StatusStep
                                            icon={Eye}
                                            label="En Revisión"
                                            description="El empleador está evaluando candidatos."
                                            active={status === 'pending'}
                                            completed={status !== 'pending'}
                                        />
                                        <StatusStep
                                            icon={Trophy}
                                            label="Decisión Final"
                                            description={
                                                status === 'accepted' ? '¡Felicitaciones! Has sido seleccionado.' :
                                                    status === 'rejected' ? 'Gracias por postularte.' :
                                                        'Esperando respuesta final.'
                                            }
                                            active={status === 'accepted' || status === 'rejected'}
                                            completed={status === 'accepted'}
                                        />
                                    </div>

                                    <Link to={`/post/${app._id}`} className="w-full mt-4 flex items-center justify-center py-4 bg-zinc-50 rounded-2xl text-zinc-400 font-bold text-xs uppercase tracking-widest hover:bg-zinc-100 transition-all gap-2">
                                        Ver Anuncio Original <ExternalLink size={14} />
                                    </Link>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* SECCIÓN DE RESEÑAS PENDIENTES (Derecha) */}
                <div className="lg:col-span-5">
                    <div className="bg-zinc-900 rounded-[2.5rem] p-8 text-white sticky top-10">
                        <div className="flex items-center gap-3 mb-8">
                            <Star className="text-amber-400" fill="currentColor" />
                            <h3 className="font-black uppercase tracking-[0.2em] text-xs">Calificaciones Pendientes</h3>
                        </div>

                        {jobsToReview.length > 0 ? (
                            jobsToReview.map((app) => (
                                <div key={app._id} className="bg-white/5 border border-white/10 rounded-3xl p-6 mb-4">
                                    <p className="text-amber-400 font-black text-[10px] uppercase mb-2">Trabajo en curso / Finalizado</p>
                                    <h4 className="font-bold text-lg mb-4">{app.title}</h4>

                                    {/* IMPORTANTE: app.owner es el ID del usuario que creó el post */}
                                    <Link
                                        to={`/leave-review/${app._id}/${app.user?._id || app.user}`}
                                        className="flex items-center justify-center gap-2 w-full py-4 bg-white text-black rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-amber-400 transition-all"
                                    >
                                        Dejar Valoración <MessageSquare size={14} />
                                    </Link>
                                </div>
                            ))
                        ) : (
                            <div className="py-10 text-center border border-dashed border-white/10 rounded-3xl">
                                <p className="text-zinc-500 text-[10px] font-black uppercase">No tienes calificaciones pendientes</p>
                            </div>
                        )}

                        <div className="mt-8 flex items-center gap-4 text-zinc-500 bg-white/5 p-4 rounded-2xl border border-dashed border-white/10">
                            <AlertCircle size={20} />
                            <p className="text-[10px] font-bold leading-tight uppercase">
                                Recuerda que las reseñas ayudan a mantener la comunidad segura y confiable.
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}