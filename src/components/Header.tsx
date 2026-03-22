"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import { useCartDrawer } from "@/contexts/CartDrawerContext";
import { fetchAllProducts } from "@/lib/firestore-products";
import { formatLkr } from "@/utils/currency";
import type { Product } from "@/types/product";

interface HeaderProps {
  currentPage?: 'home' | 'products' | 'about';
  dark?: boolean;
}

export default function Header({ currentPage = 'home', dark = false }: HeaderProps) {
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
    window.addEventListener("scroll", onScroll);
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);

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
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const headerBg = dark
    ? (scrolled ? 'bg-white/98 shadow-lg' : 'bg-white/95 shadow-sm')
    : scrolled ? 'bg-black/90 shadow-md' : 'bg-black/30';

  const linkClass = (page: string) =>
    `block text-xl font-medium font-saira uppercase tracking-wider py-4 border-b border-gray-200 last:border-0 ${currentPage === page ? 'text-primary' : 'text-gray-800'} hover:text-primary transition-colors`;

  const navLinkClass = (page: string) =>
    `text-sm font-medium font-saira uppercase tracking-[0.2em] ${dark ? 'text-gray-900' : 'text-white'} hover:text-primary transition-colors ${currentPage === page ? 'text-primary' : ''}`;
  const iconClass = dark ? 'text-gray-900' : 'text-white';

  const closeSearch = () => {
    setIsSearchExpanded(false);
    setSearchQuery("");
  };

  if (!isMounted) {
    return (
      <header className={`fixed top-0 left-0 right-0 z-[100] w-full backdrop-blur-md transition-all duration-300 ${headerBg}`}>
        <div className="flex items-center justify-between px-4 py-2 sm:px-6 lg:px-[5vw] relative z-10 h-14">
          <div className="flex items-center shrink-0 md:min-w-0">
            <Link className="hidden md:flex items-center gap-2 group" href="/">
              <Image src="/logo-2.png" alt="Aroma Notes Logo" width={40} height={40} className="h-10 w-10" priority />
              <h1 className={`text-xl font-bold font-audiowide tracking-wide ${dark ? 'text-gray-900' : 'text-white'}`}>Aroma Notes</h1>
            </Link>
            <button className="md:hidden flex h-10 w-10 items-center justify-center rounded-lg" aria-label="Open menu">
              <svg className={`w-6 h-6 ${iconClass}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
          <nav className="hidden md:flex flex-1 justify-center items-center gap-8 lg:gap-12">
            <Link className={navLinkClass("home")} href="/">Home</Link>
            <Link className={navLinkClass("products")} href="/products">Products</Link>
            <Link className={navLinkClass("about")} href="/about">About</Link>
          </nav>
          <Link className="md:hidden absolute left-[calc(50%-20px)] top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2" href="/">
            <Image src="/logo-2.png" alt="Aroma Notes Logo" width={36} height={36} className="h-9 w-9" priority />
            <h1 className={`text-lg font-bold font-audiowide tracking-wide ${dark ? 'text-gray-900' : 'text-white'}`}>Aroma Notes</h1>
          </Link>
          <div className="flex items-center gap-2 shrink-0">
            <button className={`p-2 rounded-lg ${iconClass}`} aria-label="Search products">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <button className={`relative p-2 rounded-lg ${iconClass}`} aria-label="Open cart" id="cart-header-bag">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </button>
          </div>
        </div>
      </header>
    );
  }

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-[100] w-full backdrop-blur-md transition-all duration-300 ${headerBg}`}>
        <div className="flex flex-col">
          {/* Main nav row */}
          <div className="flex items-center justify-between px-4 py-2 sm:px-6 lg:px-[5vw] relative z-10 h-14">
            <div className="flex items-center shrink-0 md:min-w-0">
              <Link className="hidden md:flex items-center gap-2 group" href="/">
                <Image src="/logo-2.png" alt="Aroma Notes Logo" width={40} height={40} className="h-10 w-10" priority />
                <h1 className={`text-xl font-bold font-audiowide tracking-wide ${dark ? 'text-gray-900' : 'text-white'}`}>Aroma Notes</h1>
              </Link>
              <button
                className={`md:hidden flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${dark ? 'hover:bg-gray-200/50' : 'hover:bg-white/10'}`}
                onClick={toggleMobileMenu}
                aria-label="Open menu"
              >
                <svg className={`w-6 h-6 ${iconClass}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>

            {/* Center: Nav links */}
            <nav className="hidden md:flex flex-1 justify-center items-center gap-8 lg:gap-12">
              <Link className={navLinkClass("home")} href="/">Home</Link>
              <Link className={navLinkClass("products")} href="/products">Products</Link>
              <Link className={navLinkClass("about")} href="/about">About</Link>
            </nav>

            <Link className="md:hidden absolute left-[calc(50%-20px)] top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2" href="/">
              <Image src="/logo-2.png" alt="Aroma Notes Logo" width={36} height={36} className="h-9 w-9" priority />
              <h1 className={`text-lg font-bold font-audiowide tracking-wide ${dark ? 'text-gray-900' : 'text-white'}`}>Aroma Notes</h1>
            </Link>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setIsSearchExpanded((prev) => !prev)}
                className={`p-2 rounded-lg transition-colors hover:opacity-80 ${iconClass} ${isSearchExpanded ? 'opacity-100' : ''}`}
                aria-label="Search products"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              <button onClick={openCart} className={`relative p-2 rounded-lg transition-colors hover:opacity-80 ${iconClass}`} aria-label="Open cart" id="cart-header-bag">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {count > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-white text-black text-[10px] font-bold flex items-center justify-center">
                    {count > 99 ? "99+" : count}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Expanded search row - type area + results dropdown */}
          {isSearchExpanded && (
            <div className="border-t border-white/10 md:border-gray-200/50 px-4 py-3">
              <div className="relative w-full max-w-2xl mx-auto">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    ref={searchInputRef}
                    type="search"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 py-2.5 bg-white/95 rounded-lg border border-gray-200 text-gray-900 placeholder-gray-400 px-4 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none font-saira"
                  />
                  <button
                    onClick={closeSearch}
                    className="p-2 text-gray-500 hover:text-gray-800 rounded"
                    aria-label="Close search"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                {/* Results dropdown */}
                {(searchResults.length > 0 || searchQuery.trim()) && (
                  <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-lg shadow-xl border border-gray-200 max-h-80 overflow-y-auto z-[110]">
                    {searchResults.length > 0 ? searchResults.map((p) => {
                      const imageSrc = p.coverImageUrl ?? p.variants?.[0]?.photoUrl ?? "/yusuf-bhai.webp";
                      const href = `/product-view/${p.slug?.current ?? p._id}`;
                      const price = getPrice(p);
                      return (
                        <Link
                          key={p._id}
                          href={href}
                          onClick={closeSearch}
                          className="flex gap-3 p-3 hover:bg-gray-50 border-b border-gray-100 last:border-0"
                        >
                          <div className="h-12 w-12 rounded overflow-hidden bg-gray-100 shrink-0">
                            <Image src={imageSrc} alt={p.name} width={48} height={48} className="h-full w-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate text-sm">{p.name}</p>
                            {p.brand && <p className="text-xs text-gray-500 truncate">{p.brand}</p>}
                            {price != null && <p className="text-xs font-medium text-primary mt-0.5">{formatLkr(price)}</p>}
                          </div>
                        </Link>
                      );
                    }) : (
                      <p className="p-4 text-center text-gray-500 text-sm font-saira">No products match your search.</p>
                    )}
                    <Link
                      href={searchQuery.trim() ? `/products?q=${encodeURIComponent(searchQuery.trim())}` : "/products"}
                      onClick={closeSearch}
                      className="block p-3 text-center text-sm font-medium text-primary hover:bg-gray-50"
                    >
                      View all products
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Mobile menu drawer */}
      {isMobileMenuOpen && (
        <>
          <div className="fixed inset-0 z-[150] bg-black/25 backdrop-blur-md" onClick={toggleMobileMenu} aria-hidden />
          <aside
            className="fixed top-0 left-0 bottom-0 z-[151] w-[min(85vw,380px)] bg-white shadow-2xl flex flex-col rounded-tr-2xl rounded-r-xl animate-slide-in-left"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
          >
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold font-saira uppercase text-gray-900">Menu</h2>
              <button onClick={toggleMobileMenu} className="p-2 -m-2 text-gray-500 hover:text-gray-800 rounded-lg" aria-label="Close menu">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="flex-1 px-4 py-6">
              <Link href="/" className={linkClass("home")} onClick={toggleMobileMenu}>Home</Link>
              <Link href="/products" className={linkClass("products")} onClick={toggleMobileMenu}>Products</Link>
              <Link href="/about" className={linkClass("about")} onClick={toggleMobileMenu}>About</Link>
            </nav>
          </aside>
        </>
      )}
    </>
  );
}
