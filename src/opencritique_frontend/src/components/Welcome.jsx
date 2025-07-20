// src/components/Welcome.jsx
import React from "react";
import ArtCard from "./ArtCard";
import artData from "../images_cid";
import { useArt } from "../context/ArtContext";
import { useEffect } from "react";

const Welcome = () => {
  const ipfsBase = "https://gateway.pinata.cloud/ipfs/";

  // const { artData, setArtData } = useArt();

  // useEffect(() => {
  //   const fetchArt = async () => {
  //     const res = await fetch("/api/arts"); // or ICP call
  //     const data = await res.json();
  //     setArtData(data);
  //   };

  //   if (artData.length === 0) fetchArt(); // don’t refetch if already loaded
  // }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-primary mb-6">Discover Art</h2>
      <div className="grid sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6 lg:px-20 m-10">
        {artData.map((art, index) => (
          <ArtCard
            key={index}
            id={index}
            imageSrc={`${ipfsBase}${art.cid}`}
            username={art.username}
          />
        ))}
      </div>
    </div>
  );
};

export default Welcome;
