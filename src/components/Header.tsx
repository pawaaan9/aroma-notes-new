"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import { useCartDrawer } from "@/contexts/CartDrawerContext";
import { fetchAllProducts } from "@/lib/firestore-products";
import { formatLkr } from "@/utils/currency";
import type { Product } from "@/types/product";
import { FaInstagram, FaFacebook, FaTiktok } from "react-icons/fa6";
import { IoLogoWhatsapp } from "react-icons/io5";

interface HeaderProps {
  currentPage?: 'home' | 'products' | 'about';
}

const SOCIAL_LINKS = [
  { href: "https://www.instagram.com/aroma.notes_?igsh=aGRjdW1oYzQ1ZmJh", label: "Instagram", Icon: FaInstagram },
  { href: "https://www.facebook.com/share/16MvUNpNzU/?mibextid=wwXIfr", label: "Facebook", Icon: FaFacebook },
  { href: "https://www.tiktok.com/@aroma_notess?_t=ZS-90o5oCc83gl&_r=1", label: "TikTok", Icon: FaTiktok },
];

const NAV_LINKS = [
  { page: "home", href: "/", label: "Home" },
  { page: "products", href: "/products", label: "Shop" },
  { page: "about", href: "/about", label: "About" },
];

export default function Header({ currentPage }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { count } = useCart();
  const { open: openCart } = useCartDrawer();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isSearchExpanded) {
      fetchAllProducts().then(setProducts).catch(console.error);
      searchInputRef.current?.focus();
    } else {
      setSearchQuery("");
    }
  }, [isSearchExpanded]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return products.slice(0, 6);
    const q = searchQuery.toLowerCase().trim();
    return products.filter(
      (p) =>
        (p.name ?? "").toLowerCase().includes(q) ||
        (p.brand ?? "").toLowerCase().includes(q)
    );
  }, [products, searchQuery]);

  const getPrice = (p: Product) => {
    const prices = (p.variants ?? [])
      .map((v) => v.discountPrice ?? v.price ?? null)
      .filter((pr): pr is number => pr != null);
    return prices.length > 0 ? Math.min(...prices) : null;
  };

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);
  const closeSearch = () => {
    setIsSearchExpanded(false);
    setSearchQuery("");
  };

  const compact = scrolled || isSearchExpanded;

  const navLinkClass = (page: string) =>
    `group relative py-2 text-[11px] font-bold uppercase tracking-[0.24em] transition-colors duration-300 ${
      currentPage === page ? "text-primary" : "text-white/80 hover:text-white"
    }`;

  const cartCount = isMounted ? count : 0;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-[100] w-full border-b border-white/10 bg-[#0a0a0f] transition-shadow duration-500 ${
          compact ? "shadow-[0_8px_24px_rgba(0,0,0,0.35)]" : ""
        }`}
      >
        <div
          className="grid h-16 grid-cols-[1fr_auto_1fr] items-center px-4 sm:px-6 lg:px-[10vw]"
        >
          {/* Left: links (desktop) / menu (mobile) */}
          <div className="flex items-center">
            <button
              className="-ml-2 flex h-10 w-10 items-center justify-center text-white transition-colors hover:text-primary lg:hidden"
              onClick={toggleMobileMenu}
              aria-label="Open menu"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="square" strokeWidth={1.5} d="M3 7h18M3 12h12M3 17h18" />
              </svg>
            </button>
            <nav className="hidden items-center gap-10 lg:flex">
              {NAV_LINKS.map((l) => (
                <Link key={l.label} className={navLinkClass(l.page)} href={l.href}>
                  {l.label}
                  <span
                    className={`absolute inset-x-0 bottom-0 h-0.5 origin-left bg-primary transition-transform duration-300 ease-out ${
                      currentPage === l.page ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                    }`}
                  />
                </Link>
              ))}
            </nav>
          </div>

          {/* Center: logo */}
          {/* Nudged left on phones: the heavy bottle mark makes a true centre read as off to the right */}
          <Link href="/" className="flex items-center max-lg:-translate-x-2" aria-label="Aroma Notes home">
            <Image
              src="/logo-horizontal.png"
              alt="Aroma Notes"
              width={1339}
              height={200}
              className="h-5 w-auto lg:h-6"
              priority
            />
          </Link>

          {/* Right: search + cart */}
          <div className="flex items-center justify-end gap-1 sm:gap-2">
            <button
              onClick={() => setIsSearchExpanded((prev) => !prev)}
              className={`flex h-10 w-10 items-center justify-center transition-colors duration-300 hover:text-primary ${
                isSearchExpanded ? "text-primary" : "text-white"
              }`}
              aria-label="Search products"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="square" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <button
              onClick={openCart}
              className="relative -mr-2 flex h-10 w-10 items-center justify-center text-white transition-colors duration-300 hover:text-primary"
              aria-label="Open cart"
              id="cart-header-bag"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="square" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute right-0 top-0.5 flex h-4 min-w-4 items-center justify-center bg-primary px-1 text-[9px] font-black text-white">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

          {/* Expanded search row */}
          {isSearchExpanded && (
            <div className="border-t border-gray-200 bg-white px-4 py-4">
              <div className="relative mx-auto w-full max-w-2xl">
                <div className="flex items-stretch border border-gray-900">
                  <span className="flex items-center pl-4 text-gray-400">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="square" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </span>
                  <input
                    ref={searchInputRef}
                    type="search"
                    placeholder="Search fragrances or brands"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="min-w-0 flex-1 bg-white px-3 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none"
                  />
                  <button
                    onClick={closeSearch}
                    className="bg-gray-900 px-4 text-[11px] font-bold uppercase tracking-[0.2em] text-white hover:bg-primary"
                    aria-label="Close search"
                  >
                    Close
                  </button>
                </div>
                {(searchResults.length > 0 || searchQuery.trim()) && (
                  <div className="absolute left-0 right-0 top-full z-[110] mt-2 max-h-80 overflow-y-auto border border-gray-200 bg-white shadow-xl">
                    {searchResults.length > 0 ? searchResults.map((p) => {
                      const imageSrc = p.coverImageUrl ?? p.variants?.[0]?.photoUrl ?? "/yusuf-bhai.webp";
                      const href = `/product-view/${p.slug?.current ?? p._id}`;
                      const price = getPrice(p);
                      return (
                        <Link
                          key={p._id}
                          href={href}
                          onClick={closeSearch}
                          className="flex gap-3 border-b border-gray-100 p-3 last:border-0 hover:bg-gray-50"
                        >
                          <div className="h-12 w-12 shrink-0 overflow-hidden border border-gray-200 bg-gray-50">
                            <Image src={imageSrc} alt={p.name} width={48} height={48} className="h-full w-full object-cover" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-gray-900">{p.name}</p>
                            {p.brand && <p className="truncate text-xs text-gray-500">{p.brand}</p>}
                            {price != null && <p className="mt-0.5 text-xs font-bold text-primary">{formatLkr(price)}</p>}
                          </div>
                        </Link>
                      );
                    }) : (
                      <p className="p-4 text-center text-sm text-gray-500">No products match your search.</p>
                    )}
                    <Link
                      href={searchQuery.trim() ? `/products?q=${encodeURIComponent(searchQuery.trim())}` : "/products"}
                      onClick={closeSearch}
                      className="block bg-gray-900 p-3 text-center text-[11px] font-bold uppercase tracking-[0.2em] text-white hover:bg-primary"
                    >
                      View all products
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
      </header>

      {/* Mobile menu drawer */}
      {isMobileMenuOpen && (
        <>
          <div className="fixed inset-0 z-[150] bg-black/60 animate-fade-in" onClick={toggleMobileMenu} aria-hidden />
          <aside
            className="fixed top-0 left-0 bottom-0 z-[151] flex w-[min(86vw,360px)] flex-col bg-white animate-slide-in-left"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
          >
            <div className="flex h-[72px] items-center justify-between bg-[#0a0a0f] px-5">
              <Image src="/logo-horizontal.png" alt="Aroma Notes" width={1339} height={200} className="h-7 w-auto" />
              <button onClick={toggleMobileMenu} className="-mr-2 flex h-10 w-10 items-center justify-center border border-white/20 text-white transition-colors hover:border-primary hover:text-primary" aria-label="Close menu">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="square" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="flex-1 px-5 pt-4">
              {NAV_LINKS.map((l) => {
                const active = currentPage === l.page;
                return (
                  <Link
                    key={l.label}
                    href={l.href}
                    onClick={toggleMobileMenu}
                    className={`group flex items-center justify-between border-b border-gray-100 py-5 transition-colors ${
                      active ? "text-primary" : "text-gray-900 hover:text-primary"
                    }`}
                  >
                    <span className="flex items-center gap-3 text-xl font-black uppercase tracking-[0.08em]">
                      <span className={`h-2 w-2 ${active ? "bg-primary" : "bg-gray-200 group-hover:bg-primary"}`} />
                      {l.label}
                    </span>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="square" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                );
              })}
            </nav>
            <div className="border-t border-gray-200 bg-gray-50 p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Need help choosing?</p>
              <a
                href="https://wa.me/94721922332"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex items-center justify-center gap-2 bg-primary px-5 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-white"
              >
                <IoLogoWhatsapp size={16} />
                Chat on WhatsApp
              </a>
              <div className="mt-4 flex">
                {SOCIAL_LINKS.map(({ href, label, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="-ml-px flex h-10 flex-1 items-center justify-center border border-gray-200 bg-white text-gray-700 first:ml-0 hover:text-primary"
                  >
                    <Icon size={16} />
                  </a>
                ))}
              </div>
            </div>
          </aside>
        </>
      )}
    </>
  );
}
