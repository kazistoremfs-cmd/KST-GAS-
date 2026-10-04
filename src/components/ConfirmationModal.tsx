import { useState, useRef } from 'react';
import { OrderData } from '../types';
import { PRICING, PAYMENT_METHODS } from '../data';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  Download, 
  Share2, 
  X, 
  Copy, 
  Check, 
  Flame, 
  MapPin, 
  Phone, 
  User, 
  CreditCard, 
  Loader2, 
  Calendar,
  Sparkles
} from 'lucide-react';
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
  const [copiedId, setCopiedId] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const orderDate = useRef(
    new Date().toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  ).current;

  if (!isOpen || !order) return null;

  const DELIVERY_CHARGE = order.deliveryType === 'road_step' ? 40 : 0;
  const cylinderBasePrice = order.cylinderType === 'new' 
    ? ((order.brand?.currentPrice || PRICING[order.size].price) + 1000) 
    : (order.brand?.currentPrice || PRICING[order.size].price);
  const subtotal = cylinderBasePrice * order.quantity;
  const totalPrice = subtotal + DELIVERY_CHARGE;
  const paymentMethodLabel = PAYMENT_METHODS.find(m => m.id === order.paymentMethod)?.label || order.paymentMethod;
  const orderId = order.orderId || Math.random().toString(36).substring(2, 10).toUpperCase();

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(orderId);
    setCopiedId(true);
    showToast(t('confirm.copied'));
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Generate high-resolution JPEG data URL
  const generateJpegDataUrl = async (): Promise<string> => {
    if (!receiptRef.current) throw new Error("Receipt element not found");
    return await toJpeg(receiptRef.current, {
      quality: 0.98,
      pixelRatio: 3, // Ultra-high 3x DPI for razor sharp mobile clarity
      backgroundColor: '#ffffff',
      cacheBust: true,
    });
  };

  // Download receipt in high-resolution JPEG
  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      const dataUrl = await generateJpegDataUrl();
      const link = document.createElement('a');
      link.download = `LP_Gas_Receipt_${orderId}.jpg`;
      link.href = dataUrl;
      link.click();
      showToast(language === 'bn' ? 'রিসিট সফলভাবে ডাউনলোড হয়েছে!' : 'Receipt downloaded successfully!');
    } catch (error) {
      console.error('Failed to download receipt JPEG', error);
      showToast(language === 'bn' ? 'ডাউনলোড ব্যর্থ হয়েছে, পুনরায় চেষ্টা করুন।' : 'Failed to download receipt, please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  // Share receipt directly as JPEG image on mobile (WhatsApp, Messenger, etc.)
  const handleShare = async () => {
    try {
      setIsSharing(true);
      const dataUrl = await generateJpegDataUrl();
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const fileName = `LP_Gas_Receipt_${orderId}.jpg`;
      const file = new File([blob], fileName, { type: 'image/jpeg' });

      // Check if browser Web Share API supports file sharing
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `LP Gas Receipt #${orderId}`,
          text: `Official Order Receipt #${orderId} - Total: ৳${totalPrice} (${order.brand?.name})`,
          files: [file],
        });
        showToast(language === 'bn' ? 'রিসিট সফলভাবে শেয়ার হয়েছে!' : 'Receipt shared successfully!');
      } else if (navigator.share) {
        // Fallback: share text and auto-download image
        const link = document.createElement('a');
        link.download = fileName;
        link.href = dataUrl;
        link.click();

        await navigator.share({
          title: `LP Gas Receipt #${orderId}`,
          text: `LP Gas Order Receipt #${orderId}\nCustomer: ${order.customerName}\nProduct: ${order.brand?.name} (${order.size}KG)\nTotal Amount: ৳${totalPrice}\nHelpline: 01609540761`,
        });
      } else {
        // Fallback for desktop: download JPEG and copy details
        const link = document.createElement('a');
        link.download = fileName;
        link.href = dataUrl;
        link.click();
        navigator.clipboard.writeText(
          `LP Gas Order Receipt #${orderId}\nCustomer: ${order.customerName} (${order.phone})\nProduct: ${order.brand?.name} (${order.quantity}x)\nTotal: ৳${totalPrice}`
        );
        showToast(language === 'bn' ? 'রিসিট ডাউনলোড এবং বিবরণ কপি হয়েছে!' : 'Receipt downloaded & details copied to clipboard!');
      }
    } catch (err) {
      if ((err as Error)?.name !== 'AbortError') {
        console.error('Share failed', err);
        showToast(language === 'bn' ? 'শেয়ার করা যায়নি, রিসিট ডাউনলোড হচ্ছে...' : 'Could not share, downloading image...');
        handleDownload();
      }
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.98 }}
          transition={{ type: "spring", damping: 26, stiffness: 220 }}
          className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden flex flex-col my-auto max-h-[92vh]"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-colors z-40"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Toast Notification */}
          <AnimatePresence>
            {toastMessage && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg flex items-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{toastMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Scrollable Receipt Body */}
          <div className="overflow-y-auto p-4 sm:p-6 space-y-4">
            
            {/* The Actual Downloadable Receipt Container */}
            <div 
              ref={receiptRef} 
              className="bg-white border-2 border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm text-slate-900 font-sans mx-auto max-w-md w-full"
              style={{ backgroundColor: '#ffffff' }}
            >
              {/* Receipt Header */}
              <div className="flex flex-col items-center text-center pb-4 border-b-2 border-dashed border-slate-200">
                <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white mb-2 shadow-sm">
                  <Flame className="w-7 h-7 text-amber-400" />
                </div>
                <h2 className="text-xl font-black tracking-tight text-slate-900 uppercase">
                  {t('confirm.storeName')}
                </h2>
                <p className="text-[11px] font-bold tracking-widest text-slate-500 uppercase mt-0.5">
                  {t('confirm.memoTitle')}
                </p>
                <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold mt-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{t('confirm.statusConfirmed')}</span>
                </div>
              </div>

              {/* Order Meta: ID & Date */}
              <div className="grid grid-cols-2 gap-2 py-3 border-b border-dashed border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">{t('confirm.orderId')}</span>
                  <div className="flex items-center gap-1 font-mono font-bold text-slate-900 mt-0.5">
                    <span>#{orderId}</span>
                    <button 
                      type="button" 
                      onClick={handleCopyOrderId} 
                      className="text-slate-400 hover:text-slate-700 p-0.5 rounded transition-colors"
                      title="Copy ID"
                    >
                      {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">{t('confirm.date')}</span>
                  <span className="font-semibold text-slate-700 mt-0.5 block flex items-center justify-end gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    {orderDate}
                  </span>
                </div>
              </div>

              {/* Customer Information */}
              <div className="py-3 border-b border-dashed border-slate-200 text-xs space-y-1.5">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">{t('confirm.customerInfo')}</span>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-slate-500 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-400" /> {t('confirm.customer')}:
                  </span>
                  <span className="font-bold text-slate-900 text-right">{order.customerName}</span>
                </div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-slate-500 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" /> {t('confirm.phone')}:
                  </span>
                  <span className="font-mono font-bold text-slate-900">{order.phone}</span>
                </div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-slate-500 flex items-center gap-1 shrink-0">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> {t('confirm.address')}:
                  </span>
                  <span className="font-medium text-slate-800 text-right">
                    {order.deliveryType === 'self' ? (
                      <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold text-[10px]">
                        {language === 'bn' ? 'দোকান থেকে সংগ্রহ (Self Pickup)' : 'Self Pickup'}
                      </span>
                    ) : (
                      order.address
                    )}
                  </span>
                </div>
              </div>

              {/* Ordered Items Table */}
              <div className="py-3 border-b border-dashed border-slate-200 text-xs">
                <span className="text-slate-400 text-[10px] uppercase font-bold block mb-2">{t('confirm.orderSummary')}</span>
                
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <div className="font-bold text-slate-900 text-sm">
                        {order.brand?.name}
                      </div>
                      <div className="text-slate-500 text-[11px] font-medium">
                        {order.size} KG • {order.cylinderType === 'new' ? t('order.cylinderType.new') : t('order.cylinderType.refill')}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-slate-900 text-sm">
                        ৳ {(cylinderBasePrice * order.quantity).toLocaleString()}
                      </div>
                      <div className="text-slate-400 text-[10px]">
                        {order.quantity} × ৳ {cylinderBasePrice.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {order.cylinderType === 'new' && (
                    <div className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 flex justify-between">
                      <span>{t('order.summary.newCylinder')}</span>
                      <span>+৳ {(1000 * order.quantity).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Details & Breakdown */}
              <div className="py-3 border-b-2 border-dashed border-slate-200 text-xs space-y-1.5">
                <div className="flex justify-between text-slate-600">
                  <span>{t('confirm.subtotal')}:</span>
                  <span className="font-semibold text-slate-900">৳ {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>{t('order.deliveryFee')}:</span>
                  <span className="font-semibold text-slate-900">৳ {DELIVERY_CHARGE}</span>
                </div>
                
                {/* Grand Total Box */}
                <div className="bg-slate-900 text-white rounded-xl p-3 flex justify-between items-center my-2 shadow-sm">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-slate-300 block">
                      {t('confirm.grandTotal')}
                    </span>
                    <span className="text-xl font-black tracking-tight text-white">
                      ৳ {totalPrice.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-300 block">
                      {t('confirm.method')}
                    </span>
                    <span className="font-bold text-amber-300 text-xs uppercase flex items-center justify-end gap-1">
                      <CreditCard className="w-3 h-3" />
                      {paymentMethodLabel}
                    </span>
                  </div>
                </div>

                {/* Additional MFS / Bank details if available */}
                {(order.senderPhone || order.trxId) && (
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 space-y-1 text-[11px] mt-2">
                    {order.senderPhone && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">{t('confirm.last4')}:</span>
                        <span className="font-mono font-bold text-slate-800">{order.senderPhone}</span>
                      </div>
                    )}
                    {order.trxId && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">{t('confirm.trxId')}:</span>
                        <span className="font-mono font-bold text-slate-800">{order.trxId}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Receipt Footer & Barcode aesthetic */}
              <div className="pt-4 text-center space-y-2">
                <p className="text-xs font-bold text-slate-800">
                  {t('confirm.thankYou')}
                </p>
                <p className="text-[11px] font-semibold text-slate-500">
                  {t('confirm.helpline')}
                </p>

                {/* Barcode visual simulation */}
                <div className="pt-2 flex flex-col items-center justify-center">
                  <div className="flex items-center gap-[2px] h-7 opacity-80">
                    {Array.from({ length: 42 }).map((_, i) => (
                      <div 
                        key={i} 
                        className={`bg-slate-800 h-full ${
                          i % 3 === 0 ? 'w-[3px]' : i % 2 === 0 ? 'w-[1.5px]' : 'w-[1px]'
                        }`} 
                      />
                    ))}
                  </div>
                  <span className="font-mono text-[9px] text-slate-400 tracking-widest mt-1">
                    *{orderId}*
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons: Download JPEG, Share, Done */}
            <div className="space-y-2.5 pt-2">
              <div className="grid grid-cols-2 gap-3">
                {/* Download Button */}
                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={isDownloading || isSharing}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 text-xs sm:text-sm disabled:opacity-60 cursor-pointer"
                >
                  {isDownloading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>{t('confirm.downloading')}</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 text-white" />
                      <span>{t('confirm.download')}</span>
                    </>
                  )}
                </button>

                {/* Share Button */}
                <button
                  type="button"
                  onClick={handleShare}
                  disabled={isDownloading || isSharing}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 text-xs sm:text-sm disabled:opacity-60 cursor-pointer"
                >
                  {isSharing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>{t('confirm.sharing')}</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4 text-white" />
                      <span>{t('confirm.share')}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 rounded-xl transition-colors text-xs sm:text-sm cursor-pointer"
              >
                {t('confirm.close')}
              </button>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
