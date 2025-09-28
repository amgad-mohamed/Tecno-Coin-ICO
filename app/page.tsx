import Hero from "./components/Hero";
import TokenSale from "./components/TokenSale";
import ScrollToTop from "./components/ScrollToTop";
import HowToBuy from "./components/HowToBuy";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section with Countdown */}
      <section className="pt-20 md:pt-32">
        <Hero />
      </section>

      {/* Token Sale Section */}
      <section className="section bg-white/50" id="token-sale">
        <TokenSale />
      </section>

      {/* How To Buy Section */}
      <section className="section bg-white/50" id="how-to-buy">
        <HowToBuy />
      </section>

      {/* Scroll to Top Button */}
      <ScrollToTop />
    </main>
  );
}
