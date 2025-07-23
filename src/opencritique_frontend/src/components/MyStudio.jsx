import React, { useEffect, useState } from "react";
import ArtCard from "./ArtCard"; // Same card used in Welcome.jsx
import { opencritique_backend } from "../../../declarations/opencritique_backend";
const ipfsBase = "https://gateway.pinata.cloud/ipfs/";

const MyStudio = () => {
  const [myArtworks, setMyArtworks] = useState([]);

  useEffect(() => {
    const fetchMyArtworks = async () => {
      try {
        const data = await opencritique_backend.get_my_artworks();
        console.log(data);
        setMyArtworks(data);
      } catch (err) {
        console.error("Error fetching your artworks:", err);
      }
    };

    fetchMyArtworks();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-primary mb-6">My Studio</h2>

      {myArtworks.length === 0 ? (
        <p className="text-gray-500 text-lg">No artworks uploaded yet.</p>
      ) : (
        <div className="grid sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-10 lg:px-20 m-10">
          {myArtworks.map((art, index) => (
            <ArtCard
              key={index}
              id={art.id}
              imageSrc={`${ipfsBase}${art.image_url}`}
              username={art.username}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyStudio;
