import React from 'react';
import { useNavigate } from 'react-router-dom';

const MyStudioArtCard = ({ imageSrc, username, id, title, desc }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/art/${id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="w-full flex flex-col min-h-80 md:flex-row items-center bg-bg-panel rounded-xl shadow-md overflow-hidden cursor-pointer hover:ring-2 hover:ring transition-all duration-300 hover:scale-105 transition-transform duration-300 m-4"
    >
      {/* Image */}
      <div className="w-full max-h-[400px] md:w-1/3 w:1/3 overflow-hidden">
        <img
          src={imageSrc}
          alt="artwork"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Text Content */}
      <div className="w-full md:w-2/3 p-4 flex flex-col justify-between text-white">
        <h3 className="text-xl font-semibold mb-1">{title}</h3>
        <p className="text-sm text-gray-300 mb-2">{desc}</p>
      </div>
    </div>
  );
};

export default MyStudioArtCard;
