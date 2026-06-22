"use client";

import Link from "next/link";
import { copy } from "@/lib/copy";
import { Logo } from "./Logo";

export function Footer() {
  const links = [
    { href: "/#problem", label: copy.nav.overview },
    { href: "/#indexes", label: copy.nav.indexes },
    { href: "/#agents", label: copy.nav.agents },
    { href: "/app", label: copy.nav.trade },
    { href: "https://sui.io", label: "Sui", external: true },
  ];

  return (
    <footer className="sui-divider py-14">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-3">
            <Logo size={28} />
            <div>
              <div className="text-sm font-bold uppercase tracking-wide">PIP</div>
              <div className="text-xs text-muted">{copy.footer.tagline}</div>
            </div>
          </div>

          <nav className="sui-nav-shell flex max-w-full flex-wrap justify-center">
            {links.map((link) =>
              link.external ? (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sui-nav-link shrink-0"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className="sui-nav-link shrink-0"
                >
                  {link.label}
                </Link>
              ),
            )}
          </nav>
        </div>

        <div className="mt-10 text-center text-xs text-muted">{copy.footer.copyright}</div>
      </div>
    </footer>
  );
}
