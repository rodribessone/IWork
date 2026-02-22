import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Importamos los archivos de traducción (los crearemos en el Paso 3)
import en from "./locales/en.json";
import es from "./locales/es.json";
import pt from "./locales/pt.json";
import fr from "./locales/fr.json";
import it from "./locales/it.json";

i18n
    .use(LanguageDetector) // Detecta el idioma del navegador automáticamente
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: en },
            es: { translation: es },
            pt: { translation: pt },
            fr: { translation: fr },
            it: { translation: it },
        },
        fallbackLng: "en", // Si no encuentra el idioma, usa inglés
        detection: {
            // Orden de detección: primero localStorage (idioma elegido por el usuario),
            // luego el idioma del navegador, luego la URL
            order: ['localStorage', 'navigator', 'htmlTag'],
            // Clave en localStorage donde se guarda la elección del usuario
            lookupLocalStorage: 'iwork-language',
            // Guardar la detección automática en localStorage para próximas visitas
            caches: ['localStorage'],
        },
        interpolation: {
            escapeValue: false, // React ya protege contra XSS
        },
    });

export default i18n;