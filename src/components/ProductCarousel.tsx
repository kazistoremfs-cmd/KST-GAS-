import React, { useRef } from 'react';
import { BRANDS } from '../data';
import { Brand } from '../types';
import { motion } from 'motion/react';
import { ShoppingCart, ChevronLeft, ChevronRight, Star, ShieldCheck, Flame, Truck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface ProductCarouselProps {
  onSelectBrand: (brand: Brand) => void;
}

export function ProductCarousel({ onSelectBrand }: ProductCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = current.clientWidth * 0.8;
      current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section id="products" className="py-12 sm:py-20 px-0 sm:px-12 lg:px-24 max-w-[90rem] mx-auto relative overflow-hidden">
      <div className="text-center mb-10 sm:mb-16 px-4">
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">{t('products.title')}</h2>
        <p className="text-slate-600 max-w-2xl mx-auto">{t('products.subtitle')}</p>
      </div>

      <div className="relative group">
        {/* Navigation Buttons */}
        <button 
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 sm:-ml-8 z-10 bg-white/90 shadow-lg rounded-full p-3 text-slate-700 hover:text-blue-600 hover:scale-110 transition-all opacity-0 group-hover:opacity-100 hidden sm:block backdrop-blur-sm"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button 
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 sm:-mr-8 z-10 bg-white/90 shadow-lg rounded-full p-3 text-slate-700 hover:text-blue-600 hover:scale-110 transition-all opacity-0 group-hover:opacity-100 hidden sm:block backdrop-blur-sm"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Carousel Container */}
        <div 
          ref={scrollRef}
          className="flex overflow-x-auto snap-x snap-mandatory gap-4 sm:gap-6 pb-12 pt-4 px-4 sm:px-4 hide-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', scrollPaddingLeft: '1rem' }}
        >
          {BRANDS.map((brand, index) => (
            <motion.div
              key={brand.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="snap-center sm:snap-start shrink-0 w-[85vw] sm:w-[320px] bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-2xl transition-all group/card flex flex-col h-full cursor-pointer"
              onClick={() => onSelectBrand(brand)}
            >
              {/* Product Image Area */}
              <div className="h-64 flex items-center justify-center relative overflow-hidden bg-slate-50 p-2">
                {/* Brand color overlay tinting the image */}
                {brand.overlay && (
                  <div className={`absolute inset-0 ${brand.overlay} mix-blend-multiply z-10 pointer-events-none transition-opacity group-hover/card:opacity-80`}></div>
                )}
                
                <img 
                  src={brand.image} 
                  alt={brand.name} 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain transform transition-transform duration-700 group-hover/card:scale-105"
                />
                
                <div className="absolute top-4 right-4 z-20 bg-emerald-100/95 backdrop-blur-sm text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5 border border-emerald-200/50">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                  {t('products.inStock')}
                </div>
              </div>
              
              <div className="p-6 flex-1 flex flex-col bg-white relative z-20 text-left">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="text-xl font-bold text-slate-900">{brand.name}</h3>
                </div>

                {brand.currentPrice && (
                  <div className="flex items-center gap-2 mb-2 mt-1">
                    <span className="text-xl font-bold text-slate-900">৳{brand.currentPrice}</span>
                    {brand.previousPrice && (
                      <>
                        <span className="text-sm text-slate-400 line-through">৳{brand.previousPrice}</span>
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                          {t('products.save' as any).replace('{percent}', Math.round(((brand.previousPrice - brand.currentPrice) / brand.previousPrice) * 100).toString())}
                        </span>
                      </>
                    )}
                  </div>
                )}

                <ul className="space-y-2.5 mb-6 flex-1 text-sm text-slate-600">
                  <li className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span className="font-medium">ISO 9001</span> {t('products.safety')}
                  </li>
                  <li className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-orange-500" />
                    {t('products.efficiency')}
                  </li>
                  <li className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-blue-500" />
                    {t('products.delivery')}
                  </li>
                </ul>
                
                <div className="border-t border-slate-100 pt-4 mb-4">
                  <p className="text-sm font-medium text-slate-600 mb-2">{t('products.availableSizes')}</p>
                  <div className="flex gap-2">
                    {[12].map(size => (
                      <span key={size} className="bg-slate-50 border border-slate-200 text-slate-600 text-xs font-medium px-2 py-1 rounded-md">
                        {size} KG
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 group-hover/card:bg-blue-600 shadow-md"
                >
                  <ShoppingCart className="w-4 h-4" />
                  {t('products.selectOrder')}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
