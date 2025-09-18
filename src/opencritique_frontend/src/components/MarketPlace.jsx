import React, { useState } from "react";
import { useArtContext } from "./context/ArtContext";
import { useNavigate } from "react-router-dom";

const Marketplace = () => {
  const { artworks } = useArtContext();
  const navigate = useNavigate();
  const ipfsBase = "https://gateway.pinata.cloud/ipfs/";
  
  // Filter only NFT artworks
  const nftArtworks = artworks.filter(artwork => artwork.is_nft === true);
  
  // State for filters
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100 });
  const [sortBy, setSortBy] = useState("Recent");

  // Updated click handler for NFT navigation
  const handleArtworkClick = (artworkId, isNft) => {
    if (isNft) {
      navigate(`/nft/${artworkId}`);
    } else {
      navigate(`/artwork/${artworkId}`);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="flex justify-between items-center p-6 border-b border-border animate-fade-in">
        <h1 className="text-3xl font-heading font-bold">Shop NFTs</h1>
        <div className="flex items-center gap-4">
          <span className="text-muted-foreground">{nftArtworks.length.toLocaleString()} Items</span>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Listed:</span>
            <select 
              className="bg-background border border-input rounded px-3 py-1 text-sm text-foreground"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option>Recent</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Most Popular</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar Filters */}
        <div className="w-64 min-h-[60vh] p-6 border-r border-border bg-card gradient-card animate-slide-in-left">
          {/* Price Filter */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold">Price</h3>
              <button className="text-sm text-muted-foreground hover:text-foreground underline">Hide</button>
            </div>
            <div className="space-y-3">
              <div className="flex gap-2">
                <div className="flex-1">
                  <input 
                    type="number" 
                    placeholder="0.50"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange({...priceRange, min: e.target.value})}
                    className="w-full bg-background border border-input rounded px-2 py-1 text-sm"
                  />
                  <span className="text-xs text-muted-foreground ml-1">ICP</span>
                </div>
                <span className="text-muted-foreground mt-1">to</span>
                <div className="flex-1">
                  <input 
                    type="number" 
                    placeholder="1.50"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({...priceRange, max: e.target.value})}
                    className="w-full bg-background border border-input rounded px-2 py-1 text-sm"
                  />
                  <span className="text-xs text-muted-foreground ml-1">ICP</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {nftArtworks.map((artwork) => (
              <div 
                key={artwork.id} 
                className="border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer bg-card interactive-card animate-fade-in"
                onClick={() => handleArtworkClick(artwork.id, artwork.is_nft)}
              >
                {/* Artwork Image */}
                <div className="aspect-square overflow-hidden">
                  <img 
                    src={`${ipfsBase}${artwork.image_url}`}
                    alt={artwork.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                
                {/* Artwork Details */}
                <div className="p-3">
                  <h3 className="font-semibold text-sm mb-1 truncate text-foreground">
                    {artwork.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                    <span className="w-2 h-2 bg-accent rounded-full"></span>
                    {artwork.username}
                  </p>
                  
                  {/* Price - Updated to use nft_price for NFTs */}
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Buy now</div>
                    <div className="font-bold text-sm text-foreground">
                      {artwork.nft_price || artwork.bounty || "0"} ICP
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {nftArtworks.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No NFT artworks available</p>
              <p className="text-muted-foreground text-sm mt-2">Check back later for new listings</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Marketplace;