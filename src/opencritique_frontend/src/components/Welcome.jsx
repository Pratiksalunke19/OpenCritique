import React, { useEffect, useState } from "react";
import ArtCard from "./ArtCard";
import { useArtContext } from "./context/ArtContext";
import { ChevronDown } from "lucide-react";

const Welcome = () => {
  const ipfsBase = "https://gateway.pinata.cloud/ipfs/";
  const { artworks } = useArtContext();
  const [visibleCount, setVisibleCount] = useState(12);

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 12);
  };

  return (
    <div className="p-6 mt-[70px]">
      {/* <h2 className="text-2xl font-bold text-primary mb-6">Discover Art</h2> */}

      <div className="grid sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-10 lg:px-20 m-10">
        {artworks.slice(0, visibleCount).map((art, index) => (
          <ArtCard
            key={index}
            id={art.id}
            imageSrc={`${ipfsBase}${art.image_url}`}
            username={art.username}
            title={art.title}
          />
        ))}
      </div>

      {visibleCount < artworks.length && (
        <div className="flex justify-center my-6">
          <button
            onClick={handleLoadMore}
            className="flex items-center gap-2 text-white bg-primary px-6 py-2 rounded-full shadow-md hover:bg-opacity-80 transition-all"
          >
            Load More <ChevronDown />
          </button>
        </div>
      )}
    </div>
  );
};

export default Welcome;
