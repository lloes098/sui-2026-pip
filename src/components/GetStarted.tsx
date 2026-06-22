"use client";

import Link from "next/link";
import { copy } from "@/lib/copy";

export function GetStarted() {
  return (
    <section className="sui-divider py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="sui-card-glow p-10 md:p-14">
          <div className="max-w-2xl">
            <span className="sui-label">{copy.getStarted.label}</span>
            <h2 className="sui-heading mt-4">{copy.getStarted.title}</h2>
            <p className="mt-4 text-muted">{copy.getStarted.subtitle}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/app" className="sui-btn-solid">
                {copy.getStarted.cta}
              </Link>
              <a href="#indexes" className="sui-btn-primary">
                {copy.getStarted.ctaSecondary}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
