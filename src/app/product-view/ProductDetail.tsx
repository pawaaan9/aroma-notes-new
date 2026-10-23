"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Product as SanityProduct } from "@/types/product";
import VariantSelector from "./VariantSelector";
import MainAccordsChart from "./MainAccordsChart";
import { useCart } from "@/contexts/CartContext";
import { useCartDrawer } from "@/contexts/CartDrawerContext";
import { trackAddToCart } from "@/lib/meta-pixel-events";
import { formatLkr } from "@/utils/currency";
import payzyLogo from "@/assets/payzy-wide.png";

const BLUR_DATA_URL =
  "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 5'%3E%3Crect fill='%23e5e7eb' width='4' height='5'/%3E%3C/svg%3E";

const WHATSAPP_NUMBER = "94721922332";

const PROMISES = [
  { title: "100% Authentic", text: "Direct from Yusuf Bhai" },
  { title: "Pay in 4", text: "Interest free with Payzy" },
  { title: "Expert Help", text: "Advice on WhatsApp" },
];

type Props = {
  product: SanityProduct;
};

const CartIcon = () => (
  <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="square" strokeWidth={1.75} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
  </svg>
);

export default function ProductDetail({ product }: Props) {
  const variants = useMemo(() => product.variants ?? [], [product]);
  // Start on the first size that can be bought, so the price shows straight away.
  const [selectedIdx, setSelectedIdx] = useState<number>(() => {
    const firstInStock = (product.variants ?? []).findIndex((v) => v.inStock !== false);
    return firstInStock;
  });
  const [isAdding, setIsAdding] = useState(false);
  const [tab, setTab] = useState<"description" | "accords">(product.descriptionText ? "description" : "accords");
  const [showStickyBar, setShowStickyBar] = useState(false);
  const buyButtonRef = useRef<HTMLButtonElement | null>(null);
  const { addItem } = useCart();
  const { open: openCartDrawer } = useCartDrawer();

  const [sizeError, setSizeError] = useState(false);
  const selected = selectedIdx >= 0 ? (variants[selectedIdx] ?? null) : null;
  const imageSrc = selected?.photoUrl || product.coverImageUrl || "/yusuf-bhai.webp";
  const allOut = useMemo(() => (variants.length > 0 && variants.every(v => v.inStock === false)), [variants]);
  const needsSize = variants.length > 0 && selectedIdx < 0;

  const price = selected ? (selected.discountPrice ?? selected.price ?? null) : null;
  const hasDiscount =
    !!selected && typeof selected.discountPrice === "number" && typeof selected.price === "number" && selected.discountPrice < selected.price;
  const savePercent = hasDiscount ? Math.round(((selected!.price! - selected!.discountPrice!) / selected!.price!) * 100) : 0;
  const unavailable = allOut || selected?.inStock === false;
  const hasAccords = !!product.mainAccords?.some((a) => typeof a?.percentage === "number" && (a?.name ?? "").trim());

  const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    `Hi Aroma Notes, I have a question about ${product.name}${selected?.size ? ` (${selected.size})` : ""}.`
  )}`;

  // Mobile: keep a buy bar at the bottom whenever the main button is off screen.
  useEffect(() => {
    const el = buyButtonRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setShowStickyBar(!entry.isIntersecting));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleAddToCart = () => {
    if (allOut) return;
    // Require size selection
    if (needsSize) {
      setSizeError(true);
      setTimeout(() => setSizeError(false), 3000);
      return;
    }
    // If selected variant is out of stock, don't add
    if (selected?.inStock === false) return;
    setSizeError(false);
    setIsAdding(true);
    try {
      const originalPrice = selected ? (selected.price ?? null) : null;
      const itemId = selected?.size ? `${product._id}:${selected.size}` : product._id;
      addItem({ id: itemId, name: product.name, imageUrl: imageSrc, brand: product.brand ?? null, size: selected?.size ?? null, price, originalPrice }, 1);
      trackAddToCart({
        id: itemId,
        name: product.name,
        price,
        quantity: 1,
      });
    } catch {}
    // fly-to-cart animation
    const srcEl = document.getElementById("product-image");
    const cartFab = document.getElementById("cart-header-bag");
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
        openCartDrawer();
      }, 750);
    } else {
      setTimeout(() => {
        setIsAdding(false);
        openCartDrawer();
      }, 500);
    }
  };

  const buttonLabel = allOut ? "Out of stock" : selected?.inStock === false ? "Size sold out" : isAdding ? "Adding…" : "Add to Cart";

  return (
    <>
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-primary">Home</Link>
        <span className="h-px w-3 bg-gray-300" />
        <Link href="/products" className="hover:text-primary">Shop</Link>
        <span className="h-px w-3 bg-gray-300" />
        <span className="truncate text-gray-900">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-14">
        {/* Image: stays in view on desktop while the details scroll */}
        <div className="md:sticky md:top-24 md:self-start">
          <div className="relative aspect-square w-full overflow-hidden border border-gray-200 bg-[#ececec] md:aspect-[4/5]" id="product-image">
            {hasDiscount && (
              <span className="absolute left-0 top-0 z-10 bg-primary px-3 py-1.5 text-[11px] font-black uppercase tracking-wider text-white">
                Save {savePercent}%
              </span>
            )}
            <Image
              alt={product.name}
              src={imageSrc}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              quality={75}
              placeholder="blur"
              blurDataURL={BLUR_DATA_URL}
              priority
              fetchPriority="high"
            />
          </div>
        </div>

        {/* Buy box */}
        <div>
          {product.brand ? (
            <p className="eyebrow text-primary">
              {product.perfumeType === "inspired" ? `Inspired by ${product.brand}` : product.brand}
            </p>
          ) : null}
          <h1 className="mt-2 text-3xl font-black leading-tight tracking-tight text-gray-900 sm:text-4xl">{product.name}</h1>

          {/* Price */}
          <div className="mt-5 flex flex-wrap items-center gap-3">
            {price != null && <span className="text-3xl font-black text-gray-900">{formatLkr(price)}</span>}
            {hasDiscount && <span className="text-base text-gray-400 line-through">{formatLkr(selected!.price!)}</span>}
            {hasDiscount && (
              <span className="bg-primary/10 px-2 py-1 text-[11px] font-black uppercase tracking-wider text-primary">
                Save {formatLkr(selected!.price! - selected!.discountPrice!)}
              </span>
            )}
          </div>
          <p className={`mt-2 flex items-center gap-2 text-sm font-semibold ${unavailable ? "text-red-600" : "text-green-700"}`}>
            <span className={`h-2 w-2 ${unavailable ? "bg-red-600" : "bg-green-600"}`} />
            {unavailable ? "Out of stock" : "In stock, ready to ship"}
          </p>
          {selected?.price != null && (
            <p className="mt-3 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-gray-600">
              Or 4 &times; <span className="font-bold text-gray-900">{formatLkr(selected.price / 4)}</span> interest free with
              <Image src={payzyLogo} alt="Payzy" className="h-4 w-auto" />
            </p>
          )}

          {/* Sizes */}
          {variants.length ? (
            <div className="mt-7 border-t border-gray-200 pt-6">
              <div className="mb-3 flex items-baseline justify-between">
                <h2 className="text-xs font-extrabold uppercase tracking-[0.18em] text-gray-900">Size</h2>
                {selected?.size && <span className="text-xs text-gray-500">Selected: {selected.size}</span>}
              </div>
              <VariantSelector
                variants={variants}
                value={selectedIdx}
                onChange={(i) => {
                  setSelectedIdx(i);
                  setSizeError(false);
                }}
              />
            </div>
          ) : null}

          {/* Actions */}
          <div className="mt-6">
            {sizeError && (
              <p className="mb-3 border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">Please select a size first.</p>
            )}
            <button
              ref={buyButtonRef}
              disabled={unavailable}
              onClick={handleAddToCart}
              aria-busy={isAdding}
              className="flex w-full items-center justify-center gap-3 bg-primary px-6 py-4 text-sm font-bold uppercase tracking-[0.18em] text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              <CartIcon />
              <span>{buttonLabel}</span>
            </button>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 flex w-full items-center justify-center gap-2 border border-gray-900 px-6 py-3.5 text-xs font-bold uppercase tracking-[0.18em] text-gray-900 transition-colors hover:bg-gray-900 hover:text-white"
            >
              Ask about this scent on WhatsApp
            </a>
          </div>

          {/* Promises */}
          <div className="mt-6 grid grid-cols-3 border border-gray-200">
            {PROMISES.map((p, i) => (
              <div key={p.title} className={`px-3 py-3.5 text-center ${i > 0 ? "border-l border-gray-200" : ""}`}>
                <p className="text-[10px] font-black uppercase tracking-[0.12em] text-gray-900 sm:text-[11px]">{p.title}</p>
                <p className="mt-1 text-[10px] leading-snug text-gray-500 sm:text-[11px]">{p.text}</p>
              </div>
            ))}
          </div>

          {/* Details tabs */}
          {(product.descriptionText || hasAccords) && (
            <div className="mt-10">
              <div className="flex border-b border-gray-200" role="tablist">
                {product.descriptionText && (
                  <button
                    role="tab"
                    aria-selected={tab === "description"}
                    onClick={() => setTab("description")}
                    className={`-mb-px border-b-2 px-1 pb-3 mr-8 text-xs font-extrabold uppercase tracking-[0.18em] transition-colors ${
                      tab === "description" ? "border-primary text-gray-900" : "border-transparent text-gray-400 hover:text-gray-900"
                    }`}
                  >
                    Description
                  </button>
                )}
                {hasAccords && (
                  <button
                    role="tab"
                    aria-selected={tab === "accords"}
                    onClick={() => setTab("accords")}
                    className={`-mb-px border-b-2 px-1 pb-3 text-xs font-extrabold uppercase tracking-[0.18em] transition-colors ${
                      tab === "accords" ? "border-primary text-gray-900" : "border-transparent text-gray-400 hover:text-gray-900"
                    }`}
                  >
                    Main Accords
                  </button>
                )}
              </div>
              <div className="pt-6" role="tabpanel">
                {tab === "description" && product.descriptionText ? (
                  <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-gray-600">{product.descriptionText}</p>
                ) : null}
                {tab === "accords" && hasAccords ? <MainAccordsChart accords={product.mainAccords!} /> : null}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile buy bar */}
      <div
        className={`fixed inset-x-0 bottom-0 z-[90] border-t border-gray-200 bg-white px-4 py-3 transition-transform duration-300 md:hidden ${
          showStickyBar ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-gray-500">
              {product.name}
              {selected?.size ? ` · ${selected.size}` : ""}
            </p>
            {price != null && <p className="text-lg font-black leading-tight text-gray-900">{formatLkr(price)}</p>}
          </div>
          <button
            disabled={unavailable}
            onClick={handleAddToCart}
            className="flex shrink-0 items-center gap-2 bg-primary px-5 py-3.5 text-xs font-bold uppercase tracking-[0.16em] text-white disabled:bg-gray-300"
          >
            <CartIcon />
            {unavailable ? "Sold out" : "Add to Cart"}
          </button>
        </div>
      </div>
    </>
  );
}
