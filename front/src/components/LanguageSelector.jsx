import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';

// Usamos códigos de país para las banderas (ISO 3166-1 alpha-2)
const languages = [
    { code: 'en', label: 'English', country: 'gb' },
    { code: 'es', label: 'Español', country: 'es' },
    { code: 'pt', label: 'Português', country: 'br' },
    { code: 'it', label: 'Italiano', country: 'it' },
    { code: 'fr', label: 'Français', country: 'fr' },
];

export default function LanguageSelector() {
    const { i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);

    const currentLang = languages.find(l => l.code === i18n.language) || languages[0];

    const handleSelect = (code) => {
        i18n.changeLanguage(code);
        setIsOpen(false);
    };

    return (
        <div className="relative">
            {/* Botón Principal */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 px-3 py-1.5 rounded-full transition-all"
            >
                <img
                    src={`https://flagcdn.com/w40/${currentLang.country}.png`}
                    alt={currentLang.label}
                    className="w-5 h-auto rounded-sm object-cover"
                />
                <ChevronDown size={14} className={`text-zinc-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Menú Dropdown */}
            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>

                    <div className="absolute right-0 mt-2 w-40 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl z-50 overflow-hidden py-1 animate-in fade-in zoom-in-95">
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => handleSelect(lang.code)}
                                className={`w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-zinc-800 transition-colors ${i18n.language === lang.code ? 'bg-zinc-800 text-amber-400' : 'text-zinc-300'}`}
                            >
                                <img
                                    src={`https://flagcdn.com/w40/${lang.country}.png`}
                                    alt={lang.label}
                                    className="w-5 h-auto rounded-sm shadow-sm"
                                />
                                {lang.label}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}