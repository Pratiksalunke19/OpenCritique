import React from "react";
import { Sparkles, MessageCircle, Users } from "lucide-react";

const steps = [
  {
    title: "1. Artists Upload WIPs",
    description:
      "Artists upload works-in-progress (WIPs) hosted on IPFS via Pinata. They can optionally attach token bounties to incentivize feedback.",
    icon: <Sparkles className="h-10 w-10 text-orange-400" />,
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=400&q=80"
  },
  {
    title: "2. Critics Leave Feedback",
    description:
      "Community critics write detailed, thoughtful feedback. Critiques are stored on-chain and upvoted. Top feedback is rewarded with tokens.",
    icon: <MessageCircle className="h-10 w-10 text-green-400" />,
    image: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=400&q=80"
  },
  {
    title: "3. DAO Curation",
    description:
      "The DAO governs moderation, features the best artworks, and distributes community bonuses. Curation becomes transparent and collective.",
    icon: <Users className="h-10 w-10 text-purple-400" />,
    image: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80"
  },
];

const Working = () => {
  return (
    <section id="how-it-works" className="py-20 px-4 sm:px-8 md:px-16 bg-panel text-white">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-4xl font-bold mb-4">How It Works</h2>
        <p className="text-gray-400 mb-12">
          Transparent, Immutable, Community-Powered.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {steps.map((step, index) => (
            <div
              key={index}
              className="group relative w-full h-80 bg-[#1A2B4C] rounded-2xl shadow-lg overflow-hidden cursor-pointer transition-transform hover:scale-105"
            >
              {/* Background image */}
              <img
                src={step.image}
                alt={step.title}
                className="inset-0 w-full h-full object-cover object-center opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                draggable={false}
              />
              {/* Card content with black background at bottom half */}
              <div
                className="absolute left-0 bottom-0 w-full bg-black/80 flex flex-col justify-end p-6 text-left transition-all duration-500 ease-in-out"
                style={{ height: '50%' }}
                onMouseEnter={e => e.currentTarget.style.height = '100%'}
                onMouseLeave={e => e.currentTarget.style.height = '50%'}
              >
                <h3 className="text-2xl font-semibold mb-2 group-hover:text-primary transition-colors">
                  {step.title.replace(/^\d+\. /, "")}
                </h3>
                <p className="text-gray-200 text-base group-hover:text-white transition-colors">
                  {step.description}
                </p>
              </div>  
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Working;


<div className="max-w-6xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-6 sm:mb-8 break-keep">How it Works</h2>
          <div className="flex flex-col md:flex-row gap-8 justify-center items-center">
            <div className="group relative w-80 h-80 bg-[#1A2B4C] rounded-2xl shadow-lg overflow-hidden cursor-pointer transition-transform hover:scale-105">
              <img
                src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=400&q=80"
                alt="Artists Upload WIPs"
                className="absolute inset-0 w-full h-full object-cover object-center opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                draggable={false}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
              <div className="relative z-20 flex flex-col justify-end h-full p-6 text-left">
                <h3 className="text-2xl font-semibold mb-2 group-hover:text-primary transition-colors">
                  Artists Upload WIPs
                </h3>
                <p className="text-gray-200 text-base group-hover:text-white transition-colors">
                  Artists upload works-in-progress (WIPs) hosted on IPFS via Pinata. They can optionally attach token bounties to incentivize feedback.
                </p>
              </div>
            </div>
            <div className="group relative w-80 h-80 bg-[#1A2B4C] rounded-2xl shadow-lg overflow-hidden cursor-pointer transition-transform hover:scale-105">
              <img
                src="https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=400&q=80"
                alt="Critics Leave Feedback"
                className="absolute inset-0 w-full h-full object-cover object-center opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                draggable={false}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
              <div className="relative z-20 flex flex-col justify-end h-full p-6 text-left">
                <h3 className="text-2xl font-semibold mb-2 group-hover:text-primary transition-colors">
                  Critics Leave Feedback
                </h3>
                <p className="text-gray-200 text-base group-hover:text-white transition-colors">
                  Community critics write detailed, thoughtful feedback. Critiques are stored on-chain and upvoted. Top feedback is rewarded with tokens.
                </p>
              </div>
            </div>
            <div className="group relative w-80 h-80 bg-[#1A2B4C] rounded-2xl shadow-lg overflow-hidden cursor-pointer transition-transform hover:scale-105">
              <img
                src="https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80"
                alt="DAO Curation"
                className="absolute inset-0 w-full h-full object-cover object-center opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                draggable={false}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
              <div className="relative z-20 flex flex-col justify-end h-full p-6 text-left">
                <h3 className="text-2xl font-semibold mb-2 group-hover:text-primary transition-colors">
                  DAO Curation
                </h3>
                <p className="text-gray-200 text-base group-hover:text-white transition-colors">
                  The DAO governs moderation, features the best artworks, and distributes community bonuses. Curation becomes transparent and collective.
                </p>
              </div>
            </div>
          </div>
        </div>