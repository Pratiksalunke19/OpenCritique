import Aurora from "../components/Aurora/Aurora";
import Hero from "./Hero";
import CardSwap, { Card } from "../components/CardSwap";
import Features from "./Featues";
import Community from "./Community";
import Working from "./Working";

const LandingPage = () => {
  return (
    <>
      {/* Hero Section - styled like new ui */}
      <section className="relative w-full min-h-[70vh] md:min-h-screen flex flex-col items-center justify-center text-center overflow-hidden bg-background gradient-hero animate-fade-in">
        <div className="absolute inset-0 pointer-events-none">
          <Aurora amplitude={3}/>
        </div>
        <div className="relative z-10 w-full px-4 md:px-6 pt-20 md:pt-24">
          <div className="mx-auto max-w-7xl">
            <div className="animate-slide-up">
              <Hero />
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-card border-t border-border animate-slide-up">
        <div className="px-4 md:px-6 py-12 md:py-20 mx-auto max-w-7xl">
          <Working />
        </div>
      </section>

      {/* Features */}
      <section className="px-4 md:px-6 py-12 md:py-20 mx-auto max-w-7xl animate-slide-up">
        <Features/>
      </section>

      {/* Community */}
      <section className="bg-card/50 border-t border-border animate-slide-up">
        <div className="px-4 md:px-6 py-12 md:py-20 mx-auto max-w-7xl">
          <Community/>
        </div>
      </section>
    </>
  );
};



export default LandingPage;
