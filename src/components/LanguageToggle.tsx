import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Globe, ChevronDown } from 'lucide-react';

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="absolute top-4 right-4 sm:top-6 sm:right-8 z-50" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-md px-3 py-2 rounded-full border border-white/20 transition-colors text-white"
      >
        <Globe className="w-4 h-4" />
        <span className="text-xs font-bold uppercase">{language === 'en' ? 'EN' : 'BN'}</span>
        <ChevronDown className="w-3 h-3 opacity-70" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-32 bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden py-1">
          <button
            onClick={() => {
              setLanguage('en');
              setIsOpen(false);
            }}
            className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-slate-50 ${
              language === 'en' ? 'font-bold text-slate-900 bg-slate-50/50' : 'text-slate-600'
            }`}
          >
            English (EN)
          </button>
          <button
            onClick={() => {
              setLanguage('bn');
              setIsOpen(false);
            }}
            className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-slate-50 ${
              language === 'bn' ? 'font-bold text-slate-900 bg-slate-50/50' : 'text-slate-600'
            }`}
          >
            বাংলা (BN)
          </button>
        </div>
      )}
    </div>
  );
}
