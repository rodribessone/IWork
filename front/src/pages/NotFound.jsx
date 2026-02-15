import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { Home } from 'lucide-react';

const NotFound = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center h-[80vh] text-center px-4">
      <h1 className="text-9xl font-black text-amber-400 tracking-tighter">404</h1>
      <h2 className="text-3xl font-bold mt-4 text-zinc-900 uppercase tracking-tight">
        {t('not_found.subtitle')}
      </h2>
      <p className="text-zinc-500 mt-2 text-lg font-medium max-w-md">
        {t('not_found.description')}
      </p>
      <Link
        to="/"
        className="mt-8 px-8 py-3 bg-zinc-950 text-white rounded-2xl shadow-xl hover:bg-zinc-800 transition duration-300 font-black uppercase text-xs tracking-widest flex items-center gap-2"
      >
        <Home size={16} />
        {t('common.back')}
      </Link>
    </div>
  );
};

export default NotFound;