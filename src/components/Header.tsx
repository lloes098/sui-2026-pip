"use client";

import Link from "next/link";
import { copy } from "@/lib/copy";
import { Logo } from "./Logo";
import { ConnectWallet } from "./WalletConnect";

export function Header() {
  const navLinks = [
    { href: "/#problem", label: copy.nav.overview },
    { href: "/#indexes", label: copy.nav.indexes },
    { href: "/#agents", label: copy.nav.agents },
    { href: "/app", label: copy.nav.trade },
  ];

  return (
    <header className="fixed top-0 z-50 w-full glass">
      <div className="mx-auto flex h-[4.25rem] max-w-6xl items-center justify-between gap-4 px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <Logo size={30} priority />
          <span className="hidden text-sm font-bold uppercase tracking-[0.12em] sm:inline">
            PIP
          </span>
        </Link>

        <nav className="sui-nav-shell hidden md:flex">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="sui-nav-link shrink-0">
              {link.label}
            </Link>
          ))}
        </nav>

        <ConnectWallet />
      </div>
    </header>
  );
}
