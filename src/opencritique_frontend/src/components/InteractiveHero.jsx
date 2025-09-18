import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';

const InteractiveHero = () => {
  const [currentText, setCurrentText] = useState('');
  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [particles, setParticles] = useState([]);
  const heroRef = useRef(null);
  const navigate = useNavigate();

  const texts = [
    'Share Your Art',
    'Get Expert Feedback',
    'Join the Community',
    'Grow as an Artist'
  ];

  // Typing animation effect
  useEffect(() => {
    const timeout = setTimeout(() => {
      const currentFullText = texts[textIndex];
      
      if (!isDeleting) {
        if (charIndex < currentFullText.length) {
          setCurrentText(currentFullText.substring(0, charIndex + 1));
          setCharIndex(charIndex + 1);
        } else {
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        if (charIndex > 0) {
          setCurrentText(currentFullText.substring(0, charIndex - 1));
          setCharIndex(charIndex - 1);
        } else {
          setIsDeleting(false);
          setTextIndex((textIndex + 1) % texts.length);
        }
      }
    }, isDeleting ? 50 : 100);

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, textIndex, texts]);

  // Subtle particle system
  useEffect(() => {
    const createParticle = () => ({
      id: Math.random(),
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1, // Smaller particles
      opacity: Math.random() * 0.3 + 0.1, // More subtle opacity
      speed: Math.random() * 1 + 0.5, // Slower movement
      direction: Math.random() * 360,
    });

    const initialParticles = Array.from({ length: 12 }, createParticle); // Fewer particles
    setParticles(initialParticles);

    const interval = setInterval(() => {
      setParticles(prev => prev.map(particle => ({
        ...particle,
        x: (particle.x + Math.cos(particle.direction) * particle.speed * 0.05) % 100,
        y: (particle.y + Math.sin(particle.direction) * particle.speed * 0.05) % 100,
      })));
    }, 150); // Slower update rate

    return () => clearInterval(interval);
  }, []);

  const handleConnectWallet = async () => {
    const hasAllowed = await window.ic?.plug?.requestConnect();
    if (hasAllowed) {
      alert("Plug wallet is connected");
    } else {
      alert("Plug wallet connection was refused");
    }
  };

  const handleExplore = () => {
    navigate('/trending');
  };

  const stats = [
    { icon: "👥", value: '10K+', label: 'Artists' },
    { icon: "⭐", value: '50K+', label: 'Artworks' },
    { icon: "⚡", value: '100K+', label: 'Critiques' },
  ];

  return (
    <section 
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden gradient-hero"
    >
      {/* Subtle Background Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full bg-gradient-to-br from-primary/10 to-accent/10 backdrop-blur-sm"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              opacity: particle.opacity,
              animation: `float ${6 + particle.id * 2}s ease-in-out infinite`,
              animationDelay: `${particle.id * 0.2}s`,
            }}
          />
        ))}
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Main Heading with Animations */}
          <div className="mb-8 animate-slide-in-left">
            <h1 className="text-5xl md:text-7xl font-heading font-bold mb-6">
              <span className="gradient-text">OpenCritique</span>
            </h1>
            <div className="text-2xl md:text-4xl font-medium text-foreground mb-4">
              Where Artists{' '}
              <span className="text-primary font-bold">
                {currentText}
                <span className="animate-pulse text-accent">|</span>
              </span>
            </div>
          </div>

          {/* Description */}
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto animate-slide-in-right">
            Join the world's most supportive creative community. Share your artwork, 
            receive constructive feedback, and grow as an artist with peers and mentors.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-fade-in">
            <button 
              className={cn(
                "px-8 py-4 rounded-lg gradient-primary text-primary-foreground",
                "hover:opacity-90 transition-all duration-300",
                "shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30",
                "interactive-button flex items-center justify-center text-lg font-medium"
              )}
              onClick={handleConnectWallet}
            >
              <span className="mr-2">👛</span>
              Connect Wallet to Start
              <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
            </button>
            <button 
              className={cn(
                "px-8 py-4 rounded-lg border border-border text-foreground",
                "hover:bg-primary/10 hover:text-primary transition-all duration-300",
                "hover:border-primary/50 hover:shadow-md hover:shadow-primary/10",
                "interactive-button flex items-center justify-center text-lg font-medium"
              )}
              onClick={handleExplore}
            >
              <span className="mr-2">✨</span>
              Explore Trending
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto animate-slide-up">
            {stats.map((stat, index) => (
              <div 
                key={index}
                className="glass rounded-xl p-6 text-center hover-glow interactive-card"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="text-3xl mb-3 animate-float">{stat.icon}</div>
                <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-float">
        <div className="w-6 h-10 border-2 border-primary/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-primary rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default InteractiveHero;