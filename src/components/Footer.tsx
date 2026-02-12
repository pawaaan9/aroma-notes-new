import { FaInstagram, FaFacebook, FaTiktok } from "react-icons/fa6";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white/90 backdrop-blur-sm border-t border-gray-200 relative overflow-hidden">
      {/* soft gradient accent behind footer */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-amber-100/20 via-rose-100/10 to-transparent"></div>
      <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/60 to-transparent"></div>
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-[5vw]">
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 md:justify-start">
            <Link className="text-sm text-gray-600 hover:text-primary transition-all duration-300 relative group font-saira" href="/about">
              <span className="relative z-10 font-saira uppercase">About</span>
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></div>
            </Link>
            <Link className="text-sm text-gray-600 hover:text-primary transition-all duration-300 relative group font-saira" href="/privacy">
              <span className="relative z-10 font-saira uppercase">Privacy</span>
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></div>
            </Link>
            <Link className="text-sm text-gray-600 hover:text-primary transition-all duration-300 relative group font-saira" href="/terms">
              <span className="relative z-10 font-saira uppercase">Terms</span>
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></div>
            </Link>
            <Link className="text-sm text-gray-600 hover:text-primary transition-all duration-300 relative group font-saira" href="/return-policy">
              <span className="relative z-10 font-saira uppercase">Return Policy</span>
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></div>
            </Link>
          </div>
          <div className="flex justify-center gap-4">
            <a className="text-gray-600 hover:text-primary transition-all duration-300 hover:scale-110" href="https://www.instagram.com/aroma.notes_?igsh=aGRjdW1oYzQ1ZmJh" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <FaInstagram size={24} />
            </a>
            <a className="text-gray-600 hover:text-primary transition-all duration-300 hover:scale-110" href="https://www.facebook.com/share/16MvUNpNzU/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <FaFacebook size={24} />
            </a>
            <a className="text-gray-600 hover:text-primary transition-all duration-300 hover:scale-110" href="https://www.tiktok.com/@aroma_notess?_t=ZS-90o5oCc83gl&_r=1" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
              <FaTiktok size={24} />
            </a>
          </div>
        </div>
        <div className="text-center">
          <p className="mt-6 text-sm text-gray-500 font-saira uppercase">© 2025 Aroma Notes. All rights reserved.</p>
          <div className="mt-2 flex justify-center space-x-4">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-primary/60 rounded-full animate-pulse delay-300"></div>
            <div className="w-2 h-2 bg-primary/40 rounded-full animate-pulse delay-700"></div>
          </div>
        </div>
      </div>
    </footer>
  );
}
