import { FaInstagram, FaFacebook, FaTiktok } from "react-icons/fa6";
import { IoLogoWhatsapp } from "react-icons/io5";
import Image from "next/image";
import Link from "next/link";

const WHATSAPP_NUMBER = "94721922332";
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}`;

const SOCIAL_LINKS = [
  { href: "https://www.instagram.com/aroma.notes_?igsh=aGRjdW1oYzQ1ZmJh", label: "Instagram", Icon: FaInstagram },
  { href: "https://www.facebook.com/share/16MvUNpNzU/?mibextid=wwXIfr", label: "Facebook", Icon: FaFacebook },
  { href: "https://www.tiktok.com/@aroma_notess?_t=ZS-90o5oCc83gl&_r=1", label: "TikTok", Icon: FaTiktok },
  { href: WHATSAPP_LINK, label: "WhatsApp", Icon: IoLogoWhatsapp },
];

const LINK_GROUPS = [
  {
    title: "Shop",
    links: [
      { href: "/products", label: "All Fragrances" },
      { href: "/#best-sellers", label: "Best Sellers" },
      { href: "/#new-arrivals", label: "New Arrivals" },
      { href: "/cart", label: "Your Cart" },
    ],
  },
  {
    title: "Customer Care",
    links: [
      { href: "/about", label: "About Us" },
      { href: "/return-policy", label: "Return Policy" },
      { href: "/terms", label: "Terms & Conditions" },
      { href: "/privacy", label: "Privacy Policy" },
    ],
  },
];

const Arrow = () => (
  <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="square" d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400">
      {/* Call to action blocks */}
      <div className="grid md:grid-cols-2">
        <Link href="/products" className="group flex items-end justify-between gap-6 bg-primary px-6 py-10 sm:px-10 sm:py-14 lg:px-[10vw]">
          <div>
            <p className="eyebrow text-black/70">The Collection</p>
            <p className="mt-3 text-3xl font-black uppercase leading-[0.95] tracking-tight text-black sm:text-4xl">
              Find Your
              <br />
              Signature Scent
            </p>
          </div>
          <span className="flex h-14 w-14 shrink-0 items-center justify-center bg-black text-white transition-colors group-hover:bg-white group-hover:text-black">
            <Arrow />
          </span>
        </Link>
        <a
          href={WHATSAPP_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-end justify-between gap-6 border-t border-white/10 bg-black px-6 py-10 sm:px-10 sm:py-14 md:border-l md:border-t-0 lg:px-[10vw]"
        >
          <div>
            <p className="eyebrow text-primary">Personal Advice</p>
            <p className="mt-3 text-3xl font-black uppercase leading-[0.95] tracking-tight text-white sm:text-4xl">
              Talk To Us
              <br />
              <span className="text-outline">On WhatsApp</span>
            </p>
          </div>
          <span className="flex h-14 w-14 shrink-0 items-center justify-center border border-white/30 text-white transition-colors group-hover:border-primary group-hover:bg-primary">
            <IoLogoWhatsapp size={22} />
          </span>
        </a>
      </div>

      {/* Link grid */}
      <div className="grid grid-cols-2 border-b border-white/10 md:grid-cols-12">
        <div className="col-span-2 border-b border-white/10 px-6 py-12 sm:px-10 md:col-span-5 md:border-b-0 md:border-r lg:pl-[10vw]">
          <Image src="/logo-horizontal.png" alt="Aroma Notes" width={1339} height={200} className="h-9 w-auto" />
          <p className="mt-6 max-w-sm text-sm leading-relaxed">
            Handcrafted luxury perfumes by Yusuf Bhai, imported exclusively to Sri Lanka.
          </p>
          <div className="mt-8 flex">
            {SOCIAL_LINKS.map(({ href, label, Icon }) => (
              <a
                key={label}
                className="-ml-px flex h-11 w-11 items-center justify-center border border-white/15 text-gray-300 transition-colors first:ml-0 hover:border-primary hover:bg-primary hover:text-white"
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>

        {LINK_GROUPS.map((group, gi) => (
          <div
            key={group.title}
            className={`px-6 py-12 sm:px-10 md:col-span-2 md:px-8 ${gi === 0 ? "border-r border-white/10" : "md:border-r md:border-white/10"}`}
          >
            <p className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.22em] text-white">
              <span className="h-1.5 w-1.5 bg-primary" />
              {group.title}
            </p>
            <ul className="mt-6 space-y-3.5 text-sm">
              {group.links.map((l) => (
                <li key={l.href}>
                  <Link className="group inline-flex items-center gap-2 transition-colors hover:text-white" href={l.href}>
                    <span className="h-px w-0 bg-primary transition-all duration-300 group-hover:w-3" />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="col-span-2 border-t border-white/10 px-6 py-12 sm:px-10 md:col-span-3 md:border-t-0 md:px-8 lg:pr-[10vw]">
          <p className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.22em] text-white">
            <span className="h-1.5 w-1.5 bg-primary" />
            Contact
          </p>
          <dl className="mt-6 space-y-5 text-sm">
            <div>
              <dt className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">WhatsApp</dt>
              <dd className="mt-1">
                <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="font-bold text-white hover:text-primary">
                  +94 72 192 2332
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Payments</dt>
              <dd className="mt-1 text-white">Pay in 4 interest free with Payzy</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Giant wordmark */}
      <div className="overflow-hidden px-4 pt-8 sm:px-6 lg:px-[10vw]" aria-hidden>
        <p className="text-outline select-none whitespace-nowrap text-center text-[10.5vw] font-black uppercase leading-[0.85] tracking-tight text-white/20">
          Aroma Notes
        </p>
      </div>

      {/* Bottom bar */}
      <div className="flex flex-col items-start gap-4 border-t border-white/10 px-6 py-6 text-xs sm:flex-row sm:items-center sm:justify-between sm:px-10 lg:px-[10vw]">
        <p>&copy; {new Date().getFullYear()} Aroma Notes. All rights reserved. All prices in LKR.</p>
        <a
          href="#"
          className="group inline-flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.2em] text-white transition-colors hover:text-primary"
        >
          Back to top
          <span className="flex h-8 w-8 items-center justify-center border border-white/20 transition-colors group-hover:border-primary group-hover:bg-primary group-hover:text-white">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="square" d="M12 19V5m-7 7l7-7 7 7" />
            </svg>
          </span>
        </a>
      </div>
    </footer>
  );
}
