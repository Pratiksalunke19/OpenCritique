import React, { useEffect, useState, useCallback } from "react";
import MyStudioArtCard from "./MyStudioArtCard";
import { useArtContext } from "./context/ArtContext";
import { useUserContext } from "./context/UserContext";

const MyStudio = () => {
  const ipfsBase = "https://gateway.pinata.cloud/ipfs/";
  const [isInitialized, setIsInitialized] = useState(false);

  const { myArtworks, fetchMyArtworks, loadingMyArts } = useArtContext();
  const { isConnected, principal } = useUserContext();

  // 🔑 KEY FIX: Memoized function to prevent re-creation
  const initializeMyStudio = useCallback(async () => {
    if (isInitialized) return; // Prevent multiple calls
    
    try {
      const isPlugConnected = await window.ic?.plug?.isConnected?.();
      
      if (isPlugConnected && isConnected && principal && principal !== "2vxsx-fae") {
        console.log("🎨 Initializing MyStudio once");
        await fetchMyArtworks();
        setIsInitialized(true); // Mark as initialized
      }
    } catch (error) {
      console.error("❌ MyStudio initialization error:", error);
    }
  }, [isConnected, principal, fetchMyArtworks, isInitialized]);

  // 🎯 FIXED: Stable effect with proper dependencies
  useEffect(() => {
    if (isConnected && principal && !isInitialized) {
      initializeMyStudio();
    }
  }, [isConnected, principal, initializeMyStudio, isInitialized]);

  // Reset initialization when authentication changes
  useEffect(() => {
    if (!isConnected || !principal) {
      setIsInitialized(false);
    }
  }, [isConnected, principal]);

  return (
    <div className="p-8 min-h-[90vh] flex flex-col items-center justify-center mt-[70px]">
      {!isConnected ? (
        <div className="text-center">
          <p className="text-gray-400 text-lg mb-4">Connect your Plug wallet to view your artworks</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg"
          >
            Connect Wallet
          </button>
        </div>
      ) : loadingMyArts ? (
        <div className="flex justify-center items-center h-40">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="ml-4 text-gray-400">Loading your artworks...</p>
        </div>
      ) : myArtworks?.length === 0 ? (
        <div className="text-center">
          <p className="text-gray-500 text-lg mb-4">No artworks uploaded yet</p>
          <p className="text-gray-400 text-sm">Principal: {principal?.substring(0, 20)}...</p>
        </div>
      ) : (
        <div className="flex w-full h-full flex-col">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-white mb-2">My Studio</h2>
            <p className="text-gray-400">
              {myArtworks.length} artwork{myArtworks.length !== 1 ? 's' : ''} found
            </p>
          </div>
          
          {myArtworks.map((art, index) => (
            <MyStudioArtCard
              key={`artwork-${art.id}`} // 🔑 Stable key
              id={art.id}
              imageSrc={`${ipfsBase}${art.image_url}`}
              username={art.username}
              title={art.title}
              desc={art.description}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyStudio;
