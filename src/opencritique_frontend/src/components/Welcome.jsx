// src/components/Welcome.jsx
import React from "react";
import ArtCard from "./ArtCard";
import artData from "../images_cid";

const Welcome = () => {
  const ipfsBase = "https://gateway.pinata.cloud/ipfs/";

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-primary mb-6">Discover Art</h2>
      <div className="grid sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6 lg:px-20 m-10">
        {artData.map((art, index) => (
          <ArtCard
            key={index}
            imageSrc={`${ipfsBase}${art.cid}`}
            username={art.username}
          />
        ))}
      </div>
    </div>
  );
};

export default Welcome;
