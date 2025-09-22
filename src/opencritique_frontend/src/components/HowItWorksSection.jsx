import React from "react";
import { cn } from "../lib/utils";

const steps = [
  {
    title: "Artists Upload WIPs",
    description:
      "Artists upload works-in-progress (WIPs) hosted on IPFS via Pinata. They can optionally attach token bounties to incentivize feedback.",
    icon: "✨",
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=400&q=80"
  },
  {
    title: "Critics Leave Feedback",
    description:
      "Community critics write detailed, thoughtful feedback. Critiques are stored on-chain and upvoted. Top feedback is rewarded with tokens.",
    icon: "💬",
    image: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=400&q=80"
  },
  {
    title: "DAO Curation",
    description:
      "The DAO governs moderation, features the best artworks, and distributes community bonuses. Curation becomes transparent and collective.",
    icon: "👥",
    image: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80"
  },
];

const HowItWorksSection = () => {
  return (
    <section className="py-20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-heading font-bold mb-4 text-foreground">
            How It Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Transparent, Immutable, Community-Powered
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className={cn(
                "group relative overflow-hidden rounded-xl",
                "transition-all duration-500 hover-lift hover-glow",
                "bg-card border border-border",
                "animate-fade-in"
              )}
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              {/* Card Image with Overlay */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={step.image}
                  alt={step.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                
                {/* Step Number */}
                <div className="absolute top-4 left-4 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                  {index + 1}
                </div>
              </div>
              
              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-heading font-semibold mb-3 text-foreground group-hover:text-primary transition-colors">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
              
              {/* Animated Border Effect */}
              <div className={cn(
                "absolute inset-0 border-2 border-primary/0 rounded-xl pointer-events-none",
                "transition-all duration-500",
                "group-hover:border-primary/50"
              )} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;