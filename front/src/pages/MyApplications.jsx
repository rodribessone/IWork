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

    // Simulación de carga (Aquí harías el fetch a tu API de postulaciones)
    useEffect(() => {
        // const res = await fetch(`.../api/users/${user._id}/applications`, { headers: { Authorization: `Bearer ${token}` } });
        setLoading(false);
    }, []);

    return (
        <div className="max-w-6xl mx-auto px-6 py-16 bg-zinc-50/50 min-h-screen">
            <header className="mb-12">
                <h1 className="text-4xl font-black text-zinc-950 tracking-tighter uppercase">Mi Actividad</h1>
                <p className="text-zinc-500 font-medium">Sigue el estado de tus propuestas y califica tus trabajos finalizados.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                {/* LISTADO DE POSTULACIONES (Izquierda) */}
                <div className="lg:col-span-7 space-y-6">
                    {/* Tarjeta de Postulación Ejemplo */}
                    <div className="bg-white rounded-[2.5rem] p-8 border border-zinc-100 shadow-sm hover:shadow-md transition-all">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <span className="bg-zinc-100 text-zinc-500 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Carpintería</span>
                                <h2 className="text-2xl font-bold text-zinc-900 mt-2">Restauración de Mesa Vintage</h2>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-zinc-400 uppercase italic">Estado Actual</p>
                                <p className="text-amber-500 font-black text-sm uppercase">En revisión</p>
                            </div>
                        </div>

                        {/* Línea de Tiempo del Proceso */}
                        <div className="mt-8">
                            <StatusStep
                                icon={Clock}
                                label="Postulado"
                                description="Tu propuesta fue enviada con éxito."
                                completed={true}
                            />
                            <StatusStep
                                icon={Eye}
                                label="Visto"
                                description="El empleador revisó tu perfil."
                                active={true}
                            />
                            <StatusStep
                                icon={Download}
                                label="CV Descargado"
                                description="Se guardó tu contacto para evaluación."
                            />
                            <StatusStep
                                icon={Trophy}
                                label="Decisión Final"
                                description="Esperando confirmación de contratación."
                            />
                        </div>

                        <Link to="/post/id-ejemplo" className="w-full mt-4 flex items-center justify-center py-4 bg-zinc-50 rounded-2xl text-zinc-400 font-bold text-xs uppercase tracking-widest hover:bg-zinc-100 transition-all gap-2">
                            Ver Anuncio Original <ExternalLink size={14} />
                        </Link>
                    </div>
                </div>

                {/* SECCIÓN DE RESEÑAS PENDIENTES (Derecha) */}
                <div className="lg:col-span-5">
                    <div className="bg-zinc-900 rounded-[2.5rem] p-8 text-white sticky top-10">
                        <div className="flex items-center gap-3 mb-8">
                            <Star className="text-amber-400" fill="currentColor" />
                            <h3 className="font-black uppercase tracking-[0.2em] text-xs">Calificaciones Pendientes</h3>
                        </div>

                        {/* Item de Reseña Pendiente */}
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 mb-4">
                            <p className="text-amber-400 font-black text-[10px] uppercase mb-2">Trabajo Finalizado</p>
                            <h4 className="font-bold text-lg mb-4">Instalación Eléctrica Local</h4>

                            <Link
                                to="/leave-review/post-id"
                                className="flex items-center justify-center gap-2 w-full py-4 bg-white text-black rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-amber-400 transition-all"
                            >
                                Dejar Valoración <MessageSquare size={14} />
                            </Link>
                        </div>

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