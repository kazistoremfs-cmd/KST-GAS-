sed -i '75,103d' src/components/ConfirmationModal.tsx
sed -i '74a\
                <span className="font-medium text-right">{order.customerName}<br/><span className="text-xs text-slate-400">{order.phone}</span></span>\
              </div>\
              <div className="flex justify-between border-b border-dashed border-slate-200 pb-3">\
                <span className="text-slate-500">Product</span>\
                <span className="font-medium text-right">\
                  {order.brand?.name}<br/>\
                  <span className="text-xs text-slate-400">\
                    {order.size} KG - {order.cylinderType === "new" ? t("order.cylinderType.new") : t("order.cylinderType.refill")}\
                  </span><br/>\
                  <span className="text-xs text-slate-400">Qty: {order.quantity}</span>\
                  {order.cylinderType === "new" && (\
                    <>\
                      <br/>\
                      <span className="text-xs text-emerald-600">\
                        (+ ৳ 1000 for empty cylinder)\
                      </span>\
                    </>\
                  )}\
                </span>\
              </div>\
              <div className="flex justify-between border-b border-dashed border-slate-200 pb-3">\
                <span className="text-slate-500">{t("confirm.method")}</span>\
                <span className="font-medium">{paymentMethodLabel}</span>\
              </div>\
              <div className="flex justify-between border-b border-dashed border-slate-200 pb-3">\
                <span className="text-slate-500">{t("order.deliveryFee")}</span>\
                <span className="font-medium text-right">৳ {DELIVERY_CHARGE}</span>\
              </div>' src/components/ConfirmationModal.tsx
