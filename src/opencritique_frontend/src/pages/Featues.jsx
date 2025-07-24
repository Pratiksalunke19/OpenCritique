import { Database } from "lucide-react";
import { Coins } from "lucide-react";
import { Star } from "lucide-react";
import { Gavel } from "lucide-react";
import { Target } from "lucide-react";
import { FlaskConical } from "lucide-react";

const Features = () => {
  const features = [
    {
      title: "Decentralized Storage",
      description:
        "Artworks and critiques are stored on-chain via the Internet Computer.",
      icon: <Database/>,
    },
    {
      title: "Token Rewards",
      description:
        "Helpful critiques are upvoted and rewarded by the community.",
      icon: <Coins/>,
    },
    {
      title: "On-Chain Reputation",
      description:
        "Critics build profiles showcasing their contributions and expertise.",
      icon: <Star/>,
    },
    {
      title: "DAO Governance",
      description:
        "Community curates featured artworks and governs moderation.",
      icon: <Gavel/>,
    },
    {
      title: "Optional Bounties",
      description:
        "Artists can incentivize critiques by attaching token rewards.",
      icon: <Target/>,
    },
    {
      title: "Work-in-Progress Focus",
      description:
        "Upload early-stage art for meaningful and constructive feedback.",
      icon: <FlaskConical/>,
    },
  ];

  return (
    <section className="py-20 px-6 mt-13 bg-panel text-white">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl md:text-5xl font-bold mb-12">
          Platform Features
        </h2>
        <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-[#1A2B4C] p-6 rounded-2xl shadow-lg hover:scale-[1.02] transition-transform"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-300">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
