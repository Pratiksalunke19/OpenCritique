import Aurora from "../components/Aurora/Aurora";
import Hero from "./Hero";
import CardSwap, { Card } from "../components/CardSwap";
import Features from "./Featues";
import Community from "./Community";
import Working from "./Working";

const LandingPage = () => {
  return (
    <>
      <section className="relative w-full min-h-[600px] md:min-h-[900px] flex flex-col items-center justify-center text-center overflow-hidden pb-0">
        {/* Aurora background for hero */}
        <div className="absolute top-0 left-0 w-full h-[70%] z-0" style={{ pointerEvents: 'none' }}>
          <Aurora amplitude={3}/>
        </div>
        <div className="flex-grow flex items-center justify-center w-full">
          <div className="w-full">
            <Hero />
          </div>
        </div>
        {/* ...rest of your hero content... */}
      </section>
      <section className="pt-2 pb-10 sm:pb-16 md:py-20 px-2 sm:px-4 md:px-6 bg-panel text-white -mt-6 sm:-mt-0 md:mt-0">
        <Working />
      </section>
      <Features/>
      <Community/>
    </>
  );
};



export default LandingPage;
