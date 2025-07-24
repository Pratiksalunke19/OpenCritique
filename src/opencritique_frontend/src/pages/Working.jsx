import React from "react";
import { Sparkles, MessageCircle, Users } from "lucide-react";

const steps = [
  {
    title: "1. Artists Upload WIPs",
    description:
      "Artists upload works-in-progress (WIPs) hosted on IPFS via Pinata. They can optionally attach token bounties to incentivize feedback.",
    icon: <Sparkles className="h-10 w-10 text-orange-400" />,
  },
  {
    title: "2. Critics Leave Feedback",
    description:
      "Community critics write detailed, thoughtful feedback. Critiques are stored on-chain and upvoted. Top feedback is rewarded with tokens.",
    icon: <MessageCircle className="h-10 w-10 text-green-400" />,
  },
  {
    title: "3. DAO Curation",
    description:
      "The DAO governs moderation, features the best artworks, and distributes community bonuses. Curation becomes transparent and collective.",
    icon: <Users className="h-10 w-10 text-purple-400" />,
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
              className="bg-[#1A2B4C] p-6 rounded-2xl shadow-md hover:shadow-xl transition duration-300"
            >
              <div className="mb-4 flex justify-center">{step.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-gray-400">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Working;
