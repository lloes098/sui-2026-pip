import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { ProblemSolution } from "@/components/ProblemSolution";
import { IndexProducts } from "@/components/IndexProducts";
import { Agents } from "@/components/Agents";
import { Demo } from "@/components/Demo";
import { Comparison, Footer } from "@/components/Comparison";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <ProblemSolution />
        <IndexProducts />
        <Agents />
        <Comparison />
        <Demo />
      </main>
      <Footer />
    </>
  );
}
