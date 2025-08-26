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
    try {
      // Ensure authenticated call
      if (!window.ic?.plug?.isConnected()) {
        console.log("Wallet not connected");
        setMyArtworks([]);
        return;
      }

      // Get authenticated principal
      const principal = await window.ic.plug.agent.getPrincipal();
      console.log("Fetching artworks for principal:", principal.toString());

      // Create authenticated actor for the call
      const authActor = await window.ic.plug.createActor({
        canisterId: "bkyz2-fmaaa-aaaaa-qaaaq-cai",
        interfaceFactory: opencritique_backend.idlFactory,
      });

      const artworks = await authActor.get_my_artworks();
      console.log("Fetched my artworks:", artworks);
      setMyArtworks(artworks);
    } catch (error) {
      console.error("Error fetching my artworks:", error);
      setMyArtworks([]);
    }
  };

  useEffect(() => {
    fetchArtworks();
    // fetchMyArtworks();
  }, []);

  return (
    <ArtContext.Provider
      value={{
        artworks,
        fetchArtworks,
        myArtworks,
        fetchMyArtworks,
        loadingMyArts,
      }}
    >
      {children}
    </ArtContext.Provider>
  );
};

export const useArtContext = () => useContext(ArtContext);
