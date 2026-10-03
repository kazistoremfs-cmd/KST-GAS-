sed -i -e '/<span className="font-medium text-right">/,/<\/span>/c\
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
                        (+ ৳ 1000 for new cylinder)\
                      </span>\
                    </>\
                  )}\
                </span>' src/components/ConfirmationModal.tsx
