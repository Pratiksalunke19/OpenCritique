import React, { useState } from "react";
import { cn } from "../lib/utils";

const features = [
  {
    title: "Decentralized Storage",
    description:
      "Artworks and critiques are stored on-chain via the Internet Computer.",
    icon: "🔗",
    color: "from-blue-500/20 to-blue-700/20",
    iconColor: "text-blue-400",
    hoverColor: "group-hover:border-blue-500/50 group-hover:shadow-blue-500/20"
  },
  {
    title: "Token Rewards",
    description:
      "Helpful critiques are upvoted and rewarded by the community.",
    icon: "💰",
    color: "from-yellow-500/20 to-yellow-700/20",
    iconColor: "text-yellow-400",
    hoverColor: "group-hover:border-yellow-500/50 group-hover:shadow-yellow-500/20"
  },
  {
    title: "On-Chain Reputation",
    description:
      "Critics build profiles showcasing their contributions and expertise.",
    icon: "⭐",
    color: "from-purple-500/20 to-purple-700/20",
    iconColor: "text-purple-400",
    hoverColor: "group-hover:border-purple-500/50 group-hover:shadow-purple-500/20"
  },
  {
    title: "DAO Governance",
    description:
      "Community curates featured artworks and governs moderation.",
    icon: "⚖️",
    color: "from-green-500/20 to-green-700/20",
    iconColor: "text-green-400",
    hoverColor: "group-hover:border-green-500/50 group-hover:shadow-green-500/20"
  },
  {
    title: "Optional Bounties",
    description:
      "Artists can incentivize critiques by attaching token rewards.",
    icon: "🎯",
    color: "from-red-500/20 to-red-700/20",
    iconColor: "text-red-400",
    hoverColor: "group-hover:border-red-500/50 group-hover:shadow-red-500/20"
  },
  {
    title: "Work-in-Progress Focus",
    description:
      "Upload early-stage art for meaningful and constructive feedback.",
    icon: "🧪",
    color: "from-cyan-500/20 to-cyan-700/20",
    iconColor: "text-cyan-400",
    hoverColor: "group-hover:border-cyan-500/50 group-hover:shadow-cyan-500/20"
  }
];

const FeaturesSection = () => {
  const [hoveredFeature, setHoveredFeature] = useState(null);

  return (
    <section className="py-20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-heading font-bold mb-4 text-foreground">
            Platform Features
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover what makes OpenCritique the perfect platform for artists and critics
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className={cn(
                "group relative p-6 rounded-xl transition-all duration-500",
                "bg-gradient-to-br border border-border",
                "hover-lift hover-glow",
                "animate-fade-in",
                feature.color
              )}
              style={{ animationDelay: `${index * 0.1}s` }}
              onMouseEnter={() => setHoveredFeature(index)}
              onMouseLeave={() => setHoveredFeature(null)}
            >
              {/* Icon */}
              <div className={cn(
                "w-12 h-12 rounded-full mb-4 flex items-center justify-center text-2xl",
                "bg-card/50 backdrop-blur-sm border border-border",
                "transition-all duration-500 group-hover:scale-110",
                hoveredFeature === index ? "animate-float" : ""
              )}>
                {feature.icon}
              </div>

              {/* Content */}
              <h3 className={cn(
                "text-xl font-heading font-semibold mb-3 transition-colors duration-300",
                "text-foreground",
                feature.iconColor
              )}>
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>

              {/* Animated Border */}
              <div className={cn(
                "absolute inset-0 rounded-xl border border-transparent",
                "transition-all duration-500 opacity-0 group-hover:opacity-100",
                "shadow-lg",
                feature.hoverColor
              )} />

              {/* Animated Particles - Only visible on hover */}
              {hoveredFeature === index && (
                <>
                  <div className={cn(
                    "absolute top-1/4 right-1/4 w-1 h-1 rounded-full animate-ping",
                    feature.iconColor
                  )} />
                  <div className={cn(
                    "absolute bottom-1/4 left-1/4 w-1 h-1 rounded-full animate-ping",
                    feature.iconColor
                  )} style={{ animationDelay: '0.5s' }} />
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;