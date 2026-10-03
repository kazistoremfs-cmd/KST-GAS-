import React, { useState, useEffect } from 'react';
import { Brand, OrderData, CylinderSize, PaymentMethod } from '../types';
import { PRICING, PAYMENT_METHODS, PAYMENT_METHODS_UNDER_2000, PAYMENT_METHODS_ABOVE_2000 } from '../data';
import { motion, AnimatePresence } from 'motion/react';
import { X, Minus, Plus, CreditCard, Smartphone, Banknote, MapPin, User, Phone, CheckCircle2, Info, Star, Copy, Check, Loader2, Building2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface OrderModalProps {
  brand: Brand;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (order: OrderData) => void;
}

const ICONS = {
  Banknote,
  Smartphone,
  CreditCard,
  Building2,
};

export function OrderModal({ brand, isOpen, onClose, onSubmit }: OrderModalProps) {
  const { t } = useLanguage();
  const [size, setSize] = useState<CylinderSize>(12);
  const [cylinderType, setCylinderType] = useState<'refill' | 'new'>('refill');
  const [quantity, setQuantity] = useState<number>(1);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [senderPhone, setSenderPhone] = useState('');
  const [trxId, setTrxId] = useState('');
  const [deliveryType, setDeliveryType] = useState<'self' | 'road_step'>('road_step');
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getAgentNumber = (method: string) => {
    switch (method) {
      case 'nagad':
        return '01960523052';
      case 'online':
      case 'bkash':
      case 'rocket':
      default:
        return '01609540761';
    }
  };

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(getAgentNumber(paymentMethod));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Reset form when opened with a new brand
  useEffect(() => {
    if (isOpen) {
      setSize(12);
      setCylinderType('refill');
      setQuantity(1);
      setPaymentMethod('cash');
      setDeliveryType('road_step');
      setSenderPhone('');
      setTrxId('');
      setIsSubmitting(false);
    }
  }, [isOpen, brand]);

  const DELIVERY_CHARGE = deliveryType === 'road_step' ? 40 : 0;
  const cylinderBasePrice = cylinderType === 'new' ? ((brand?.currentPrice || PRICING[size].price) + 1000) : (brand?.currentPrice || PRICING[size].price);
  const subtotal = cylinderBasePrice * quantity;
  const totalPrice = subtotal + DELIVERY_CHARGE;

  const availablePaymentMethods = totalPrice < 2000 ? PAYMENT_METHODS_UNDER_2000 : PAYMENT_METHODS_ABOVE_2000;

  // Auto-switch payment method when total price crosses 2000 Tk boundary
  useEffect(() => {
    if (totalPrice < 2000) {
      if (!['cod', 'cash', 'online'].includes(paymentMethod)) {
        setPaymentMethod('online');
      }
    } else {
      if (paymentMethod === 'online') {
        setPaymentMethod('bkash');
      }
    }
  }, [totalPrice, paymentMethod]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const generatedOrderId = Math.random().toString(36).substring(2, 10).toUpperCase();

    const paymentLabel = paymentMethod === 'online'
      ? 'ONLINE PAYMENT'
      : (PAYMENT_METHODS.find(m => m.id === paymentMethod)?.label || paymentMethod);

    // Prepare data for Google Forms
    const formData = new URLSearchParams();
    formData.append('entry.330071333', generatedOrderId);
    formData.append('entry.1275074044', name || 'N/A');
    formData.append('entry.1655143820', phone || 'N/A');
    formData.append('entry.1873718434', deliveryType === 'self' ? 'Self Pickup' : (address || 'N/A'));
    formData.append('entry.313529101', brand.name);
    formData.append('entry.1601986536', `${size} KG (${cylinderType === 'new' ? 'New' : 'Refill'})`);
    formData.append('entry.473775794', quantity.toString());
    formData.append('entry.1086317956', totalPrice.toString());
    formData.append('entry.1808271606', paymentLabel);
    formData.append('entry.1148788887', senderPhone || 'N/A');
    formData.append('entry.1622406683', trxId || 'N/A');

    try {
      await fetch('https://docs.google.com/forms/d/e/1FAIpQLSfXuPIKmNmz43MSV1_5sRbUomGaUCgbrmgJDPebGbg7LwjEHw/formResponse', {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString()
      });
    } catch (error) {
      console.error("Error submitting form", error);
    }

    setIsSubmitting(false);

    onSubmit({
      brand,
      size,
      cylinderType,
      quantity,
      customerName: name,
      phone,
      address,
      deliveryType,
      paymentMethod,
      senderPhone,
      trxId,
      orderId: generatedOrderId,
    });
  };

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  const needsTrxDetails = ['bkash', 'nagad', 'rocket', 'bank', 'online'].includes(paymentMethod);
  const effectiveMethod = paymentMethod;

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-white w-full flex flex-col lg:flex-row font-sans"
    >
      {/* Mobile Header / Back Button */}
      <div className="lg:hidden flex items-center p-4 border-b border-slate-100 bg-white sticky top-0 z-40">
        <button
          type="button"
          onClick={onClose}
          className="p-2 -ml-2 hover:bg-slate-50 rounded-full text-slate-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        <span className="font-bold text-slate-900 ml-2">Checkout</span>
      </div>

      {/* Desktop Close Button */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-6 right-6 z-50 p-2.5 bg-white hover:bg-slate-100 rounded-full transition-colors text-slate-500 hover:text-slate-900 hidden lg:flex border border-slate-200 shadow-sm"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Left Side: Order Summary Panel */}
      <div className="lg:w-[40%] xl:w-[35%] bg-slate-50 flex flex-col border-r border-slate-100 relative shrink-0 lg:h-screen lg:sticky lg:top-0">
        <div className="p-6 lg:p-10 flex flex-col h-full min-h-full">
          
          {/* Brand Header */}
          <div className="mb-6 lg:mb-10 mt-2 lg:mt-0">
            <h2 className="text-2xl font-bold text-slate-900 leading-none">{brand.name}</h2>
          </div>

          {/* Product Image Focus */}
          <div className="flex-1 flex items-center justify-center relative min-h-[160px] lg:min-h-[240px]">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-100/50 rounded-3xl -z-10"></div>
            <img 
              src={brand.image} 
              alt={brand.name} 
              referrerPolicy="no-referrer"
              className="w-full h-full max-h-[220px] lg:max-h-[300px] object-contain drop-shadow-xl mix-blend-multiply transition-transform hover:scale-105 duration-500" 
            />
          </div>
        </div>
      </div>

      {/* Right Side: Interactive Checkout Form */}
      <div className="lg:flex-1 flex flex-col h-full relative bg-white lg:h-screen lg:overflow-y-auto">
        <form onSubmit={handleSubmit} className="flex flex-col h-full w-full max-w-3xl mx-auto">
          
          {/* Scrollable Form Body */}
          <div className="flex-1 px-6 lg:px-12 py-8 lg:py-12 space-y-10 lg:space-y-12 pb-8 lg:pb-12">
                
                {/* Section 1: Order Details */}
                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-7 h-7 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs">1</div>
                    <h3 className="text-lg lg:text-xl font-bold text-slate-900 tracking-tight">{t("order.productDetails")}</h3>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between items-end mb-3">
                        <label className="text-sm font-medium text-slate-700 pl-1">{t("order.cylinderSize")}</label>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        {([12] as CylinderSize[]).map((s) => (
                          <label
                            key={s}
                            className={`cursor-pointer rounded-2xl border-2 p-3 lg:p-4 text-center transition-all relative overflow-hidden group ${
                              size === s
                                ? 'border-slate-900 bg-slate-900 text-white shadow-lg shadow-slate-900/10'
                                : 'border-slate-100 hover:border-slate-200 bg-white text-slate-700'
                            }`}
                          >
                            {s === 12 && (
                              <div className={`absolute top-0 inset-x-0 text-[9px] font-bold py-0.5 uppercase tracking-wider ${size === s ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'}`}>
                                Popular
                              </div>
                            )}
                            <input
                              type="radio"
                              name="size"
                              value={s}
                              checked={size === s}
                              onChange={() => setSize(s)}
                              className="sr-only"
                            />
                            <div className={`font-black text-xl lg:text-2xl mt-3 mb-0.5 ${size === s ? 'text-white' : 'text-slate-900'}`}>{s} <span className="text-sm font-semibold opacity-70">KG</span></div>
                            <div className={`text-xs font-semibold tracking-wide ${size === s ? 'text-white/90' : 'text-slate-500'}`}>৳ {brand?.currentPrice || PRICING[s].price}</div>
                            
                            {size === s && (
                              <div className="absolute top-2 right-2 text-white">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </div>
                            )}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-end mb-3 mt-6">
                        <label className="text-sm font-medium text-slate-700 pl-1">{t("order.cylinderType")}</label>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <label
                          className={`cursor-pointer rounded-2xl border-2 p-4 flex flex-col items-start transition-all relative overflow-hidden group ${
                            cylinderType === 'refill'
                              ? 'border-slate-900 bg-slate-900 text-white shadow-lg shadow-slate-900/10'
                              : 'border-slate-100 hover:border-slate-200 bg-white text-slate-700'
                          }`}
                        >
                          <input
                            type="radio"
                            name="cylinderType"
                            value="refill"
                            checked={cylinderType === 'refill'}
                            onChange={() => setCylinderType('refill')}
                            className="sr-only"
                          />
                          <div className={`font-bold text-base mb-1 ${cylinderType === 'refill' ? 'text-white' : 'text-slate-900'}`}>
                            {t("order.cylinderType.refill")}
                          </div>
                          <div className={`text-xs ${cylinderType === 'refill' ? 'text-white/80' : 'text-slate-500'}`}>
                            {t("order.cylinderType.refillDesc")}
                          </div>
                          <div className={`mt-3 font-semibold ${cylinderType === 'refill' ? 'text-white' : 'text-slate-700'}`}>
                            ৳ {brand?.currentPrice || PRICING[size].price}
                          </div>
                          {cylinderType === 'refill' && (
                            <div className="absolute top-4 right-4 text-white">
                              <CheckCircle2 className="w-4 h-4" />
                            </div>
                          )}
                        </label>

                        <label
                          className={`cursor-pointer rounded-2xl border-2 p-4 flex flex-col items-start transition-all relative overflow-hidden group ${
                            cylinderType === 'new'
                              ? 'border-slate-900 bg-slate-900 text-white shadow-lg shadow-slate-900/10'
                              : 'border-slate-100 hover:border-slate-200 bg-white text-slate-700'
                          }`}
                        >
                          <input
                            type="radio"
                            name="cylinderType"
                            value="new"
                            checked={cylinderType === 'new'}
                            onChange={() => setCylinderType('new')}
                            className="sr-only"
                          />
                          <div className={`font-bold text-base mb-1 ${cylinderType === 'new' ? 'text-white' : 'text-slate-900'}`}>
                            {t("order.cylinderType.new")}
                          </div>
                          <div className={`text-xs ${cylinderType === 'new' ? 'text-white/80' : 'text-slate-500'}`}>
                            (৳ 1000 + ৳ {brand?.currentPrice || PRICING[size].price})
                          </div>
                          <div className={`mt-3 font-semibold ${cylinderType === 'new' ? 'text-white' : 'text-slate-700'}`}>
                            ৳ {((brand?.currentPrice || PRICING[size].price) + 1000).toLocaleString()}
                          </div>
                          {cylinderType === 'new' && (
                            <div className="absolute top-4 right-4 text-white">
                              <CheckCircle2 className="w-4 h-4" />
                            </div>
                          )}
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-700 pl-1 mb-3 block">{t("order.quantity")}</label>
                      <div className="inline-flex items-center gap-1 bg-slate-50 rounded-xl border-2 border-slate-100 p-1">
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(-1)}
                          className="w-12 h-12 rounded-lg bg-white flex items-center justify-center text-slate-600 hover:text-slate-900 hover:shadow-sm border border-slate-200/50 transition-all active:scale-95"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="text-xl font-bold w-14 text-center text-slate-900">{quantity}</span>
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(1)}
                          className="w-12 h-12 rounded-lg bg-slate-900 flex items-center justify-center text-white hover:bg-slate-800 transition-all shadow-md active:scale-95"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </section>

                <hr className="border-slate-100" />

                {/* Section 2: {t("order.deliveryDetails")} */}
                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-7 h-7 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs">2</div>
                    <h3 className="text-lg lg:text-xl font-bold text-slate-900 tracking-tight">{t("order.deliveryDetails")}</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4 lg:gap-5">
                    <div className="mb-2">
                      <label className="text-sm font-medium text-slate-700 pl-1 mb-3 block">{t("order.deliveryType.title")}</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <label
                          className={`cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center justify-center text-center transition-all ${
                            deliveryType === 'self'
                              ? 'border-slate-900 bg-slate-900 text-white shadow-md'
                              : 'border-slate-100 hover:border-slate-200 bg-white text-slate-700'
                          }`}
                        >
                          <input
                            type="radio"
                            name="deliveryType"
                            value="self"
                            checked={deliveryType === 'self'}
                            onChange={() => {
                              setDeliveryType('self');
                              if (paymentMethod === 'cod') {
                                setPaymentMethod('cash');
                              }
                            }}
                            className="sr-only"
                          />
                          <span className="font-bold text-sm">{t("order.deliveryType.self")}</span>
                          <span className={`text-[10px] sm:text-xs mt-1 font-medium ${deliveryType === 'self' ? 'text-white/90' : 'text-slate-500'}`}>
                            Only pay for gas (Self Pickup) / (দোকান থেকে সংগ্রহ)
                          </span>
                        </label>
                        <label
                          className={`cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center justify-center text-center transition-all ${
                            deliveryType === 'road_step'
                              ? 'border-slate-900 bg-slate-900 text-white shadow-md'
                              : 'border-slate-100 hover:border-slate-200 bg-white text-slate-700'
                          }`}
                        >
                          <input
                            type="radio"
                            name="deliveryType"
                            value="road_step"
                            checked={deliveryType === 'road_step'}
                            onChange={() => setDeliveryType('road_step')}
                            className="sr-only"
                          />
                          <span className="font-bold text-sm">{t("order.deliveryType.home")}</span>
                          <span className={`text-[10px] mt-1 ${deliveryType === 'road_step' ? 'text-white/80' : 'text-slate-500'}`}>{t("order.deliveryType.homeDesc")}</span>
                        </label>
                      </div>
                    </div>

                    <div className="space-y-4 lg:space-y-5 mt-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5">
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-slate-700 pl-1">{t("order.fullName")}</label>
                          <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                              required
                              type="text"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              className="w-full pl-11 pr-4 py-3.5 rounded-xl border-2 border-slate-100 focus:border-slate-900 bg-white hover:border-slate-200 outline-none transition-all font-semibold text-slate-900 text-sm placeholder-slate-400"
                              placeholder={t("order.fullName.placeholder")}
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-slate-700 pl-1">{t("order.phoneNumber")}</label>
                          <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                              required
                              type="tel"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              className="w-full pl-11 pr-4 py-3.5 rounded-xl border-2 border-slate-100 focus:border-slate-900 bg-white hover:border-slate-200 outline-none transition-all font-semibold text-slate-900 text-sm placeholder-slate-400"
                              placeholder={t("order.phoneNumber.placeholder")}
                            />
                          </div>
                        </div>
                      </div>

                      <AnimatePresence>
                        {deliveryType === 'road_step' && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0, y: -10 }}
                            animate={{ opacity: 1, height: 'auto', y: 0 }}
                            exit={{ opacity: 0, height: 0, y: -10 }}
                            className="overflow-hidden space-y-1.5"
                          >
                            <label className="text-sm font-medium text-slate-700 pl-1">{t("order.address")}</label>
                            <div className="relative">
                              <MapPin className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                              <textarea
                                required={deliveryType === 'road_step'}
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                rows={2}
                                className="w-full pl-11 pr-4 py-3.5 rounded-xl border-2 border-slate-100 focus:border-slate-900 bg-white hover:border-slate-200 outline-none transition-all resize-none font-semibold text-slate-900 text-sm placeholder-slate-400"
                                placeholder={t("order.address.placeholder")}
                              />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </section>

                <hr className="border-slate-100" />

                {/* Section 3: Payment */}
                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-7 h-7 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs">3</div>
                    <h3 className="text-lg lg:text-xl font-bold text-slate-900 tracking-tight">{t("order.paymentMethod")}</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
                    {availablePaymentMethods.map((method) => {
                      const Icon = ICONS[method.icon as keyof typeof ICONS] || CreditCard;
                      const isDisabled = method.id === 'cod' && deliveryType === 'self';
                      return (
                        <label
                          key={method.id}
                          className={`rounded-xl border-2 p-4 flex flex-col items-center justify-center text-center gap-2.5 transition-all relative group ${
                            isDisabled ? 'opacity-50 cursor-not-allowed bg-slate-50 border-slate-100' : 'cursor-pointer'
                          } ${
                            paymentMethod === method.id
                              ? 'border-slate-900 bg-slate-900 text-white shadow-lg shadow-slate-900/10'
                              : !isDisabled ? 'border-slate-100 hover:border-slate-200 bg-white text-slate-600' : ''
                          }`}
                        >
                          <input
                            type="radio"
                            name="payment"
                            value={method.id}
                            checked={paymentMethod === method.id}
                            disabled={isDisabled}
                            onChange={() => setPaymentMethod(method.id as PaymentMethod)}
                            className="sr-only"
                          />
                          <Icon className={`w-6 h-6 lg:w-7 lg:h-7 ${paymentMethod === method.id ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
                          <span className="text-xs font-bold tracking-wide uppercase">{method.label}</span>
                          
                          {paymentMethod === method.id && (
                            <div className="absolute top-2 right-2 text-white">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </div>
                          )}
                        </label>
                      );
                    })}
                  </div>

                  {/* Dynamic MFS Fields */}
                  <AnimatePresence mode="popLayout">
                    {needsTrxDetails && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, y: -10 }}
                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -10 }}
                        className="overflow-hidden mt-4"
                      >
                        <div className="bg-slate-50 border-2 border-slate-100 p-5 lg:p-6 rounded-2xl space-y-5">
                          <div className="flex items-start gap-3 border-b border-slate-200 pb-4">
                            <div className="bg-slate-900 p-2 rounded-full shrink-0">
                              <Info className="w-4 h-4 text-white" />
                            </div>
                            <div className="text-xs lg:text-sm text-slate-600 space-y-1.5 pt-0.5">
                              <p className="font-bold text-slate-900 tracking-wide uppercase text-xs">{t("order.paymentInst.title")}</p>
                              <div className="flex flex-col gap-3">
                                <div className="flex flex-wrap items-center gap-1.5 leading-relaxed text-sm">
                                  <span className="font-semibold text-slate-800">{effectiveMethod === 'bank' ? t('order.paymentInst.step1.bankStart') : t('order.paymentInst.step1')}</span>
                                  <span className="font-extrabold text-slate-900 bg-white border border-slate-200 px-2 py-0.5 rounded shadow-sm text-sm">৳ {totalPrice}</span>
                                  {effectiveMethod === 'bank' && (
                                    <>
                                      <span>{t('order.paymentInst.step1.bank')}</span>
                                      <span className="font-bold text-slate-900 tracking-wider bg-slate-200/50 px-2 py-1 rounded inline-flex items-center gap-2">
                                        {getAgentNumber(effectiveMethod)}
                                        <button type="button" onClick={handleCopyNumber} className="hover:text-blue-600 transition-colors bg-white shadow-sm p-1 rounded border border-slate-200" title="Copy Number">
                                          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                                        </button>
                                      </span>
                                    </>
                                  )}
                                </div>

                                {/* QR Code image - ALWAYS visible */}
                                <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center gap-2.5 shadow-sm max-w-[260px] mx-auto w-full my-1">
                                  <p className="text-xs font-semibold text-slate-700 tracking-wide uppercase">
                                    {effectiveMethod === 'bank' ? t('order.paymentInst.scan.bank') : t('order.paymentInst.scan.agent')}
                                  </p>
                                  <div className="p-2 bg-white border border-slate-100 rounded-xl shadow-sm">
                                    <img 
                                      src={
                                        effectiveMethod === 'bkash' || effectiveMethod === 'online' ? "/bkash_agent_qrCode.jpeg" : 
                                        effectiveMethod === 'rocket' ? "/Rocket%20Agent.jpg" : 
                                        effectiveMethod === 'nagad' ? "/nagad_qr.jpg" : 
                                        `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${getAgentNumber(effectiveMethod)}`
                                      } 
                                      alt="Payment QR Code" 
                                      className="w-44 h-44 sm:w-48 sm:h-48 rounded-lg object-contain"
                                    />
                                  </div>
                                </div>
                              </div>
                              <p>{effectiveMethod === 'bank' ? t('order.paymentInst.step2.bank') : t('order.paymentInst.step2')}</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-xs font-medium text-slate-700 pl-1">{effectiveMethod === 'bank' ? t('order.senderNumber.bank') : t('order.senderNumber')}</label>
                              <input
                                required={needsTrxDetails}
                                type="text"
                                value={senderPhone}
                                onChange={(e) => setSenderPhone(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-slate-900 bg-white outline-none font-semibold text-slate-900 text-sm placeholder-slate-400 transition-colors"
                                placeholder={effectiveMethod === 'bank' ? t('order.senderNumber.bank.placeholder') : t('order.senderNumber.placeholder')}
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-xs font-medium text-slate-700 pl-1">{effectiveMethod === 'bank' ? t('order.trxId.bank') : t('order.trxId')}</label>
                              <input
                                required={needsTrxDetails}
                                type="text"
                                value={trxId}
                                onChange={(e) => setTrxId(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-slate-900 bg-white outline-none font-semibold text-slate-900 text-sm placeholder-slate-400 transition-colors"
                                placeholder={effectiveMethod === 'bank' ? t('order.trxId.bank.placeholder') : t('order.trxId.placeholder')}
                              />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </section>
                
                <hr className="border-slate-100" />
                
                {/* Cart Summary */}
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 lg:p-6 shadow-sm w-full">
                  <h3 className="text-[11px] lg:text-sm font-medium text-slate-700 mb-3 lg:mb-4">Order Summary</h3>
                  <div className="space-y-3 text-sm font-medium">
                    <div className="flex justify-between items-start gap-3 text-slate-600">
                      <div className="flex items-start gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0"></span>
                        <span className="leading-snug">
                          <span className="text-slate-800">{brand.name} {size}KG</span>
                          <span className="text-slate-400 ml-1.5 whitespace-nowrap">x {quantity}</span>
                        </span>
                      </div>
                      <span className="font-bold text-slate-900 whitespace-nowrap mt-0.5">৳ {((brand?.currentPrice || PRICING[size].price) * quantity).toLocaleString()}</span>
                    </div>
                    {cylinderType === "new" && (
                      <div className="flex justify-between items-start gap-3 text-slate-600">
                        <div className="flex items-start gap-2.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0"></span>
                          <span className="leading-snug">
                            <span className="text-slate-800">{t("order.summary.newCylinder")}</span>
                            <span className="text-slate-400 ml-1.5 whitespace-nowrap">x {quantity}</span>
                          </span>
                        </div>
                        <span className="font-bold text-slate-900 whitespace-nowrap mt-0.5">৳ {(1000 * quantity).toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-slate-600">
                      <span className="flex items-center gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0"></span>
                        {t("order.deliveryFee")}
                      </span>
                      <span className="font-bold text-slate-900 whitespace-nowrap">৳ {DELIVERY_CHARGE}</span>
                    </div>
                    <div className="pt-3 mt-1 border-t border-slate-200 flex justify-between items-end">
                      <span className="font-bold text-slate-900">{t("order.totalAmount")}</span>
                      <span className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight whitespace-nowrap">৳ {totalPrice.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Form Footer CTA */}
                <div className="bg-slate-50 border border-slate-100 p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
                  <div className="flex flex-col text-center sm:text-left w-full sm:w-auto">
                    <span className="text-sm font-medium text-slate-700 mb-1">{t("order.totalAmount")}</span>
                    <span className="text-3xl font-black text-slate-900 tracking-tight leading-none">৳ {totalPrice.toLocaleString()}</span>
                    {deliveryType === 'road_step' ? (
                      <span className="text-[10px] font-semibold text-slate-500 mt-1">Includes delivery charge (৳ {DELIVERY_CHARGE})</span>
                    ) : (
                      <span className="text-[10px] font-semibold text-emerald-600 mt-1">No delivery charge (Self Pickup)</span>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full sm:w-auto bg-slate-900 text-white rounded-xl py-4 px-10 font-bold text-base flex items-center justify-center gap-2 transition-all transform shadow-xl shadow-slate-900/10 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-slate-800 active:scale-95'}`}
                  >
                    {isSubmitting ? (
                      <>
                        Placing Order... <Loader2 className="w-5 h-5 animate-spin" />
                      </>
                    ) : (
                      <>
                        Place Order <CheckCircle2 className="w-5 h-5 opacity-80" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
      </div>
    </motion.div>
  );
}

