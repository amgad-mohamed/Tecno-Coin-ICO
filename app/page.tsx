import Hero from "./components/Hero";
import TokenSale from "./components/TokenSale";
import ScrollToTop from "./components/ScrollToTop";
import AnimatedBackground from "./components/AnimatedBackground";
import StatsSection from "./components/StatsSection";
import RoadmapSection from "./components/RoadmapSection";
import PresaleCountdown from "./components/PresaleCountdown";
import HowToBuy from "./components/HowToBuy";

export default function Home() {
  return (
    <main className="min-h-screen bg-bgColor relative overflow-hidden">
      {/* Animated Background */}
      {/* <AnimatedBackground /> */}
      {/* Hero Section */}
      <section className="section">
        <Hero />
      </section>

      {/* Presale Countdown Section (uses CountdownTimer with DB data) */}
        <PresaleCountdown />
      {/* <section className="section relative z-50">
      </section> */}

      {/* Token Sale Section */}
      <section className="section relative z-10" id="token-sale">
        <TokenSale />
      </section>

      {/* How To Buy Section */}
      <section className="py-10 relative z-10" id="how-to-buy-section">
        <HowToBuy />
      </section>

      {/* Scroll to Top Button */}
      <ScrollToTop />
    </main>
  );
}
