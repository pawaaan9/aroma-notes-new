"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import WhatsAppLogo from "@/assets/whatsapp.png";

export default function WhatsAppChat() {
  const pathname = usePathname();
  const [isWhatsOpen, setIsWhatsOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { count, items, removeItem, clear } = useCart();

  if (pathname.startsWith("/an-admin")) return null;
  const whatsappNumber = "94721922332"; // Sri Lanka number
  const whatsappLink = `https://wa.me/${whatsappNumber}`;
  const toggleWhats = () => {
    setIsWhatsOpen((prev) => {
      const next = !prev;
      if (next) setIsCartOpen(false);
      return next;
    });
  };
  const toggleCart = () => {
    setIsCartOpen((prev) => {
      const next = !prev;
      if (next) setIsWhatsOpen(false);
      return next;
    });
  };

  return (
    <>
      {/* Floating action widgets */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
        {/* Cart wrapper */}
        <div className="relative">
          {isCartOpen && (
            <div className="absolute bottom-16 right-0 w-80 bg-white rounded-lg shadow-2xl overflow-hidden animate-fade-in-up">
              {/* Header */}
              <div className="bg-gradient-to-r from-amber-500 to-rose-500 text-white p-4 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-lg">Your Cart</h3>
                  <p className="text-xs text-white/80 font-saira">Review items and checkout</p>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="text-white hover:bg-white/20 rounded p-1 transition-colors"
                  aria-label="Close cart"
                >
                  ✕
                </button>
              </div>

              {/* Cart content */}
              <div className="p-4 bg-gray-50 min-h-[160px] flex flex-col justify-between">
                <div className="space-y-3 max-h-64 overflow-auto pr-1 no-scrollbar">
                  {items.length === 0 ? (
                    <div className="text-gray-700 text-sm font-saira">Your cart is empty.</div>
                  ) : (
                    items.map((it) => (
                      <div key={it.id} className="flex items-center gap-3 bg-white rounded-md p-2 border border-gray-200">
                        <div className="h-10 w-10 rounded-md overflow-hidden bg-gray-100 border border-gray-200">
                          {it.imageUrl ? (
                            <Image src={it.imageUrl} alt={it.name} width={40} height={40} className="h-full w-full object-cover" />
                          ) : null}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-gray-900 line-clamp-1">{it.name}</div>
                          <div className="text-xs text-gray-500 line-clamp-1">{it.brand ?? ''} {it.size ? `• ${it.size}` : ''}</div>
                          {typeof it.price === 'number' ? (
                            <div className="text-xs font-medium text-gray-700 mt-0.5">LKR {new Intl.NumberFormat('en-LK').format(it.price)}</div>
                          ) : null}
                        </div>
                        <button
                          className="text-gray-400 hover:text-rose-600 transition-colors p-1"
                          aria-label="Remove item"
                          onClick={() => removeItem(it.id)}
                        >
                          ✕
                        </button>
                      </div>
                    ))
                  )}
                </div>
                {items.length === 0 ? (
                  <a
                    href="/products"
                    className="mt-4 w-full bg-gradient-to-r from-amber-500 to-rose-500 text-white rounded-lg py-3 px-4 font-semibold hover:shadow-lg transition-all duration-300 text-center font-saira uppercase block"
                  >
                    Browse Products
                  </a>
                ) : (
                  <div className="mt-4 space-y-2">
                    <a
                      href="/checkout"
                      className="w-full bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white rounded-lg py-3 px-4 font-semibold transition-all duration-200 text-center font-saira uppercase block"
                    >
                      Checkout
                    </a>
                    <div className="grid grid-cols-2 gap-2">
                      <a
                        href="/cart"
                        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg py-2.5 px-4 font-semibold transition-all duration-200 text-center font-saira text-sm border border-gray-300 block"
                      >
                        View Cart
                      </a>
                      <button
                        onClick={() => clear()}
                        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg py-2.5 px-4 font-semibold transition-all duration-200 text-center font-saira text-sm border border-gray-300"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          {/* Cart button */}
          <button
            onClick={toggleCart}
            className="relative bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white rounded-full p-2.5 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center w-14 h-14"
            title="Open cart"
            aria-expanded={isCartOpen}
            aria-controls="cart-panel"
            id="cart-fab"
          >
            <ShoppingCart size={28} strokeWidth={2.2} />
            {count > 0 ? (
              <span className="absolute -top-1 -right-1 h-5 min-w-5 px-1 rounded-full bg-white text-amber-600 text-xs font-bold flex items-center justify-center shadow">
                {count}
              </span>
            ) : null}
          </button>
        </div>

        {/* WhatsApp wrapper */}
        <div className="relative">
          {isWhatsOpen && (
            <div className="absolute bottom-16 right-0 w-80 bg-white rounded-lg shadow-2xl overflow-hidden animate-fade-in-up">
              {/* Header */}
              <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-lg">Aroma Notes</h3>
                  <p className="text-xs text-green-100 font-saira">Typically replies within minutes</p>
                </div>
                <button
                  onClick={() => setIsWhatsOpen(false)}
                  className="text-white hover:bg-green-700 rounded p-1 transition-colors"
                  aria-label="Close chat"
                >
                  ✕
                </button>
              </div>

              {/* Message Area - WhatsApp Background */}
              <div className="p-4 bg-gray-50 min-h-[200px] flex flex-col justify-between" style={{
                backgroundColor: '#ece5dd'
              }}>
                <div className="space-y-3">
                  <div className="flex justify-start">
                    <div className="bg-white rounded-lg p-3 max-w-xs text-sm shadow-sm">
                      <p className="text-gray-900 font-medium font-saira">👋 Hi, feel free to contact us if you have any questions!</p>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 w-full bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg py-3 px-4 font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 text-center font-saira uppercase"
                >
                  <Image
                    src={WhatsAppLogo}
                    alt="WhatsApp"
                    width={20}
                    height={20}
                  />
                  Start Chat with us
                </a>
              </div>
            </div>
          )}
          {/* WhatsApp button */}
          <button
            onClick={toggleWhats}
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-full p-2.5 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center w-14 h-14"
            title="Chat with us on WhatsApp"
            aria-expanded={isWhatsOpen}
            aria-controls="whatsapp-panel"
          >
            <Image
              src={WhatsAppLogo}
              alt="WhatsApp"
              width={32}
              height={32}
            />
          </button>
        </div>
      </div>
    </>
  );
}
