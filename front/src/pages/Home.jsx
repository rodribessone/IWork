import { Link } from 'react-router-dom';
import { Briefcase, Users, CheckCircle, Search, Star, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Home() {
  const { t } = useTranslation();

  return (
    <div className="bg-white">
      {/* SECCIÓN HERO */}
      <section className='relative w-full bg-zinc-950 py-24 overflow-hidden'>
        {/* Decoración de fondo (Efecto de luces) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full opacity-20 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[60%] bg-amber-500 blur-[120px] rounded-full"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[60%] bg-zinc-800 blur-[120px] rounded-full"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 text-center z-10">
          <span className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-widest text-amber-400 uppercase bg-amber-400/10 border border-amber-400/20 rounded-full">
            La red profesional de oficios más grande
          </span>
          <h1 className="text-5xl md:text-8xl font-black text-white mb-8 tracking-tighter leading-none">
            Donde el talento <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-200">
              encuentra oportunidad
            </span>
          </h1>
          <p className="text-lg md:text-xl text-zinc-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            {t('home.hero_subtitle')}
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-5">
            <Link
              to="/works"
              className="group bg-amber-400 text-black px-10 py-4 text-lg font-bold rounded-full hover:bg-amber-300 transition-all flex items-center justify-center gap-2 shadow-xl shadow-amber-400/20"
            >
              {t('home.cta_find_work')}
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/people"
              className="border border-zinc-700 text-white px-10 py-4 text-lg font-bold rounded-full hover:bg-white hover:text-black transition-all"
            >
              {t('home.cta_hire')}
            </Link>
          </div>

          {/* Estadísticas Rápidas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 pt-10 border-t border-zinc-800/50 text-zinc-500">
            <div>
              <p className="text-3xl font-bold text-white">+10k</p>
              <p className="text-sm uppercase tracking-widest font-medium">Usuarios</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">5k</p>
              <p className="text-sm uppercase tracking-widest font-medium">Proyectos</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">100%</p>
              <p className="text-sm uppercase tracking-widest font-medium">Seguro</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">24/7</p>
              <p className="text-sm uppercase tracking-widest font-medium">Soporte</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN ¿CÓMO FUNCIONA? */}
      <section className='py-24 bg-zinc-50'>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
            <div className="max-w-xl">
              <h2 className="text-4xl font-black text-zinc-900 mb-4 tracking-tight uppercase">{t('home.how_it_works')}</h2>
              <p className="text-zinc-500 text-lg leading-relaxed">
                {t('home.how_it_works_sub')}
              </p>
            </div>
            <div className="flex gap-2">
              <span className="p-2 bg-white rounded-full border border-zinc-200 shadow-sm"><Star className="text-amber-500" size={20} /></span>
              <span className="p-2 bg-white rounded-full border border-zinc-200 shadow-sm"><Star className="text-amber-500" size={20} /></span>
              <span className="p-2 bg-white rounded-full border border-zinc-200 shadow-sm"><Star className="text-amber-500" size={20} /></span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Tarjeta 1 */}
            <div className="group bg-white rounded-3xl p-12 border border-zinc-200 hover:border-amber-400/50 transition-all shadow-sm hover:shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Briefcase size={120} />
              </div>
              <div className="w-14 h-14 bg-amber-400 flex items-center justify-center rounded-2xl mb-8 group-hover:scale-110 transition-transform">
                <Briefcase size={28} className="text-black" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-zinc-900">{t('home.card_work_title')}</h3>
              <p className="text-zinc-500 mb-8 text-lg leading-relaxed">
                {t('home.card_work_desc')}
              </p>
              <Link
                to="/works"
                className="inline-flex items-center gap-2 font-bold text-amber-600 hover:text-amber-700 transition-colors"
              >
                {t('home.view_jobs')} <ArrowRight size={18} />
              </Link>
            </div>

            {/* Tarjeta 2 */}
            <div className="group bg-white rounded-3xl p-12 border border-zinc-200 hover:border-amber-400/50 transition-all shadow-sm hover:shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Users size={120} />
              </div>
              <div className="w-14 h-14 bg-zinc-900 flex items-center justify-center rounded-2xl mb-8 group-hover:scale-110 transition-transform">
                <Search size={28} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-zinc-900">{t('home.card_hire_title')}</h3>
              <p className="text-zinc-500 mb-8 text-lg leading-relaxed">
                {t('home.card_hire_desc')}
              </p>
              <Link
                to="/people"
                className="inline-flex items-center gap-2 font-bold text-zinc-900 hover:text-amber-600 transition-colors"
              >
                {t('home.find_expert')} <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}