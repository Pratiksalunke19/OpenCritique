import React, { useState, useEffect } from "react";
import Masonry from "react-masonry-css";
import ArtCard from "./ArtCard";
import { useArtContext } from "./context/ArtContext";
import { ChevronDown } from "lucide-react";
import MusicCover from "../music_cover.jpg"

const Welcome = () => {
  const ipfsBase = "https://gateway.pinata.cloud/ipfs/";
  const { artworks } = useArtContext();
  const [visibleCount, setVisibleCount] = useState(12);
  const [shuffledArtworks, setShuffledArtworks] = useState([]);

  // Shuffle function (Fisher-Yates)
  const shuffleArray = (array) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  // Shuffle artworks on first load or when artworks change
  useEffect(() => {
    if (artworks && artworks.length > 0) {
      setShuffledArtworks(shuffleArray(artworks));
    }
  }, [artworks]);

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 12);
  };

  // Breakpoints for responsive masonry columns
  const breakpointColumnsObj = {
    default: 4,
    1600: 5,
    1200: 4,
    992: 3,
    768: 2,
    500: 1,
  };

  return (
    <div className="p-6 mt-[70px]">
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="flex w-auto gap-4"
        columnClassName="bg-clip-padding"
      >
        {console.log("music-cover: ",MusicCover)}
        {shuffledArtworks.slice(0, visibleCount).map((art, index) => {
          // Check media type
          console.log("art",art);
          const isAudio = art.media_type === "Audio" || art.media_type === "audio";
          const displaySrc = isAudio
            ? "src/music_cover.jpg"
            : `${ipfsBase}${art.image_url}`;

          return (
            <div key={index} className="mb-4">
              <ArtCard
                id={art.id}
                imageSrc={displaySrc}
                username={art.username}
                title={art.title}
              />
            </div>
          );
        })}
      </Masonry>

      {visibleCount < shuffledArtworks.length && (
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
