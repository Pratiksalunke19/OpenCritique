import React, { useEffect, useState } from "react";
import MyStudioArtCard from "./MyStudioArtCard";
import { opencritique_backend } from "../../../declarations/opencritique_backend";
import { useArtContext } from "./context/ArtContext";

const MyStudio = () => {
  const ipfsBase = "https://gateway.pinata.cloud/ipfs/";
  const [connect, updateConnect] = useState(false);

  const { myArtworks, fetchMyArtworks, loadingMyArts } = useArtContext();

  useEffect(() => {
      const checkConnection = async () => {
        const isConnected = await window.ic?.plug?.isConnected?.();
        if (isConnected) {
          updateConnect(true);
        }
      };
  
      checkConnection();
  
      fetchMyArtworks();
    }, []);

  return (
    <div className="p-8 min-h-[90vh] flex flex-col items-center justify-center mt-[70px] ">
      {loadingMyArts ? (
        <div className="flex justify-center items-center h-40">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : myArtworks.length === 0 ? (
        <p className="text-gray-500 text-lg">No artworks uploaded yet.</p>
      ) : (
        <div className="flex w-full h-full flex-col">
          {myArtworks.map((art, index) => (
            <MyStudioArtCard
              key={index}
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
