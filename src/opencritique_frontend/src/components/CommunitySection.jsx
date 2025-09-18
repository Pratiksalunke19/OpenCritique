import React from "react";
import { cn } from "../lib/utils";

const CommunitySection = () => {
  const critiqueTips = [
    "Be specific, not vague",
    "Point out what's working",
    "Suggest, don't dictate",
    "Be kind but honest"
  ];

  const feedbackTips = [
    "Focus on technique, not taste",
    "Use art terms where possible",
    "Encourage experimentation",
    "Respect the artist's intent"
  ];

  const communityLinks = [
    {
      title: "Join our Discord",
      icon: "💬",
      url: "https://discord.gg/wBxmyWWC",
      color: "bg-indigo-600 hover:bg-indigo-700 text-white"
    },
    {
      title: "Contribute on GitHub",
      icon: "🔧",
      url: "https://github.com/Pratiksalunke19/OpenCritique",
      color: "bg-card border border-border hover:bg-primary/10 hover:text-primary text-foreground"
    },
    {
      title: "Join the DAO",
      icon: "🏛️",
      url: "#",
      color: "gradient-primary text-white"
    }
  ];

  return (
    <section className="py-20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-heading font-bold mb-4 text-foreground">
            Join the Community
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Connect with artists and critics from around the world
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Critique Tips Card */}
          <div className={cn(
            "bg-card border border-border rounded-xl p-6 shadow-lg",
            "transition-all duration-300 hover-lift hover-glow",
            "animate-fade-in"
          )}>
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-xl mr-3">
                ✨
              </div>
              <h3 className="text-xl font-heading font-semibold text-foreground">
                What Makes a Great Critique?
              </h3>
            </div>
            <ul className="space-y-3">
              {critiqueTips.map((tip, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span className="text-muted-foreground">{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Feedback Tips Card */}
          <div className={cn(
            "bg-card border border-border rounded-xl p-6 shadow-lg",
            "transition-all duration-300 hover-lift hover-glow",
            "animate-fade-in",
            "animation-delay-200"
          )}>
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-xl mr-3">
                🎨
              </div>
              <h3 className="text-xl font-heading font-semibold text-foreground">
                How to Give Better Feedback
              </h3>
            </div>
            <ul className="space-y-3">
              {feedbackTips.map((tip, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-accent mr-2">•</span>
                  <span className="text-muted-foreground">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Call to Action */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 animate-fade-in animation-delay-400">
          {communityLinks.map((link, index) => (
            <a
              key={index}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium",
                "transition-all duration-300 hover-lift",
                "interactive-button",
                link.color
              )}
              style={{ animationDelay: `${index * 0.1 + 0.4}s` }}
            >
              <span className="text-xl">{link.icon}</span> {link.title}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CommunitySection;