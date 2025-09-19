import React from "react";
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useArtContext } from "../context/ArtContext";
import {
  ArrowLeft,
  Heart,
  Share2,
  ShoppingCart,
  User,
  Calendar,
  Tag,
  FileText,
  Banknote,
} from "lucide-react";

import PurchaseModal from "./PurchaseModel";

const NFTArtCard = () => {
  const ipfsBase = "https://gateway.pinata.cloud/ipfs/";
  const { id } = useParams();
  const navigate = useNavigate();
  const { artworks } = useArtContext();

  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  const artwork = artworks.find(
    (art) => art.id.toString() === id && art.is_nft === true
  );

  if (!artwork) {
    return (
      <div className="min-h-screen bg-card flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-600 mb-2">
            NFT Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            This NFT doesn't exist or is not available for sale.
          </p>
          <button
            onClick={() => navigate("/marketplace")}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Back to Marketplace
          </button>
        </div>
      </div>
    );
  }

  const {
    image_url,
    title,
    description,
    username,
    email,
    nft_price,
    license,
    tags,
    created_at_ns,
    media_type,
    mime_type,
    nft_buyer
  } = artwork;

   // Check if NFT is sold
  const isSold = nft_buyer && nft_buyer !== "" && nft_buyer !== "0";

  // Fixed formatDate function to handle BigInt
  const formatDate = (nanoseconds) => {
    try {
      if (!nanoseconds) return "Recently";

      // Convert BigInt to Number if needed
      const nsInt =
        typeof nanoseconds === "bigint" ? Number(nanoseconds) : nanoseconds;

      if (isNaN(nsInt) || nsInt === 0) return "Recently";

      // Convert nanoseconds to milliseconds
      const ms = nsInt / 1000000;
      const date = new Date(ms);

      if (isNaN(date.getTime())) return "Recently";

      return date.toLocaleDateString();
    } catch (error) {
      console.warn("Error formatting date:", error);
      return "Recently";
    }
  };

  // Update the handlePurchase function
  const handlePurchase = () => {
    setShowPurchaseModal(true);
  };

  const handlePurchaseSuccess = (purchasedArtwork) => {
    // TODO: Update the artwork with buyer information
    console.log("NFT purchased:", purchasedArtwork);
    setShowPurchaseModal(false);

    // Optional: Show success toast or redirect
    alert(`Successfully purchased ${purchasedArtwork.title}!`);
  };

  const handleContactArtist = () => {
    if (email && email !== "N/A") {
      window.open(`mailto:${email}?subject=Inquiry about ${title}`, "_blank");
    }
  };

  // Safe conversion for nft_price (might also be BigInt)
  const safePrice =
    typeof nft_price === "bigint" ? Number(nft_price) : nft_price || 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header with Back Button */}
      <div className="bg-card sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate("/marketplace")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Marketplace</span>
          </button>
          <div className="flex items-center gap-3">
            <button className="p-2 text-gray-600 hover:text-red-500 transition-colors">
              <Heart size={20} />
            </button>
            <button className="p-2 text-gray-600 hover:text-blue-500 transition-colors">
              <Share2 size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Image */}
          <div className="space-y-4">
            <div className="bg-card rounded-2xl p-4 shadow-sm relative">
              {" "}
              {/* Add 'relative' here */}
              <img
                src={`${ipfsBase}${image_url}`}
                alt={title}
                className={`w-full aspect-square object-cover rounded-xl ${
                  isSold ? "opacity-75" : ""
                }`}
              />
              {/* Sold Out Overlay - Move inside the image container */}
              {isSold && (
                <div className="absolute inset-4 bg-black bg-opacity-50 rounded-xl flex items-center justify-center">
                  <div className="bg-red-500 text-white px-6 py-3 rounded-xl font-bold text-xl transform -rotate-12 shadow-lg">
                    SOLD OUT
                  </div>
                </div>
              )}
            </div>

            {/* Image Details */}
            <div className="bg-card rounded-xl p-4 shadow-sm">
              <h3 className="font-semibold text-gray-600 mb-3 flex items-center gap-2">
                <FileText size={18} />
                Artwork Details
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {media_type && (
                  <div>
                    <span className="text-gray-500">Media Type:</span>
                    <p className="font-medium">{media_type}</p>
                  </div>
                )}
                {mime_type && (
                  <div>
                    <span className="text-gray-500">File Type:</span>
                    <p className="font-medium">{mime_type}</p>
                  </div>
                )}
                <div>
                  <span className="text-gray-500">License:</span>
                  <p className="font-medium">{license || "Standard"}</p>
                </div>
                <div>
                  <span className="text-gray-500">Created:</span>
                  <p className="font-medium">{formatDate(created_at_ns)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Details */}
          <div className="space-y-6">
            {/* Main Info */}
            <div className="bg-card rounded-2xl p-6 shadow-sm">
              <h1 className="text-3xl font-bold mb-3">{title}</h1>
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                {description}
              </p>

              {/* Artist Info */}
              <div className="flex items-center gap-3 mb-6 p-4 bg-card rounded-xl border-2 border-border">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <User className="text-white" size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Created by</p>
                  <p className="flex items-center gap-2">
                    {username}
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  </p>
                </div>
              </div>

              {/* Tags */}
              {tags && tags.length > 0 && (
                <div className="mb-6 ">
                  <div className="flex items-center gap-2 mb-3">
                    <Tag size={16} className="text-gray-500" />
                    <span className="text-sm text-gray-500">Tags</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Purchase Section */}
            <div className="bg-card rounded-2xl p-6 shadow-sm ">
              <div className="flex items-center gap-2 mb-4">
                <Banknote size={20} className="text-green-500" />
                <span className="text-lg font-semibold text-gray-600">
                  Current Price
                </span>
              </div>

              <div className="mb-6">
                <div className="text-4xl font-bold mb-1">
                  {safePrice}{" "}
                  <span className="text-2xl text-gray-500">ICP</span>
                </div>
                <p className="text-gray-500">
                  ≈ ${(safePrice * 10).toFixed(2)} USD
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handlePurchase}
                  className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-lg"
                >
                  <ShoppingCart size={20} />
                  Buy Now
                </button>

                {email && email !== "N/A" && (
                  <button
                    onClick={handleContactArtist}
                    className="w-full border-2 border-border text-gray-700 py-3 rounded-xl font-semibold hover:border-gray-400 hover:bg-gray-50 transition-colors"
                  >
                    Contact Artist
                  </button>
                )}
              </div>

              <div className="mt-6 p-4 bg-card border-2 border-border rounded-xl">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Service fee</span>
                  <span className="font-medium">2.5%</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="text-gray-500">You will pay</span>
                  <span className="font-bold">
                    {(safePrice * 1.025).toFixed(2)} ICP
                  </span>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="bg-card rounded-2xl p-6 shadow-sm">
              <h3 className="font-semibold text-gray-600 mb-4">
                Blockchain Details
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Blockchain:</span>
                  <span className="font-medium">Internet Computer (ICP)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Token Standard:</span>
                  <span className="font-medium">ICRC-1</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Token ID:</span>
                  <span className="font-medium">#{id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Royalties:</span>
                  <span className="font-medium">10%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <PurchaseModal
        artwork={artwork}
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        onPurchaseSuccess={handlePurchaseSuccess}
      />
    </div>
  );
};

export default NFTArtCard;
