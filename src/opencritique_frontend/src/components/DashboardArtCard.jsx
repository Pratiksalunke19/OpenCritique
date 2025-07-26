// src/components/DashboardArtCard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const DashboardArtCard = ({ imageSrc, username, id, title,desc }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/art/${id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="w-full flex items-center gap-4 p-4 bg-bg-panel cursor-pointer rounded-xl hover:ring-2 hover:ring transition-all duration-300 hover:scale-105 transition-transform duration-300"
    >
      {/* Image section */}
      <div className="w-32 h-32 flex-shrink-0 overflow-hidden rounded-lg">
        <img
          src={imageSrc}
          alt="art"
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      {/* Text/content section */}
      <div className="flex flex-col justify-start h-full text-left">
        <h3 className="text-xl font-semibold text-white mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
};

export default DashboardArtCard;
