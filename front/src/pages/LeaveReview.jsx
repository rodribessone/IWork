import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Send } from 'lucide-react';
import { useAuthContext } from '../Context/AuthContext';

export default function LeaveReview() {
    const { postId, recipientId } = useParams(); // Recibimos IDs por URL
    const { token } = useAuthContext();
    const navigate = useNavigate();

    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [hover, setHover] = useState(0); // Para efecto visual al pasar mouse
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validación de seguridad: evitar enviar "undefined" como string
        if (!recipientId || recipientId === "undefined") {
            return alert("Error: No se encontró el ID del destinatario.");
        }
        if (!postId || postId === "undefined") {
            return alert("Error: No se encontró el ID del trabajo.");
        }

        if (rating === 0) return alert("¡Por favor seleccioná una calificación!");

        setLoading(true);
        try {
            const res = await fetch("http://localhost:5000/api/reviews", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    recipientId,
                    postId,
                    rating,
                    comment
                })
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.message || "Error al enviar reseña");

            alert("¡Gracias por tu opinión! ⭐");
            navigate("/myApplications"); // Volver al listado

        } catch (error) {
            console.error(error);
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-6">
            <div className="bg-white max-w-md w-full rounded-[2.5rem] p-8 shadow-xl border border-zinc-100">
                <h1 className="text-2xl font-black text-center text-zinc-900 mb-2">Valorar Experiencia</h1>
                <p className="text-zinc-500 text-center text-sm mb-8">¿Qué tal fue trabajar con esta persona?</p>

                {/* Estrellas Interactivas */}
                <div className="flex justify-center gap-2 mb-8">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                            key={star}
                            size={32}
                            className={`cursor-pointer transition-all ${star <= (hover || rating) ? 'fill-amber-400 text-amber-400 scale-110' : 'text-zinc-200'}`}
                            onMouseEnter={() => setHover(star)}
                            onMouseLeave={() => setHover(0)}
                            onClick={() => setRating(star)}
                        />
                    ))}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Escribe tu comentario aquí..."
                        className="w-full h-32 bg-zinc-50 rounded-2xl p-4 text-sm border-none outline-none focus:ring-2 focus:ring-amber-200 resize-none"
                        required
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-zinc-900 text-white font-bold py-4 rounded-2xl hover:bg-zinc-800 transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? "Enviando..." : <>Enviar Reseña <Send size={18} /></>}
                    </button>
                </form>

                <button onClick={() => navigate(-1)} className="w-full text-center text-zinc-400 text-xs mt-4 font-bold hover:text-zinc-600">
                    Cancelar
                </button>
            </div>
        </div>
    );
}