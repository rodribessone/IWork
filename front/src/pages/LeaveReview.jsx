// src/pages/LeaveReview.jsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from "react-i18next"; // <-- Importamos i18next
import { Star, Send } from 'lucide-react';
import { useAuthContext } from '../Context/AuthContext';
import toast from "react-hot-toast"; // Usamos toast para mayor consistencia

export default function LeaveReview() {
    const { t } = useTranslation();
    const { postId, recipientId } = useParams();
    const { token } = useAuthContext();
    const navigate = useNavigate();

    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [hover, setHover] = useState(0);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!recipientId || recipientId === "undefined" || !postId || postId === "undefined") {
            return toast.error(t('leaveReview.errors.missingIds'));
        }

        if (rating === 0) {
            return toast.error(t('leaveReview.errors.ratingRequired'));
        }

        setLoading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/reviews`, {
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
            if (!res.ok) throw new Error(data.message || t('leaveReview.errors.generic'));

            toast.success(t('leaveReview.status.success'));
            navigate("/myApplications");

        } catch (error) {
            console.error(error);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-6">
            <div className="bg-white max-w-md w-full rounded-[2.5rem] p-8 shadow-xl border border-zinc-100">
                <h1 className="text-2xl font-black text-center text-zinc-900 mb-2">
                    {t('leaveReview.title')}
                </h1>
                <p className="text-zinc-500 text-center text-sm mb-8">
                    {t('leaveReview.subtitle')}
                </p>

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
                        placeholder={t('leaveReview.placeholder')}
                        className="w-full h-32 bg-zinc-50 rounded-2xl p-4 text-sm border-none outline-none focus:ring-2 focus:ring-amber-200 resize-none"
                        required
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-zinc-900 text-white font-bold py-4 rounded-2xl hover:bg-zinc-800 transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? t('leaveReview.status.sending') : <>{t('leaveReview.submitBtn')} <Send size={18} /></>}
                    </button>
                </form>

                <button
                    onClick={() => navigate(-1)}
                    className="w-full text-center text-zinc-400 text-xs mt-4 font-bold hover:text-zinc-600"
                >
                    {t('leaveReview.cancelBtn')}
                </button>
            </div>
        </div>
    );
}