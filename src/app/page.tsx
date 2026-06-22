import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { ProblemSolution } from "@/components/ProblemSolution";
import { IndexProducts } from "@/components/IndexProducts";
import { Agents } from "@/components/Agents";
import { GetStarted } from "@/components/GetStarted";
import { Comparison } from "@/components/Comparison";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <ProblemSolution />
        <IndexProducts />
        <Agents />
        <GetStarted />
        <Comparison />
      </main>
      <Footer />
    </>
  );
}
