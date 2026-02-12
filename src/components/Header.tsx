"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

interface HeaderProps {
  currentPage?: 'home' | 'products' | 'about';
  dark?: boolean; // when true, use dark text (black) for header words
}

export default function Header({ currentPage = 'home', dark = false }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const toggleMobileMenu = () => {
    console.log('Mobile menu toggle clicked, current state:', isMobileMenuOpen);
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Ensure component is mounted to prevent hydration issues
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Debug: Log menu state changes
  useEffect(() => {
    console.log('Mobile menu state changed:', isMobileMenuOpen);
  }, [isMobileMenuOpen]);

  // Prevent hydration mismatch by not rendering until mounted
  if (!isMounted) {
    return (
      <header className="w-full bg-transparent transition-all duration-300 relative">
         <div className="container mx-auto flex items-center justify-between px-4 py-2 sm:px-6 lg:px-[5vw] relative z-10">
          {/* Enhanced Logo */}
          <Link className="flex h-full items-center gap-3 group" href="/">
            <div className="relative">
              <Image
                src="/logo-2.png"
                alt="Aroma Notes Logo"
                width={48}
                height={48}
                className="h-12 w-12"
                priority
              />
            </div>
            <div className="relative">
              <h1 className={`text-xl font-bold font-audiowide tracking-wide ${dark ? 'text-gray-900' : 'text-white'} transition-all duration-300 group-hover:text-primary`}>
                Aroma Notes
              </h1>
            <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-orange-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
          </div>
        </Link>

          {/* Enhanced Desktop Navigation */}
          <nav className="hidden items-center gap-8 md:flex">
            <Link className={`text-sm font-medium font-saira uppercase ${dark ? 'text-gray-900' : 'text-white'} hover:text-primary transition-all duration-300 relative group px-3 py-2 rounded-lg`} href="/">
              <span className="relative z-10 transition-all duration-300 group-hover:scale-105">Home</span>
              <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-orange-600 transform transition-transform duration-300 origin-center ${currentPage === 'home' ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></div>
            </Link>
            <Link className={`text-sm font-medium font-saira uppercase ${dark ? 'text-gray-900' : 'text-white'} hover:text-primary transition-all duration-300 relative group px-3 py-2 rounded-lg`} href="/products">
              <span className="relative z-10 transition-all duration-300 group-hover:scale-105">Products</span>
              <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-orange-600 transform transition-transform duration-300 origin-center ${currentPage === 'products' ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></div>
            </Link>
            <Link className={`text-sm font-medium font-saira uppercase ${dark ? 'text-gray-900' : 'text-white'} hover:text-primary transition-all duration-300 relative group px-3 py-2 rounded-lg`} href="/about">
              <span className="relative z-10 transition-all duration-300 group-hover:scale-105">About</span>
              <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-orange-600 transform transition-transform duration-300 origin-center ${currentPage === 'about' ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></div>
            </Link>
          </nav>


          {/* Simple Mobile Menu Button */}
          <button 
            className="md:hidden flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-all duration-300 border border-primary/30"
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
          >
            <svg 
              className="w-6 h-6 transition-transform duration-300" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>
    );
  }

  return (
    <header className="w-full bg-transparent transition-all duration-300 relative">
       <div className="container mx-auto flex items-center justify-between px-4 py-2 sm:px-6 lg:px-[5vw] relative z-10">
        {/* Enhanced Logo */}
        <Link className="flex h-full items-center gap-3 group" href="/">
          <div className="relative">
            <Image
              src="/logo-2.png"
              alt="Aroma Notes Logo"
              width={48}
              height={48}
              className="h-12 w-12"
              priority
            />
          </div>
          <div className="relative">
            <h1 className={`text-xl font-bold font-audiowide tracking-wide ${dark ? 'text-gray-900' : 'text-white'} transition-all duration-300 group-hover:text-primary`}>
              Aroma Notes
            </h1>
            <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-orange-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
          </div>
        </Link>

        {/* Enhanced Desktop Navigation */}
        <nav className="hidden items-center gap-8 md:flex">
          <Link className={`text-sm font-medium font-saira uppercase ${dark ? 'text-gray-900' : 'text-white'} hover:text-primary transition-all duration-300 relative group px-3 py-2 rounded-lg`} href="/">
            <span className="relative z-10 transition-all duration-300 group-hover:scale-105">Home</span>
            <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-orange-600 transform transition-transform duration-300 origin-center ${currentPage === 'home' ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></div>
          </Link>
          <Link className={`text-sm font-medium font-saira uppercase ${dark ? 'text-gray-900' : 'text-white'} hover:text-primary transition-all duration-300 relative group px-3 py-2 rounded-lg`} href="/products">
            <span className="relative z-10 transition-all duration-300 group-hover:scale-105">Products</span>
            <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-orange-600 transform transition-transform duration-300 origin-center ${currentPage === 'products' ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></div>
          </Link>
          <Link className={`text-sm font-medium font-saira uppercase ${dark ? 'text-gray-900' : 'text-white'} hover:text-primary transition-all duration-300 relative group px-3 py-2 rounded-lg`} href="/about">
            <span className="relative z-10 transition-all duration-300 group-hover:scale-105">About</span>
            <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-orange-600 transform transition-transform duration-300 origin-center ${currentPage === 'about' ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></div>
          </Link>
        </nav>


        {/* Simple Mobile Menu Button */}
        <button 
          className="md:hidden flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-all duration-300 border border-primary/30"
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
        >
          <svg 
            className={`w-6 h-6 transition-transform duration-300 ${isMounted && isMobileMenuOpen ? 'rotate-90' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            {isMounted && isMobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
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