// src/context/ArtContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { opencritique_backend } from "../../../../declarations/opencritique_backend";

const ArtContext = createContext();

export const ArtProvider = ({ children }) => {
  const [artworks, setArtworks] = useState([]);
  const ipfsBase = "https://gateway.pinata.cloud/ipfs/";

  const fetchArtworks = async () => {
    try {
      const arts = await opencritique_backend.get_artworks();
      const updatedArts = arts.map((art) => ({
        ...art,
        imageSrc: `${ipfsBase}${art.image_url}`,
      }));
      setArtworks(updatedArts);
    } catch (error) {
      console.error("Failed to fetch artworks:", error);
    }
  };

  useEffect(() => {
    fetchArtworks();
  }, []);

  return (
    <ArtContext.Provider value={{ artworks, fetchArtworks }}>
      {children}
    </ArtContext.Provider>
  );
};

export const useArtContext = () => useContext(ArtContext);
