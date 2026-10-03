import { useState } from 'react';
import { Brand, OrderData } from './types';
import { Hero } from './components/Hero';
import { ProductCarousel } from './components/ProductCarousel';
import { OrderModal } from './components/OrderModal';
import { ConfirmationModal } from './components/ConfirmationModal';
import { LanguageToggle } from './components/LanguageToggle';
import { useLanguage } from './context/LanguageContext';

export default function App() {
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);  
  const [completedOrder, setCompletedOrder] = useState<OrderData | null>(null);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const { t } = useLanguage();

  const handleSelectBrand = (brand: Brand) => {
    setSelectedBrand(brand);
    window.scrollTo(0, 0);
  };

  const handleOrderSubmit = (order: OrderData) => {
    setSelectedBrand(null);
    setCompletedOrder(order);
    setIsConfirmationOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-200">
      <LanguageToggle />
      {!selectedBrand ? (
        <>
          <Hero />
          <main>
            <ProductCarousel onSelectBrand={handleSelectBrand} />
          </main>
          <footer className="bg-slate-900 text-slate-400 py-8 text-center text-sm">
            <p>{t('app.footer').replace('{year}', new Date().getFullYear().toString())}</p>
          </footer>
        </>
      ) : (
        <OrderModal
          brand={selectedBrand}
          isOpen={true}
          onClose={() => setSelectedBrand(null)}
          onSubmit={handleOrderSubmit}
        />
      )}

      <ConfirmationModal
        order={completedOrder}
        isOpen={isConfirmationOpen}
        onClose={() => setIsConfirmationOpen(false)}
      />
    </div>
  );
}
