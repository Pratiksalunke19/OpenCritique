import React from "react";

const CircleCard = ({ label, value }) => (
  <div className="flex flex-col items-center justify-center w-32 h-32 bg-bg-panel rounded-full hover:ring-2 hover:ring-primary transition-all duration-300 hover:scale-105 transition-transform duration-300 text-center">
    <div className="text-2xl font-bold">{value}</div>
    <div className="text-sm text-gray-300 mt-1">{label}</div>
  </div>
);

const StatsCircle = ({ uploads, critiques, upvotes, rank }) => {
  return (
    <div className="flex gap-48 mt-2">
      <CircleCard label="Artworks" value={uploads} />
      <CircleCard label="Critiques" value={critiques} />
      <CircleCard label="Upvotes" value={upvotes} />
      <CircleCard label="Rank" value={rank} />
    </div>
  );
};

export default StatsCircle;
