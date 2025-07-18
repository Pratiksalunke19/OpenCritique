// src/components/ArtCard.jsx
import React from 'react';

const ArtCard = ({ imageSrc, username }) => {
  return (
    <div className="relative group w-full aspect-[3/4] overflow-hidden rounded-lg bg-bg-panel shadow hover:scale-105 transition-transform duration-300">
      <img
        src={imageSrc}
        alt="art"
        className="object-cover w-full h-full"
      />
      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
        <span className="text-white text-lg font-semibold">{username}</span>
      </div>
    </div>
  );
};

export default ArtCard;
