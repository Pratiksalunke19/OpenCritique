import React, { useEffect, useState } from "react";
import ArtCard from "./ArtCard";
import { opencritique_backend } from "../../../declarations/opencritique_backend";

const Welcome = () => {
  const [artworks, setArtworks] = useState([]);
  const ipfsBase = "https://gateway.pinata.cloud/ipfs/";

  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        const arts = await opencritique_backend.get_artworks();
        setArtworks(arts);
      } catch (error) {
        console.error("Failed to fetch artworks:", error);
      }
    };

    fetchArtworks();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-primary mb-6">Discover Art</h2>
      <div className="grid sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6 lg:px-20 m-10">
        {artworks.map((art, index) => (
          <ArtCard
            key={index}
            id={art.id}
            imageSrc={`${ipfsBase}${art.image_url}`} // image_url = cid
            username={art.username}
          />
        ))}
      </div>
    </div>
  );
};

export default Welcome;
