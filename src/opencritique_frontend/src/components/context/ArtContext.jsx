// src/context/ArtContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { opencritique_backend } from "../../../../declarations/opencritique_backend";

const ArtContext = createContext();

export const ArtProvider = ({ children }) => {
  const [artworks, setArtworks] = useState([]);
  const [myArtworks, setMyArtworks] = useState([]);
  const [loadingMyArts, setLoadingMyArts] = useState(true);
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

const fetchMyArtworks = async () => {
  if (myArtworks.length > 0) return;
  try {
    setLoadingMyArts(true);
    const data = await opencritique_backend.get_my_artworks();
    const updated = data.map((art) => ({
      ...art,
      imageSrc: `${ipfsBase}${art.image_url}`,
    }));
    setMyArtworks(updated);
  } catch (error) {
    console.error("Failed to fetch user artworks:", error);
  } finally {
    setLoadingMyArts(false);
  }
};

  useEffect(() => {
    fetchArtworks();
    // fetchMyArtworks();
  }, []);

  return (
    // <ArtContext.Provider value={{ artworks, fetchArtworks }}>
    //   {children}
    // </ArtContext.Provider>
    <ArtContext.Provider value={{ artworks, fetchArtworks,myArtworks,fetchMyArtworks,loadingMyArts }}>
      {children}
    </ArtContext.Provider>
  );
};

export const useArtContext = () => useContext(ArtContext);
