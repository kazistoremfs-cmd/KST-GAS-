import { OrderData } from '../types';
import { PRICING, PAYMENT_METHODS } from '../data';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Download, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface ConfirmationModalProps {
  order: OrderData | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ConfirmationModal({ order, isOpen, onClose }: ConfirmationModalProps) {
  const { t } = useLanguage();
  if (!isOpen || !order) return null;

  const DELIVERY_CHARGE = order.deliveryType === 'road_step' ? 40 : 0;
  const cylinderBasePrice = order.cylinderType === 'new' ? ((order.brand?.currentPrice || PRICING[order.size].price) + 1000) : (order.brand?.currentPrice || PRICING[order.size].price);
  const subtotal = cylinderBasePrice * order.quantity;
  const totalPrice = subtotal + DELIVERY_CHARGE;
  const paymentMethodLabel = PAYMENT_METHODS.find(m => m.id === order.paymentMethod)?.label || order.paymentMethod;

    return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ opacity: 0, y: "100%" }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="bg-white rounded-t-[2rem] sm:rounded-3xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden flex flex-col mt-auto sm:mt-0"
        >
          {/* Mobile Drag Indicator */}
          <div className="w-full flex justify-center pt-3 pb-1 sm:hidden absolute top-0 left-0 z-30" onClick={onClose}>
            <div className="w-12 h-1.5 bg-black/10 rounded-full"></div>
          </div>

          {/* Header */}
          <div className="bg-green-50 px-6 py-8 flex flex-col items-center text-center border-b border-green-100 mt-4 sm:mt-0">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
            >
              <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
            </motion.div>
            <h2 className="text-2xl font-bold text-slate-900 mb-1">{t("confirm.title")}</h2>
            <p className="text-slate-600">{t("confirm.subtitle")}</p>
          </div>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-black/5 rounded-full transition-colors text-slate-500 hidden sm:flex z-40"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Receipt Body */}
          <div className="p-6 space-y-6">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-dashed border-slate-200 pb-3">
                <span className="text-slate-500">{t("confirm.orderId")}</span>
                <span className="font-mono font-medium">#{order.orderId || Math.random().toString(36).substring(2, 10).toUpperCase()}</span>
              </div>
              
              <div className="flex justify-between border-b border-dashed border-slate-200 pb-3">
                <span className="text-slate-500">Customer</span>
                <span className="font-medium text-right">{order.customerName}<br/><span className="text-xs text-slate-400">{order.phone}</span></span>
              </div>

              <div className="flex justify-between border-b border-dashed border-slate-200 pb-3">
                <span className="text-slate-500">Product</span>
                <span className="font-medium text-right">
                  {order.brand?.name}<br/>
                  <span className="text-xs text-slate-400">
                    {order.size} KG - {order.cylinderType === 'new' ? t('order.cylinderType.new') : t('order.cylinderType.refill')}
                  </span><br/>
                  <span className="text-xs text-slate-400">Qty: {order.quantity}</span>
                  {order.cylinderType === "new" && (
                    <>
                      <br/>
                      <span className="text-xs text-emerald-600">
                        (+ ৳ 1000 for empty cylinder)
                      </span>
                    </>
                  )}
                </span>
              </div>

              <div className="flex justify-between border-b border-dashed border-slate-200 pb-3">
                <span className="text-slate-500">{t("confirm.method")}</span>
                <span className="font-medium">{paymentMethodLabel}</span>
              </div>

              <div className="flex justify-between border-b border-dashed border-slate-200 pb-3">
                <span className="text-slate-500">{t("order.deliveryFee")}</span>
                <span className="font-medium text-right">৳ {DELIVERY_CHARGE}</span>
              </div>

              {order.trxId && (
                <div className="flex justify-between border-b border-dashed border-slate-200 pb-3">
                  <span className="text-slate-500">{t("confirm.trxId")}</span>
                  <span className="font-mono font-medium">{order.trxId}</span>
                </div>
              )}
            </div>

            <div className="bg-slate-50 p-4 rounded-xl flex items-center justify-between">
              <span className="font-medium text-slate-700">{t("confirm.amount")}</span>
              <span className="text-2xl font-bold text-slate-900">৳ {totalPrice.toLocaleString()}</span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold py-3 rounded-xl transition-colors"
              >
                Done
              </button>
              <button
                className="flex-1 bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Receipt
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
