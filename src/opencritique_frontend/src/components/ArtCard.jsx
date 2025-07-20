// src/components/ArtCard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const ArtCard = ({ imageSrc, username, id }) => {

  const navigate = useNavigate();

  const handleClick = () =>{
    navigate(`/art/${id}`)
  };

  return (
    <div className="relative group w-full aspect-[3/4] overflow-hidden rounded-lg bg-bg-panel shadow hover:scale-105 transition-transform duration-300" onClick={handleClick}>
      <img
        src={imageSrc}
        loading="lazy"
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
