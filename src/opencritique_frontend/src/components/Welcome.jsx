// src/components/Welcome.jsx
import React from 'react';
import ArtCard from './ArtCard';

const Welcome = () => {
  // Dummy data (20 users, 20 images)
  const artData = Array.from({ length: 20 }, (_, i) => ({
    image: `/demo${i + 1}.jpg`,
    username: `User${i + 1}`
  }));

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-primary mb-6">Discover Art</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {artData.map((art, index) => (
          <ArtCard key={index} imageSrc={art.image} username={art.username} />
        ))}
      </div>
    </div>
  );
};

export default Welcome;
