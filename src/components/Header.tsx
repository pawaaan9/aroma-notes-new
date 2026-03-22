"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import { useCartDrawer } from "@/contexts/CartDrawerContext";

interface HeaderProps {
  currentPage?: 'home' | 'products' | 'about';
  dark?: boolean; // when true, use dark text (black) for header words
}

export default function Header({ currentPage = 'home', dark = false }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
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

  const headerBg = dark
    ? (scrolled ? 'bg-white/98 shadow-lg' : 'bg-white/95 shadow-sm')
    : scrolled ? 'bg-black/90 shadow-md' : 'bg-black/30';

  // Prevent hydration mismatch by not rendering until mounted
  if (!isMounted) {
    return (
      <header className={`fixed top-0 left-0 right-0 z-[100] w-full backdrop-blur-md transition-all duration-300 ${headerBg}`}>
         <div className="container mx-auto flex items-center justify-between px-4 py-2 sm:px-6 lg:px-[5vw] relative z-10 gap-4">
          {/* Left: Logo */}
          <Link className="flex shrink-0 items-center gap-2 sm:gap-3 group" href="/">
            <Image src="/logo-2.png" alt="Aroma Notes Logo" width={40} height={40} className="h-9 w-9 sm:h-12 sm:w-12" priority />
            <h1 className={`text-lg sm:text-xl font-bold font-audiowide tracking-wide ${dark ? 'text-gray-900' : 'text-white'} transition-all duration-300 group-hover:text-primary`}>
              Aroma Notes
            </h1>
          </Link>

          {/* Center: Desktop Nav */}
          <nav className="hidden flex-1 justify-center items-center gap-6 lg:gap-8 md:flex">
            <Link className={`text-xs sm:text-sm font-medium font-saira uppercase tracking-wider ${dark ? 'text-gray-900' : 'text-white'} hover:text-primary transition-all duration-300 relative group px-2 py-2`} href="/">
              <span className="relative z-10">Home</span>
              <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-orange-600 transform transition-transform duration-300 origin-center ${currentPage === 'home' ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></div>
            </Link>
            <Link className={`text-xs sm:text-sm font-medium font-saira uppercase tracking-wider ${dark ? 'text-gray-900' : 'text-white'} hover:text-primary transition-all duration-300 relative group px-2 py-2`} href="/products">
              <span className="relative z-10">Products</span>
              <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-orange-600 transform transition-transform duration-300 origin-center ${currentPage === 'products' ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></div>
            </Link>
            <Link className={`text-xs sm:text-sm font-medium font-saira uppercase tracking-wider ${dark ? 'text-gray-900' : 'text-white'} hover:text-primary transition-all duration-300 relative group px-2 py-2`} href="/about">
              <span className="relative z-10">About</span>
              <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-orange-600 transform transition-transform duration-300 origin-center ${currentPage === 'about' ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></div>
            </Link>
          </nav>

          {/* Right: Search + Bag + Mobile Menu */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <Link href="/products" className={`p-2 rounded-lg transition-colors hover:opacity-80 ${dark ? 'text-gray-900' : 'text-white'}`} aria-label="Search products">
              <svg className="w-5 h-5 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </Link>
            <button onClick={openCart} className={`relative p-2 rounded-lg transition-colors hover:opacity-80 ${dark ? 'text-gray-900' : 'text-white'}`} aria-label="Open cart" id="cart-header-bag">
              <svg className="w-5 h-5 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-white text-black text-[10px] font-bold flex items-center justify-center">
                  {count > 99 ? "99+" : count}
                </span>
              )}
            </button>
            <button className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg hover:bg-white/10 transition-colors" onClick={toggleMobileMenu} aria-label="Toggle menu">
              <svg className={`w-5 h-5 ${dark ? 'text-gray-900' : 'text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className={`fixed top-0 left-0 right-0 z-[100] w-full backdrop-blur-md transition-all duration-300 ${headerBg}`}>
       <div className="container mx-auto flex items-center justify-between px-4 py-2 sm:px-6 lg:px-[5vw] relative z-10 gap-4">
        {/* Left: Logo */}
        <Link className="flex shrink-0 items-center gap-2 sm:gap-3 group" href="/">
          <Image src="/logo-2.png" alt="Aroma Notes Logo" width={40} height={40} className="h-9 w-9 sm:h-12 sm:w-12" priority />
          <h1 className={`text-lg sm:text-xl font-bold font-audiowide tracking-wide ${dark ? 'text-gray-900' : 'text-white'} transition-all duration-300 group-hover:text-primary`}>
            Aroma Notes
          </h1>
        </Link>

        {/* Center: Desktop Nav */}
        <nav className="hidden flex-1 justify-center items-center gap-6 lg:gap-8 md:flex">
          <Link className={`text-xs sm:text-sm font-medium font-saira uppercase tracking-wider ${dark ? 'text-gray-900' : 'text-white'} hover:text-primary transition-all duration-300 relative group px-2 py-2`} href="/">
            <span className="relative z-10">Home</span>
            <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-orange-600 transform transition-transform duration-300 origin-center ${currentPage === 'home' ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></div>
          </Link>
          <Link className={`text-xs sm:text-sm font-medium font-saira uppercase tracking-wider ${dark ? 'text-gray-900' : 'text-white'} hover:text-primary transition-all duration-300 relative group px-2 py-2`} href="/products">
            <span className="relative z-10">Products</span>
            <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-orange-600 transform transition-transform duration-300 origin-center ${currentPage === 'products' ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></div>
          </Link>
          <Link className={`text-xs sm:text-sm font-medium font-saira uppercase tracking-wider ${dark ? 'text-gray-900' : 'text-white'} hover:text-primary transition-all duration-300 relative group px-2 py-2`} href="/about">
            <span className="relative z-10">About</span>
            <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-orange-600 transform transition-transform duration-300 origin-center ${currentPage === 'about' ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></div>
          </Link>
        </nav>

        {/* Right: Search + Bag + Mobile Menu */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <Link href="/products" className={`p-2 rounded-lg transition-colors hover:opacity-80 ${dark ? 'text-gray-900' : 'text-white'}`} aria-label="Search products">
            <svg className="w-5 h-5 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </Link>
          <button onClick={openCart} className={`relative p-2 rounded-lg transition-colors hover:opacity-80 ${dark ? 'text-gray-900' : 'text-white'}`} aria-label="Open cart" id="cart-header-bag">
            <svg className="w-5 h-5 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-white text-black text-[10px] font-bold flex items-center justify-center">
                {count > 99 ? "99+" : count}
              </span>
            )}
          </button>
          <button className={`md:hidden flex h-9 w-9 items-center justify-center rounded-lg hover:bg-white/10 transition-colors ${dark ? 'hover:bg-gray-200' : ''}`} onClick={toggleMobileMenu} aria-label="Toggle menu">
            <svg className={`w-5 h-5 transition-transform duration-300 ${isMounted && isMobileMenuOpen ? 'rotate-90' : ''} ${dark ? 'text-gray-900' : 'text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMounted && isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Simple Mobile Navigation Menu */}
      {isMounted && (
        <div className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${
          isMobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        }`}>
        <div className="bg-white/90 backdrop-blur-md border-t border-gray-200 font-saira uppercase">
          <nav className="container mx-auto px-4 py-4 space-y-3">
            <Link 
              className={`block text-base font-medium font-saira text-gray-700 hover:text-primary transition-all duration-300 py-3 px-4 rounded-lg hover:bg-primary/10 ${currentPage === 'home' ? 'bg-primary/10 text-primary border-l-4 border-primary' : ''}`}
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              className={`block text-base font-medium font-saira text-gray-700 hover:text-primary transition-all duration-300 py-3 px-4 rounded-lg hover:bg-primary/10 ${currentPage === 'products' ? 'bg-primary/10 text-primary border-l-4 border-primary' : ''}`}
              href="/products"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Products
            </Link>
            <Link 
              className={`block text-base font-medium font-saira text-gray-700 hover:text-primary transition-all duration-300 py-3 px-4 rounded-lg hover:bg-primary/10 ${currentPage === 'about' ? 'bg-primary/10 text-primary border-l-4 border-primary' : ''}`}
              href="/about"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About
            </Link>
          </nav>
        </div>
        </div>
      )}
    </header>
  );
}