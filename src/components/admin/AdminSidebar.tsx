"use client";

import { usePathname, useRouter } from "next/navigation";
import { signOut, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Image from "next/image";
import { useState, useEffect, type ReactNode } from "react";

interface NavItem {
  label: string;
  href: string;
  icon: ReactNode;
}

const INVOICE_PREFIX = "/an-admin/invoice";

const invoiceSubItems: { label: string; href: string }[] = [
  { label: "Full payments", href: `${INVOICE_PREFIX}/full-payments` },
  { label: "Advanced payments", href: `${INVOICE_PREFIX}/advanced-payments` },
];

const invoiceIcon = (
  <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M14.5 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7.5L14.5 2z"
    />
    <path strokeLinecap="round" strokeLinejoin="round" d="M14 2v6h6" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 13h8M8 17h8M8 9h2.5" />
  </svg>
);

const invoiceSubIcons: Record<string, ReactNode> = {
  [`${INVOICE_PREFIX}/full-payments`]: (
    <svg className="h-4 w-4 shrink-0 opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  [`${INVOICE_PREFIX}/advanced-payments`]: (
    <svg className="h-4 w-4 shrink-0 opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
};

const navItemsTop: NavItem[] = [
  {
    label: "Dashboard",
    href: "/an-admin",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z" />
      </svg>
    ),
  },
  {
    label: "Products",
    href: "/an-admin/products",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  {
    label: "Orders",
    href: "/an-admin/orders",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
  },
  {
    label: "Payments",
    href: "/an-admin/payments",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
      </svg>
    ),
  },
];

const navItemsBottom: NavItem[] = [
  {
    label: "Customers",
    href: "/an-admin/customers",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    label: "Settings",
    href: "/an-admin/settings",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

export default function AdminSidebar({ user }: { user: User | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [invoiceOpen, setInvoiceOpen] = useState(() => pathname.startsWith(INVOICE_PREFIX));

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (pathname.startsWith(INVOICE_PREFIX)) setInvoiceOpen(true);
  }, [pathname]);

  // Prevent scroll when mobile sidebar open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const handleSignOut = async () => {
    setShowLogoutConfirm(false);
    await signOut(auth);
    router.push("/an-admin/login");
  };

  const isActive = (href: string) => {
    if (href === "/an-admin") return pathname === "/an-admin";
    return pathname.startsWith(href);
  };

  const handleNav = (href: string) => {
    router.push(href);
    setMobileOpen(false);
  };

  const isInvoiceActive = pathname.startsWith(INVOICE_PREFIX);

  const toggleInvoiceSection = () => {
    if (collapsed) {
      router.push(invoiceSubItems[0]?.href ?? `${INVOICE_PREFIX}/full-payments`);
      setMobileOpen(false);
      return;
    }
    setInvoiceOpen((o) => !o);
  };

  const navButtonClass = (active: boolean) =>
    `group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 font-saira ${
      active
        ? "bg-gradient-to-r from-amber-500/20 to-rose-500/20 text-white shadow-lg shadow-amber-500/5"
        : "text-gray-400 hover:bg-white/5 hover:text-white"
    }`;

  const navIconWrapClass = (active: boolean) =>
    `shrink-0 ${active ? "text-amber-400" : "text-gray-500 group-hover:text-gray-300"}`;

  const sidebarContent = (
    <>
      {/* Logo / Brand */}
      <div className="flex items-center gap-3 border-b border-white/10 px-4 py-5">
        <Image
          src="/logo.png"
          alt="Aroma Notes"
          width={36}
          height={36}
          className="shrink-0 rounded-lg"
        />
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-sm font-bold text-white font-saira leading-tight">
              AROMA NOTES
            </h1>
            <p className="text-[10px] font-medium text-amber-400 font-saira tracking-wider">
              ADMIN
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto space-y-1 px-3 py-4">
        {navItemsTop.map((item) => {
          const active = isActive(item.href);
          return (
            <button
              key={item.href}
              type="button"
              onClick={() => handleNav(item.href)}
              className={navButtonClass(active)}
            >
              <span className={navIconWrapClass(active)}>{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
              {active && !collapsed && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-amber-400" />
              )}
            </button>
          );
        })}

        <div className="space-y-0.5">
          <button
            type="button"
            onClick={toggleInvoiceSection}
            aria-expanded={!collapsed ? invoiceOpen : undefined}
            className={navButtonClass(isInvoiceActive)}
          >
            <span className={navIconWrapClass(isInvoiceActive)}>{invoiceIcon}</span>
            {!collapsed && <span className="text-left">Invoice</span>}
            {!collapsed && (
              <svg
                className={`ml-auto h-4 w-4 shrink-0 text-gray-500 transition-transform duration-200 ${invoiceOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            )}
            {isInvoiceActive && collapsed && (
              <span className="ml-auto h-1.5 w-1.5 rounded-full bg-amber-400" />
            )}
          </button>
          {!collapsed && invoiceOpen && (
            <div className="mt-1 space-y-1 rounded-xl border border-white/10 bg-white/[0.04] p-1 ml-0.5">
              {invoiceSubItems.map((sub) => {
                const subActive = pathname === sub.href;
                const icon = invoiceSubIcons[sub.href];
                return (
                  <button
                    key={sub.href}
                    type="button"
                    onClick={() => handleNav(sub.href)}
                    className={`group flex w-full flex-nowrap items-center gap-2 rounded-lg px-2 py-2.5 text-left text-sm font-semibold transition-colors font-saira ${
                      subActive
                        ? "bg-amber-500/20 text-amber-50 ring-1 ring-amber-400/40 shadow-sm shadow-amber-500/10"
                        : "text-gray-200 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <span
                      className={`shrink-0 ${
                        subActive ? "text-amber-300" : "text-gray-400 group-hover:text-gray-200"
                      }`}
                    >
                      {icon}
                    </span>
                    <span className="whitespace-nowrap">{sub.label}</span>
                    {subActive ? (
                      <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                    ) : null}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {navItemsBottom.map((item) => {
          const active = isActive(item.href);
          return (
            <button
              key={item.href}
              type="button"
              onClick={() => handleNav(item.href)}
              className={navButtonClass(active)}
            >
              <span className={navIconWrapClass(active)}>{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
              {active && !collapsed && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-amber-400" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Collapse toggle — desktop only */}
      <div className="hidden lg:block px-3 py-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center justify-center rounded-lg p-2 text-gray-500 transition-colors hover:bg-white/5 hover:text-gray-300"
        >
          <svg
            className={`h-4 w-4 transition-transform duration-200 ${collapsed ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* User info + Sign out */}
      <div className="border-t border-white/10 p-3">
        {!collapsed ? (
          <div className="mb-2 rounded-xl bg-white/5 px-3 py-2.5">
            <p className="truncate text-sm font-medium text-white font-saira">
              {user?.displayName || "Super Admin"}
            </p>
            <p className="truncate text-xs text-gray-400 font-saira">
              {user?.email || "Admin"}
            </p>
          </div>
        ) : (
          <div className="mb-2 flex justify-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-rose-500 text-xs font-bold text-white">
              {user?.displayName?.[0] || user?.email?.[0]?.toUpperCase() || "A"}
            </div>
          </div>
        )}
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm text-red-400 transition-all hover:bg-red-500/10 font-saira"
        >
          <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger button only */}
      {!mobileOpen && (
        <button
          onClick={() => setMobileOpen(true)}
          className="fixed top-4 left-4 z-30 flex h-10 w-10 items-center justify-center rounded-xl bg-gray-800/90 text-gray-400 shadow-lg backdrop-blur-md transition-colors hover:bg-gray-700 hover:text-white lg:hidden"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="relative z-10 flex h-full w-[260px] flex-col bg-gray-900 shadow-2xl animate-slide-in-left">
            {/* Close button inside sidebar */}
            <div className="absolute right-2 top-3 z-20">
              <button
                onClick={() => setMobileOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Desktop sidebar — fixed height, never scrolls with page */}
      <aside
        className={`hidden lg:flex h-screen flex-col shrink-0 border-r border-white/10 bg-gray-900 transition-all duration-300 ${
          collapsed ? "w-[72px]" : "w-[260px]"
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Sign-out confirmation modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowLogoutConfirm(false)}
          />
          <div className="relative z-10 w-full max-w-sm rounded-2xl border border-white/10 bg-gray-900 p-6 shadow-2xl">
            {/* Icon */}
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10">
              <svg className="h-7 w-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>
            <h3 className="text-center text-lg font-bold text-white font-saira">
              Sign Out
            </h3>
            <p className="mt-2 text-center text-sm text-gray-400 font-saira">
              Are you sure you want to sign out of the admin panel?
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm font-semibold text-gray-300 transition-all hover:bg-white/10 hover:text-white font-saira"
              >
                Cancel
              </button>
              <button
                onClick={handleSignOut}
                className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-semibold text-white transition-all hover:bg-red-600 font-saira"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
