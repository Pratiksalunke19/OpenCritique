
import SplitText from "../components/SplitText";

const Hero = () => {
  return (
    <div className="relative min-h-screen overflow-hidden text-white">
      <div className="relative z-10 flex flex-col items-center justify-center h-screen text-center px-6 ">
        <SplitText
          text="Empowering Artists with"
          className="text-3xl sm:text-5xl md:text-7xl font-bold leading-tight break-words whitespace-nowrap pb-3"
          splitType="chars"
          delay={30}
        />
        <SplitText
          text="Decentralized Critique."
          className="text-3xl sm:text-5xl md:text-7xl font-bold leading-tight break-words whitespace-nowrap"
          splitType="chars"
          delay={30}
        />
        <p className="text-xl md:text-2xl font-medium mt-2">
          Get thoughtful feedback on your art. Reward critics. Curate together.
        </p>
      </div>
    </div>
  );
};

export default Hero;