"use client";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PredictApp } from "@/components/app/PredictApp";
import { copy } from "@/lib/copy";

export default function AppPageClient() {
  return (
    <>
      <Header />
      <main className="pt-28 pb-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-10">
            <span className="sui-label">DeepBook Predict · Sui</span>
            <h1 className="sui-heading mt-3 uppercase tracking-wide">
              {copy.app.title}
            </h1>
            <p className="mt-3 max-w-xl text-muted">{copy.app.subtitle}</p>
          </div>
          <PredictApp />
        </div>
      </main>
      <Footer />
    </>
  );
}
