const Hero = () => {
  return (
    <div className="relative min-h-screen overflow-hidden text-white">
      <div className="relative z-10 flex flex-col items-center justify-center h-screen text-center px-6 ">
        <h1 className="text-4xl md:text-6xl  text-heading font-extrabold mb-4">
          Empowering Artists with <br className="hidden md:block" />
          Decentralized Critique.
        </h1>
        <p className="text-lg md:text-xl max-w-xl">
          Get thoughtful feedback on your art. Reward critics. Curate together.
        </p>
      </div>
    </div>
  );
};

export default Hero;