"use client";
import Image from "next/image";
import { useMemo, useState } from "react";
import type { SanityProduct } from "@/lib/sanity";
import VariantSelector from "./VariantSelector";
import MainAccordsChart from "./MainAccordsChart";
import { useCart } from "@/contexts/CartContext";

type Props = {
  product: SanityProduct;
};

export default function ProductDetail({ product }: Props) {
  const variants = useMemo(() => product.variants ?? [], [product]);
  const [selectedIdx, setSelectedIdx] = useState<number>(-1);
  const [isAdding, setIsAdding] = useState(false);
  const { addItem } = useCart();

  const selected = selectedIdx >= 0 ? (variants[selectedIdx] ?? null) : null;
  const imageSrc = selected?.photoUrl || product.coverImageUrl || "/yusuf-bhai.webp";
  const allOut = useMemo(() => (variants.length > 0 && variants.every(v => v.inStock === false)), [variants]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
      <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-gray-100 border border-gray-200" id="product-image">
        <Image
          alt={product.name}
          src={imageSrc}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
        />
      </div>
      <div className="font-saira">
        <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
        {product.brand ? (
          <p className="text-sm text-gray-600 mt-1">{product.brand}</p>
        ) : null}

        {variants.length ? (
          <div className="mt-8">
            <h2 className="text-gray-900 font-semibold mb-3">Available</h2>
            <VariantSelector variants={variants} value={selectedIdx} onChange={setSelectedIdx} />
          </div>
        ) : null}

        {product.descriptionText ? (
          <div className="mt-10">
            <h3 className="text-gray-900 font-semibold mb-3 font-saira">Description</h3>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap font-saira">
              {product.descriptionText}
            </p>
          </div>
        ) : null}

        {product.mainAccords?.length ? (
          <div className="mt-10">
            <h3 className="text-gray-900 font-semibold mb-3 font-saira">Main Accords</h3>
            <MainAccordsChart accords={product.mainAccords} />
          </div>
        ) : null}

        <div className="mt-10">
          <button
            disabled={allOut}
            onClick={() => {
              if (allOut) return;
              setIsAdding(true);
              try {
                // pick selected variant metadata for cart
                const v = selectedIdx >= 0 ? variants[selectedIdx] ?? null : null;
                const price = v ? (v.discountPrice ?? v.price ?? null) : null;
                const itemId = v?.size ? `${product._id}:${v.size}` : product._id;
                addItem({ id: itemId, name: product.name, imageUrl: imageSrc, brand: product.brand ?? null, size: v?.size ?? null, price }, 1);
              } catch {}
              // fly-to-cart animation
              const srcEl = document.getElementById("product-image");
              const cartFab = document.getElementById("cart-fab");
              if (srcEl && cartFab) {
                const srcRect = srcEl.getBoundingClientRect();
                const dstRect = cartFab.getBoundingClientRect();
                const clone = srcEl.cloneNode(true) as HTMLElement;
                clone.id = "";
                clone.style.position = "fixed";
                clone.style.left = `${srcRect.left}px`;
                clone.style.top = `${srcRect.top}px`;
                clone.style.width = `${srcRect.width}px`;
                clone.style.height = `${srcRect.height}px`;
                clone.style.zIndex = "9999";
                clone.style.pointerEvents = "none";
                clone.style.borderRadius = "16px";
                clone.style.overflow = "hidden";
                clone.style.transition = "transform 700ms cubic-bezier(0.22, 1, 0.36, 1), opacity 700ms";
                document.body.appendChild(clone);
                const dx = dstRect.left + dstRect.width / 2 - (srcRect.left + srcRect.width / 2);
                const dy = dstRect.top + dstRect.height / 2 - (srcRect.top + srcRect.height / 2);
                requestAnimationFrame(() => {
                  clone.style.transform = `translate(${dx}px, ${dy}px) scale(0.15)`;
                  clone.style.opacity = "0.2";
                });
                setTimeout(() => {
                  clone.remove();
                  setIsAdding(false);
                }, 750);
              } else {
                setTimeout(() => setIsAdding(false), 500);
              }
            }}
            aria-busy={isAdding}
            className={`group inline-flex items-center gap-2 rounded-xl px-6 py-3 font-saira font-semibold text-white transition-all duration-200 bg-primary hover:bg-primary/90 border border-primary/30 hover:border-primary/50 shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary ${isAdding ? 'scale-95' : 'hover:scale-105'}`}
          >
            {/* Cart icon */}
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={`${isAdding ? 'animate-bounce' : ''}`}
            >
              <path d="M3 3h2l3.6 7.59a2 2 0 0 0 1.8 1.1H17.55a2 2 0 0 0 1.8-1.1l3.1-6.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="10" cy="20" r="1.5" fill="currentColor"/>
              <circle cx="17" cy="20" r="1.5" fill="currentColor"/>
            </svg>
            <span className="font-saira">{allOut ? 'Out of stock' : (isAdding ? 'Adding…' : 'Add to Cart')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}


