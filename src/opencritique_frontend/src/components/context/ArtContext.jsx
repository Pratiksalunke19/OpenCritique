import React, { createContext, useContext, useEffect, useState } from "react";
import { opencritique_backend } from "../../../../declarations/opencritique_backend";

const ArtContext = createContext();

export const ArtProvider = ({ children }) => {
  const [artworks, setArtworks] = useState([]);
  const [myArtworks, setMyArtworks] = useState([]);
  const [loadingMyArts, setLoadingMyArts] = useState(false);
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
    setLoadingMyArts(true);
    
    try {
      // Check if Plug wallet is connected
      if (!window.ic?.plug?.isConnected()) {
        console.log("❌ Wallet not connected for fetchMyArtworks");
        setMyArtworks([]);
        setLoadingMyArts(false);
        return;
      }

      // Get authenticated principal
      const principal = await window.ic.plug.agent.getPrincipal();
      console.log("🔍 Fetching artworks for principal:", principal.toString());

      // Verify not anonymous
      if (principal.toString() === "2vxsx-fae") {
        console.log("⚠️ Anonymous principal detected, skipping fetch");
        setMyArtworks([]);
        setLoadingMyArts(false);
        return;
      }

      // 🎯 DIRECT BACKEND CALL - No actor creation needed
      console.log("📞 Calling get_my_artworks_using_principal...");
      const artworks = await opencritique_backend.get_my_artworks_using_principal(principal);
      console.log("✅ Fetched my artworks using principal:", artworks.length, "artworks");
      
      // Add image source to each artwork
      const updatedMyArts = artworks.map((art) => ({
        ...art,
        imageSrc: `${ipfsBase}${art.image_url}`,
      }));
      
      setMyArtworks(updatedMyArts);
      
    } catch (error) {
      console.error("❌ Error fetching my artworks:", error);
      console.error("Error details:", error.message);
      setMyArtworks([]);
    } finally {
      setLoadingMyArts(false);
    }
  };

  useEffect(() => {
    fetchArtworks();
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