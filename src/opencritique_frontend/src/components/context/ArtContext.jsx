// src/context/ArtContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { opencritique_backend } from "../../../../declarations/opencritique_backend";

const ArtContext = createContext();

export const ArtProvider = ({ children }) => {
  const [artworks, setArtworks] = useState([]);
  const ipfsBase = "https://gateway.pinata.cloud/ipfs/";

  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        const arts = await opencritique_backend.get_artworks();
        // Attach IPFS imageSrc here so it's always ready
        const updatedArts = arts.map((art) => ({
          ...art,
          imageSrc: `${ipfsBase}${art.image_url}`,
        }));
        setArtworks(updatedArts);
      } catch (error) {
        console.error("Failed to fetch artworks:", error);
      }
    };

    fetchArtworks();
  }, []);

  return (
    <ArtContext.Provider value={{ artworks }}>
      {children}
    </ArtContext.Provider>
  );
};

export const useArtContext = () => useContext(ArtContext);
