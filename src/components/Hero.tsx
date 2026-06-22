"use client";

import { copy } from "@/lib/copy";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-36 pb-24 md:pt-44 md:pb-32">
      <div className="pointer-events-none absolute inset-0 grid-bg" />

      <div className="relative mx-auto max-w-6xl px-6">
        <div className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-border bg-surface px-4 py-2">
          <span className="h-2 w-2 rounded-full bg-foreground" />
          <span className="sui-label !text-[0.625rem] normal-case !tracking-wider">
            {copy.hero.badge}
          </span>
        </div>

        <h1 className="sui-display max-w-5xl">
          {copy.hero.title}
          <br />
          <span className="text-muted">{copy.hero.titleHighlight}</span>
        </h1>

        <p className="mt-8 max-w-xl text-base leading-relaxed text-muted md:text-lg">
          {copy.hero.subtitle}
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <a href="/app" className="sui-btn-solid">
            {copy.hero.cta}
          </a>
          <a href="#agents" className="sui-btn-primary">
            {copy.hero.ctaSecondary}
          </a>
        </div>

        <div className="mt-20 grid gap-4 sm:grid-cols-3">
          {[
            { value: "4", label: copy.hero.stat1, sub: copy.hero.stat1Sub },
            { value: "5", label: copy.hero.stat2, sub: copy.hero.stat2Sub },
            { value: "1", label: copy.hero.stat3, sub: copy.hero.stat3Sub },
          ].map((stat) => (
            <div key={stat.label} className="sui-card-glow p-6 md:p-7">
              <div className="text-4xl font-extrabold">{stat.value}</div>
              <div className="mt-2 text-sm font-bold uppercase tracking-wide">
                {stat.label}
              </div>
              <div className="mt-1 text-xs text-muted">{stat.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
