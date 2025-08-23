import React, { useState, useEffect } from "react";
import Masonry from "react-masonry-css";
import ArtCard from "./ArtCard";
import { useArtContext } from "./context/ArtContext";
import { ChevronDown } from "lucide-react";
import MusicCover from "../assets/music_cover.jpg";

const STORAGE_KEY = "opencritique_shuffled_v1";

const Welcome = () => {
  const ipfsBase = "https://gateway.pinata.cloud/ipfs/";
  const { artworks } = useArtContext();
  const [visibleCount, setVisibleCount] = useState(12);
  const [shuffledArtworks, setShuffledArtworks] = useState([]);
  const [filter, setFilter] = useState("all"); // <-- filter state

  // Shuffle function (Fisher-Yates)
  const shuffleArray = (array) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  // Helper to check if saved shuffle matches current artworks by id & length
  const savedMatches = (savedArr, currentArr) => {
    if (!Array.isArray(savedArr) || !Array.isArray(currentArr)) return false;
    if (savedArr.length !== currentArr.length) return false;
    const savedIds = savedArr.map((a) => a.id).sort();
    const currIds = currentArr.map((a) => a.id).sort();
    return savedIds.every((id, idx) => id === currIds[idx]);
  };

  // Shuffle once: try sessionStorage first; otherwise shuffle and persist
  useEffect(() => {
    if (!artworks || artworks.length === 0) return;

    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (savedMatches(parsed, artworks)) {
          setShuffledArtworks(parsed);
          return;
        }
      }
    } catch (e) {
      // ignore parse errors and re-shuffle
    }

    const shuffled = shuffleArray(artworks);
    setShuffledArtworks(shuffled);

    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(shuffled));
    } catch (e) {
      // storage might be full/disabled — ignore
    }
  }, [artworks]);

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 12);
  };

  const breakpointColumnsObj = {
    default: 4,
    1600: 5,
    1200: 4,
    992: 3,
    768: 2,
    500: 1,
  };

  // Apply filter
  const filteredArtworks = shuffledArtworks.filter((art) => {
    const isAudio =
      Array.isArray(art.media_type) &&
      art.media_type.some(
        (type) =>
          type.toLowerCase() === "audio" || type.toLowerCase() === "music"
      );

      console.log("arts: ",art)

    if (filter === "withBounty") return Number(art.feedback_bounty) > 0;
    if (filter === "withoutBounty") return Number(art.feedback_bounty) === 0;
    if (filter === "audio") return isAudio;
    return true; // "all"
  });

  return (
    <div className="p-6 mt-[100px] ">
      {/* --- FILTER BAR --- */}
      <div className="flex flex-wrap gap-3 mb-6 justify-start">
        {[
          { key: "all", label: "All" },
          { key: "withBounty", label: "With Bounty" },
          { key: "withoutBounty", label: "Without Bounty" },
        ].map((opt) => (
          <button
            key={opt.key}
            onClick={() => {
              setFilter(opt.key);
              setVisibleCount(12); // reset paging
            }}
            className={`px-4 py-2 rounded-full shadow-md transition-all ${
              filter === opt.key
                ? "bg-primary text-white"
                : "bg-dark text-gray-300 hover:bg-opacity-70"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* --- ARTWORK GRID --- */}
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="flex w-auto gap-4"
        columnClassName="bg-clip-padding"
      >
        {filteredArtworks.slice(0, visibleCount).map((art) => {
          const isAudio =
            Array.isArray(art.media_type) &&
            art.media_type.some(
              (type) =>
                type.toLowerCase() === "audio" || type.toLowerCase() === "music"
            );

          const displaySrc = isAudio ? MusicCover : `${ipfsBase}${art.image_url}`;
          const hasBounty = Number(art.feedback_bounty) > 0;

          return (
            <div
              key={art.id}
              className={`mb-4 p-[3px] rounded-2xl ${
                hasBounty ? "animated-border" : "bg-transparent"
              }`}
            >
              <div className="bg-dark rounded-xl overflow-hidden shadow-lg">
                <ArtCard
                  id={art.id}
                  imageSrc={displaySrc}
                  username={art.username}
                  title={art.title}
                />
              </div>
            </div>
          );
        })}
      </Masonry>

      {visibleCount < filteredArtworks.length && (
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
