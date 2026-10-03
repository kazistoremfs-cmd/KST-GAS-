import { Flame } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';

export function Hero() {
  const { t } = useLanguage();

  return (
    <section className="bg-slate-900 text-white py-12 sm:py-20 px-4 sm:px-12 lg:px-24 rounded-b-[2rem] sm:rounded-b-[3rem] shadow-2xl relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/50 to-slate-900/50 mix-blend-multiply" />
      <div className="max-w-7xl mx-auto relative z-10 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-blue-600/20 p-4 rounded-full mb-6"
        >
          <Flame className="w-10 h-10 sm:w-12 sm:h-12 text-blue-400" />
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-3xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight mb-4 sm:mb-6 leading-tight"
        >
          {t('hero.title')} <span className="text-blue-400">{t('hero.title.highlight')}</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-base sm:text-lg lg:text-xl text-slate-300 max-w-2xl mb-8 sm:mb-10 px-2"
        >
          {t('hero.subtitle')}
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <a href="#products" className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-8 rounded-full transition-colors flex items-center justify-center">
            {t('hero.orderNow')}
          </a>
          <a href="tel:+8801234567890" className="bg-slate-800 hover:bg-slate-700 text-white font-semibold py-3 px-8 rounded-full transition-colors flex items-center justify-center border border-slate-700">
            {t('hero.callUs')}
          </a>
        </motion.div>
      </div>
    </section>
  );
}
