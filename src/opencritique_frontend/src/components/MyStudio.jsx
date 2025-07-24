import React, { useEffect, useState } from "react";
import ArtCard from "./ArtCard";
import { opencritique_backend } from "../../../declarations/opencritique_backend";
const ipfsBase = "https://gateway.pinata.cloud/ipfs/";

const MyStudio = () => {
  const [myArtworks, setMyArtworks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyArtworks = async () => {
      try {
        const data = await opencritique_backend.get_my_artworks();
        setMyArtworks(data);
      } catch (err) {
        console.error("Error fetching your artworks:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyArtworks();
  }, []);

  return (
    <div className="p-3 min-h-[90vh] flex flex-col items-center justify-center ">
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : myArtworks.length === 0 ? (
        <p className="text-gray-500 text-lg">No artworks uploaded yet.</p>
      ) : (
        <div className="grid sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-10 lg:px-20 m-10">
          {myArtworks.map((art, index) => (
            <ArtCard
              key={index}
              id={art.id}
              imageSrc={`${ipfsBase}${art.image_url}`}
              username={art.username}
              title={art.title}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyStudio;
