// src/components/ArtCard.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';

const ArtCard = ({ imageSrc, username, id, title, critiques = 0 }) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleClick = () => {
    navigate(`/art/${id}`);
  };

  return (
    <div 
      className={cn(
        "relative group w-full aspect-[3/4] overflow-hidden rounded-xl",
        "bg-card border border-border",
        "transform transition-all duration-500 ease-out",
        "hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/20",
        "before:absolute before:inset-0 before:bg-gradient-to-br before:from-primary/5 before:to-accent/5",
        "before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100",
        "cursor-pointer animate-fade-in"
      )}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container with Loading Effect */}
      <div className="aspect-square relative overflow-hidden bg-muted">
        {!imageLoaded && (
          <div className="absolute inset-0 shimmer" />
        )}
        <img
          src={imageSrc}
          alt={title || 'Artwork'}
          loading="lazy"
          className={cn(
            "w-full h-full object-cover transition-all duration-700",
            "group-hover:scale-110 group-hover:rotate-1",
            imageLoaded ? "opacity-100" : "opacity-0"
          )}
          onLoad={() => setImageLoaded(true)}
        />

        {/* Animated Overlay */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent",
          "transition-all duration-500",
          isHovered ? "opacity-100" : "opacity-0"
        )} />

        {/* Rating Badge */}
        <div className={cn(
          "absolute top-4 left-4 flex items-center space-x-1",
          "bg-black/50 backdrop-blur-sm rounded-full px-2 py-1",
          "transition-all duration-300",
          isHovered ? "opacity-100 scale-100" : "opacity-0 scale-95"
        )}>
          <span className="text-yellow-400 text-xs">★</span>
          <span className="text-white text-xs font-medium">4.8</span>
        </div>

        {/* Bottom Info Overlay */}
        <div className={cn(
          "absolute bottom-0 left-0 right-0 p-4",
          "transform transition-all duration-500",
          isHovered ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
        )}>
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-full bg-primary/80 flex items-center justify-center">
                <span className="text-xs font-bold">💬</span>
              </div>
              <span className="text-sm font-medium">{critiques} critiques</span>
            </div>
            <div className="text-xs">
              <span>by {username || 'Anonymous'}</span>
            </div>
          </div>
        </div>

        {/* Shine Effect */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent",
          "transform -skew-x-12 transition-transform duration-1000",
          isHovered ? "translate-x-full" : "-translate-x-full"
        )} />
      </div>

      {/* Title Overlay - Visible on non-hover */}
      <div className={cn(
        "absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent",
        "transition-opacity duration-300",
        isHovered ? "opacity-0" : "opacity-100"
      )}>
        <h3 className="text-white text-lg font-semibold truncate">{title}</h3>
      </div>

      {/* Floating Particles - Only visible on hover */}
      {isHovered && (
        <>
          <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-primary rounded-full animate-ping" />
          <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-accent rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
          <div className="absolute top-1/2 right-1/3 w-1 h-1 bg-success rounded-full animate-ping" style={{ animationDelay: '1s' }} />
        </>
      )}
    </div>
  );
};

export default ArtCard;
