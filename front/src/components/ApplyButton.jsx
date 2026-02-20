// src/components/ApplyButton.jsx
import React, { useState } from "react";
import { useTranslation } from "react-i18next"; // <-- Importamos el hook
import { Send, FileText, CheckCircle2, Loader2, AlertCircle, UploadCloud } from "lucide-react";
import toast from "react-hot-toast";

export default function ApplyButton({ postId, user, token, hasApplied, onApplySuccess }) {
    const { t } = useTranslation(); // <-- Inicializamos t
    const [applyMessage, setApplyMessage] = useState("");
    const [cvFile, setCvFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleApply = async (e) => {
        e.preventDefault();
        if (!user || !token) {
            setError(t('applyButton.errors.loginRequired'));
            return;
        }

        if (applyMessage.trim().length < 5) {
            setError(t('applyButton.errors.messageShort'));
            return;
        }

        if (!cvFile) {
            setError(t('applyButton.errors.cvRequired'));
            return;
        }

        setError("");
        setIsSubmitting(true);
        const loadingToast = toast.loading(t('applyButton.status.sending'));

        const formData = new FormData();
        formData.append('message', applyMessage);
        formData.append('cv', cvFile);

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/posts/${postId}/apply`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || t('common.error'));

            toast.success(t('applyButton.status.success'), { id: loadingToast });
            setApplyMessage("");
            setCvFile(null);
            onApplySuccess(user._id);

        } catch (err) {
            toast.error(err.message, { id: loadingToast });
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (hasApplied) {
        return (
            <div className="bg-zinc-900 rounded-[2rem] p-8 border border-zinc-800 text-center animate-in fade-in zoom-in duration-500">
                <div className="w-16 h-16 bg-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-400/20">
                    <CheckCircle2 size={32} className="text-black" />
                </div>
                <h3 className="text-white font-black uppercase tracking-tighter text-xl mb-2">
                    {t('common.success')}
                </h3>
                <p className="text-zinc-400 text-sm">
                    {t('apply.already_applied')}
                </p>
            </div>
        );
    }

    return (
        <form onSubmit={handleApply} className="bg-white rounded-[2.5rem] p-8 border border-zinc-100 shadow-sm space-y-6">
            <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Send size={16} className="text-amber-600" />
                </div>
                <h3 className="text-zinc-900 font-black uppercase tracking-widest text-xs">
                    {t('apply.button')}
                </h3>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-3 text-red-600 text-xs font-bold animate-shake">
                    <AlertCircle size={16} /> {error}
                </div>
            )}

            {/* Área de Mensaje */}
            <div>
                <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-3 ml-2">
                    {t('apply.message_label')}
                </label>
                <textarea
                    placeholder={t('apply.message_label')}
                    value={applyMessage}
                    onChange={(e) => setApplyMessage(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-100 rounded-[1.5rem] px-5 py-4 focus:ring-2 focus:ring-amber-400 outline-none transition-all font-medium text-zinc-800 text-sm min-h-[120px] resize-none"
                    disabled={isSubmitting}
                />
            </div>

            {/* Área de Carga de CV */}
            <div>
                <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-3 ml-2">
                    {t('apply.cv_label')}
                </label>
                <div className="relative group">
                    <input
                        type="file"
                        id="cvInput"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => setCvFile(e.target.files[0])}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        disabled={isSubmitting}
                    />
                    <div className={`
            w-full border-2 border-dashed rounded-[1.5rem] p-6 transition-all flex flex-col items-center justify-center gap-2
            ${cvFile ? 'border-amber-400 bg-amber-50' : 'border-zinc-200 bg-zinc-50 group-hover:border-zinc-300'}
          `}>
                        {cvFile ? (
                            <>
                                <FileText className="text-amber-600" size={32} />
                                <span className="text-zinc-800 font-bold text-xs truncate max-w-[140px] sm:max-w-[200px]">
                                    {cvFile.name}
                                </span>
                                <span className="text-amber-600 text-[10px] font-black uppercase">
                                    {t('common.edit')}
                                </span>
                            </>
                        ) : (
                            <>
                                <UploadCloud className="text-zinc-400" size={32} />
                                <span className="text-zinc-500 font-bold text-xs">
                                    {t('common.search')}
                                </span>
                                <span className="text-zinc-400 text-[10px] uppercase">
                                    PDF, DOC, DOCX
                                </span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <button
                type="submit"
                disabled={isSubmitting}
                className={`
          w-full py-5 rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] transition-all flex items-center justify-center gap-3
          ${isSubmitting
                        ? "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                        : "bg-zinc-950 text-white hover:bg-zinc-800 shadow-xl shadow-zinc-200"}
        `}
            >
                {isSubmitting ? (
                    <>
                        <Loader2 className="animate-spin" size={18} /> {t('apply.sending')}
                    </>
                ) : (
                    <>
                        {t('apply.button')} <ArrowRight size={16} />
                    </>
                )}
            </button>

            {/* <p className="text-center text-zinc-400 text-[9px] uppercase tracking-widest font-medium">
                {t('apply.sending')}
            </p> */}
        </form>
    );
}

const ArrowRight = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
);