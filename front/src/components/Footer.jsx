import React from 'react';
import { useTranslation } from 'react-i18next';
import { Heart, Linkedin, Mail, Bug } from 'lucide-react';

export default function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="bg-white border-t border-zinc-100 py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">

        {/* Brand & Slogan */}
        <div className="text-center md:text-left">
          <h3 className="text-2xl font-black text-zinc-900 tracking-tighter uppercase italic flex items-center justify-center md:justify-start gap-2">
            iWork
          </h3>
          <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest mt-1">
            {t('footer.slogan')}
          </p>
        </div>

        {/* Links de Acción */}
        <div className="flex flex-wrap justify-center gap-6 md:gap-8">
          <a
            href="mailto:iworkapp.contact@gmail.com?subject=iWork%20Support%20/%20Bug%20Report"
            className="group flex items-center gap-2 text-zinc-500 hover:text-amber-500 transition-colors text-[10px] font-black uppercase tracking-[0.15em]"
          >
            <Bug size={14} className="group-hover:rotate-12 transition-transform" />
            {t('footer.report_bug')}
          </a>
          <a
            href="mailto:iworkapp.contact@gmail.com"
            className="group flex items-center gap-2 text-zinc-500 hover:text-zinc-900 transition-colors text-[10px] font-black uppercase tracking-[0.15em]"
          >
            <Mail size={14} />
            {t('footer.contact')}
          </a>
        </div>

        {/* Créditos del Dev */}
        <div className="text-center md:text-right">
          <p className="text-zinc-500 text-xs font-medium flex items-center justify-center md:justify-end gap-1.5">
            {t('footer.built_by')} <Heart size={12} className="text-red-500 fill-current animate-pulse" /> by
            <a
              href="https://rodribessone.netlify.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-900 font-black hover:text-amber-500 transition-colors"
            >
              Rodrigo Bessone
            </a>
          </p>
          <p className="text-zinc-300 text-[10px] mt-1 font-mono font-medium">
            {t('footer.rights')}
          </p>
        </div>
      </div>
    </footer>
  );
}