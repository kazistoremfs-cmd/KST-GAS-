sed -i -e '/<div className="flex justify-between items-start gap-3 text-slate-600">/,/<\/div>/c\
                    <div className="flex justify-between items-start gap-3 text-slate-600">\
                      <div className="flex items-start gap-2.5">\
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0"></span>\
                        <span className="leading-snug">\
                          <span className="text-slate-800">{brand.name} {size}KG</span>\
                          <span className="text-slate-400 ml-1.5 whitespace-nowrap">x {quantity}</span>\
                        </span>\
                      </div>\
                      <span className="font-bold text-slate-900 whitespace-nowrap mt-0.5">৳ {((brand?.currentPrice || PRICING[size].price) * quantity).toLocaleString()}</span>\
                    </div>\
                    {cylinderType === "new" && (\
                      <div className="flex justify-between items-start gap-3 text-slate-600">\
                        <div className="flex items-start gap-2.5">\
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0"></span>\
                          <span className="leading-snug">\
                            <span className="text-slate-800">{t("order.summary.newCylinder")}</span>\
                            <span className="text-slate-400 ml-1.5 whitespace-nowrap">x {quantity}</span>\
                          </span>\
                        </div>\
                        <span className="font-bold text-slate-900 whitespace-nowrap mt-0.5">৳ {(1000 * quantity).toLocaleString()}</span>\
                      </div>\
                    )}' src/components/OrderModal.tsx
