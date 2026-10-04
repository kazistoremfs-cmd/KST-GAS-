import { useState, useRef } from 'react';
import { OrderData } from '../types';
import { PRICING, PAYMENT_METHODS } from '../data';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Download, Share2, X, Loader2, Calendar, PhoneCall, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { toJpeg } from 'html-to-image';

interface ConfirmationModalProps {
  order: OrderData | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ConfirmationModal({ order, isOpen, onClose }: ConfirmationModalProps) {
  const { t, language } = useLanguage();
  const receiptRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  if (!isOpen || !order) return null;

  const DELIVERY_CHARGE = order.deliveryType === 'road_step' ? 40 : 0;
  const cylinderBasePrice = order.cylinderType === 'new' 
    ? ((order.brand?.currentPrice || PRICING[order.size].price) + 1000) 
    : (order.brand?.currentPrice || PRICING[order.size].price);
  const subtotal = cylinderBasePrice * order.quantity;
  const totalPrice = subtotal + DELIVERY_CHARGE;
  const paymentMethodLabel = PAYMENT_METHODS.find(m => m.id === order.paymentMethod)?.label || order.paymentMethod;
  const orderId = order.orderId || Math.random().toString(36).substring(2, 10).toUpperCase();

  // Formatted date and time for receipt
  const now = new Date();
  let formattedDateTime = '';
  try {
    formattedDateTime = now.toLocaleString(language === 'bn' ? 'bn-BD' : 'en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    formattedDateTime = now.toLocaleDateString();
  }

  // High-resolution JPEG generator for crisp mobile clarity
  const generateJpegDataUrl = async (): Promise<string> => {
    if (!receiptRef.current) throw new Error("Receipt element not found");

    // Scroll container to top to prevent canvas clipping in html-to-image
    const scrollContainer = receiptRef.current.parentElement;
    const prevScrollTop = scrollContainer ? scrollContainer.scrollTop : 0;
    if (scrollContainer) {
      scrollContainer.scrollTop = 0;
    }

    try {
      // Small pause for DOM and fonts to settle
      await new Promise(resolve => setTimeout(resolve, 80));

      return await toJpeg(receiptRef.current, {
        quality: 0.98,
        pixelRatio: 3, // Ultra-sharp 3x DPI for mobile
        backgroundColor: '#ffffff',
        cacheBust: true,
        style: {
          margin: '0',
          width: '100%',
        }
      });
    } finally {
      if (scrollContainer && prevScrollTop > 0) {
        scrollContainer.scrollTop = prevScrollTop;
      }
    }
  };

  // Download receipt as JPEG
  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      const dataUrl = await generateJpegDataUrl();
      const link = document.createElement('a');
      link.download = `kazi-lpg-receipt-${orderId}.jpg`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Failed to download receipt JPEG', error);
    } finally {
      setIsDownloading(false);
    }
  };

  // Share receipt as JPEG image on mobile (WhatsApp, Messenger, etc.)
  const handleShare = async () => {
    try {
      setIsSharing(true);
      const dataUrl = await generateJpegDataUrl();
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const fileName = `kazi-lpg-receipt-${orderId}.jpg`;
      const file = new File([blob], fileName, { type: 'image/jpeg' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `LP Gas Receipt #${orderId}`,
          text: `Order Receipt #${orderId} - Total: ৳${totalPrice} (${order.brand?.name})`,
          files: [file],
        });
      } else if (navigator.share) {
        // Fallback if browser can't share files directly
        const link = document.createElement('a');
        link.download = fileName;
        link.href = dataUrl;
        link.click();

        await navigator.share({
          title: `LP Gas Receipt #${orderId}`,
          text: `LP Gas Order Receipt #${orderId}\nCustomer: ${order.customerName}\nProduct: ${order.brand?.name} (${order.size}KG)\nTotal Amount: ৳${totalPrice}\nHelpline: 01609540761`,
        });
      } else {
        // Fallback for desktop/unsupported browsers
        const link = document.createElement('a');
        link.download = fileName;
        link.href = dataUrl;
        link.click();
      }
    } catch (err) {
      if ((err as Error)?.name !== 'AbortError') {
        console.error('Share failed', err);
        handleDownload();
      }
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ opacity: 0, y: "100%" }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden flex flex-col mt-auto sm:mt-0 max-h-[92vh] sm:max-h-[90vh]"
        >
          {/* Top Bar for Mobile */}
          <div className="w-full flex items-center justify-between px-4 pt-3 pb-1 sm:hidden relative z-30 shrink-0">
            <div className="w-8" />
            <div className="w-12 h-1.5 bg-slate-300 rounded-full" onClick={onClose} />
            <button
              onClick={onClose}
              className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Desktop Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/80 hover:bg-slate-100 rounded-full transition-colors text-slate-500 hidden sm:flex z-40 shadow-sm border border-slate-200/60"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Scrollable Receipt Body */}
          <div className="overflow-y-auto flex-1 overscroll-contain">
            {/* The Original Receipt Card (captured for Download & Share) */}
            <div ref={receiptRef} className="bg-white text-slate-900">
              {/* Header with Store Badge & Confirmation Status */}
              <div className="bg-gradient-to-b from-emerald-50 via-emerald-50/60 to-white px-5 sm:px-6 pt-5 pb-5 sm:pt-6 sm:pb-6 flex flex-col items-center text-center border-b border-emerald-100/80">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] sm:text-xs font-semibold mb-3 tracking-wide border border-emerald-200/50">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t("confirm.storeName")}</span>
                  <span className="text-emerald-400">•</span>
                  <span>{t("confirm.memoTitle")}</span>
                </div>

                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-emerald-500 flex items-center justify-center text-white mb-2.5 shadow-md shadow-emerald-500/20">
                  <CheckCircle2 className="w-7 h-7 sm:w-8 sm:h-8" />
                </div>
                
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-1">
                  {t("confirm.title")}
                </h2>
                <p className="text-xs text-slate-600 max-w-xs leading-relaxed">
                  {t("confirm.subtitle")}
                </p>
              </div>

              {/* Receipt Details Table */}
              <div className="p-4 sm:p-6 space-y-4">
                <div className="space-y-2.5 text-xs sm:text-sm">
                  {/* Order ID */}
                  <div className="flex justify-between items-center border-b border-dashed border-slate-200 pb-2.5">
                    <span className="text-slate-500 font-medium">{t("confirm.orderId")}</span>
                    <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-xs sm:text-sm">
                      #{orderId}
                    </span>
                  </div>

                  {/* Order Date & Time */}
                  <div className="flex justify-between items-center border-b border-dashed border-slate-200 pb-2.5">
                    <span className="text-slate-500 font-medium flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {t("confirm.date")}
                    </span>
                    <span className="text-slate-700 font-medium text-right text-xs">
                      {formattedDateTime}
                    </span>
                  </div>
                  
                  {/* Customer */}
                  <div className="flex justify-between items-start gap-4 border-b border-dashed border-slate-200 pb-2.5">
                    <span className="text-slate-500 font-medium shrink-0">
                      {language === 'bn' ? 'গ্রাহক' : 'Customer'}
                    </span>
                    <span className="font-medium text-right text-slate-900 flex-1 break-words">
                      <span className="font-semibold text-slate-900 block">{order.customerName}</span>
                      <span className="text-xs text-slate-500 font-mono tracking-wide">{order.phone}</span>
                    </span>
                  </div>

                  {/* Delivery Address */}
                  <div className="flex justify-between items-start gap-4 border-b border-dashed border-slate-200 pb-2.5">
                    <span className="text-slate-500 font-medium shrink-0">
                      {language === 'bn' ? 'ডেলিভারি ঠিকানা' : 'Address'}
                    </span>
                    <span className="font-medium text-right text-slate-900 flex-1 break-words">
                      {order.deliveryType === 'self' 
                        ? (language === 'bn' ? 'দোকান থেকে সংগ্রহ (Self Pickup)' : 'Self Pickup')
                        : (order.address || 'N/A')}
                    </span>
                  </div>

                  {/* Product Details */}
                  <div className="flex justify-between items-start gap-4 border-b border-dashed border-slate-200 pb-2.5">
                    <span className="text-slate-500 font-medium shrink-0">
                      {language === 'bn' ? 'পণ্য' : 'Product'}
                    </span>
                    <span className="font-medium text-right text-slate-900 flex-1">
                      <span className="font-semibold text-slate-900 block">{order.brand?.name}</span>
                      <span className="text-xs text-slate-500 block">
                        {order.size} KG • {order.cylinderType === 'new' ? t('order.cylinderType.new') : t('order.cylinderType.refill')}
                      </span>
                      <span className="text-xs text-slate-500 block">
                        {language === 'bn' ? `পরিমাণ: ${order.quantity} টি` : `Qty: ${order.quantity}`}
                        {order.cylinderType === "new" && (
                          <span className="text-emerald-600 font-semibold ml-1.5">
                            (+ ৳1,000)
                          </span>
                        )}
                      </span>
                    </span>
                  </div>

                  {/* Payment Method */}
                  <div className="flex justify-between items-center border-b border-dashed border-slate-200 pb-2.5">
                    <span className="text-slate-500 font-medium">{t("confirm.method")}</span>
                    <span className="font-semibold text-slate-900 uppercase tracking-wide">
                      {paymentMethodLabel}
                    </span>
                  </div>

                  {/* Last 4 Digit (if entered) */}
                  {order.senderPhone && (
                    <div className="flex justify-between items-center border-b border-dashed border-slate-200 pb-2.5">
                      <span className="text-slate-500 font-medium">{t("confirm.last4")}</span>
                      <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-xs sm:text-sm">
                        {order.senderPhone}
                      </span>
                    </div>
                  )}

                  {/* TrxID / Ref (if entered) */}
                  {order.trxId && (
                    <div className="flex justify-between items-center border-b border-dashed border-slate-200 pb-2.5">
                      <span className="text-slate-500 font-medium">{t("confirm.trxId")}</span>
                      <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-xs sm:text-sm">
                        {order.trxId}
                      </span>
                    </div>
                  )}

                  {/* Delivery Fee */}
                  <div className="flex justify-between items-center border-b border-dashed border-slate-200 pb-2.5">
                    <span className="text-slate-500 font-medium">{t("order.deliveryFee")}</span>
                    <span className="font-semibold text-right text-slate-900">
                      {DELIVERY_CHARGE === 0 
                        ? (language === 'bn' ? 'ফ্রি' : 'Free') 
                        : `৳ ${DELIVERY_CHARGE}`}
                    </span>
                  </div>
                </div>

                {/* Amount Box */}
                <div className="bg-gradient-to-r from-slate-50 to-emerald-50/40 p-3.5 sm:p-4 rounded-xl flex items-center justify-between border border-slate-200">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                      {t("confirm.amount")}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      {t("confirm.statusConfirmed")}
                    </span>
                  </div>
                  <span className="text-xl sm:text-2xl font-extrabold text-slate-900 font-mono">
                    ৳ {totalPrice.toLocaleString()}
                  </span>
                </div>

                {/* Receipt Footer Contact & Thanks Note */}
                <div className="pt-2 text-center border-t border-slate-100 space-y-1">
                  <p className="text-[11px] text-slate-600 font-medium flex items-center justify-center gap-1">
                    <PhoneCall className="w-3 h-3 text-emerald-600" />
                    <span>{t("confirm.helpline")}</span>
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {t("confirm.thankYou")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Bottom Action Buttons: Done, Share, Download */}
          <div className="p-3 sm:p-4 bg-white/95 backdrop-blur-md border-t border-slate-100 flex gap-2 shrink-0 z-20">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 sm:py-3 px-2 rounded-xl transition-colors text-xs sm:text-sm text-center"
            >
              {language === 'bn' ? 'সম্পন্ন' : 'Done'}
            </button>
            
            <button
              type="button"
              onClick={handleShare}
              disabled={isDownloading || isSharing}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 sm:py-3 px-2 rounded-xl transition-all shadow-sm active:scale-95 flex items-center justify-center gap-1.5 text-xs sm:text-sm disabled:opacity-60 cursor-pointer"
            >
              {isSharing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Share2 className="w-4 h-4" />
              )}
              <span>{isSharing ? t("confirm.sharing") : (language === 'bn' ? 'শেয়ার' : 'Share')}</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              disabled={isDownloading || isSharing}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 sm:py-3 px-2 rounded-xl transition-all shadow-sm active:scale-95 flex items-center justify-center gap-1.5 text-xs sm:text-sm disabled:opacity-60 cursor-pointer"
            >
              {isDownloading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>{isDownloading ? t("confirm.downloading") : (language === 'bn' ? 'ডাউনলোড' : 'Download')}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
