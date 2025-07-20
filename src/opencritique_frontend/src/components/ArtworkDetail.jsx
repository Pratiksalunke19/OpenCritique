import React from "react";
import { useParams } from "react-router-dom";
import { useArt } from "../context/ArtContext"; // adjust path as needed

const ArtworkDetail = () => {
  const { id } = useParams();
  const { artworks } = useArt(); // ✅ get artworks from context

  const art = artworks.find((item) => String(item.id) === id);

  if (!art) return <div className="p-6">Artwork not found</div>;

  return (
    <div className="flex flex-col md:flex-row p-8 gap-10">
      {/* Left: Image */}
      <div className="flex-1">
        <img
          src={`https://gateway.pinata.cloud/ipfs/${art.cid}`}
          alt={art.title}
          className="w-full max-h-[80vh] object-contain rounded-lg shadow"
        />
      </div>

      {/* Right: Details */}
      <div className="flex-1 space-y-4">
        <h1 className="text-3xl font-bold">{art.title}</h1>
        <p className="text-sm text-gray-500">By {art.username}</p>
        <p className="text-base">{art.description}</p>

        <button className="mt-6 px-4 py-2 bg-primary text-white rounded hover:bg-opacity-80 transition">
          Write a Critique
        </button>
      </div>
    </div>
  );
};

export default ArtworkDetail;
