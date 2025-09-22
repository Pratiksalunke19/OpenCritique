import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import MyStudioArtCard from "./MyStudioArtCard";
import { useArtContext } from "./context/ArtContext";
import { useUserContext } from "./context/UserContext";
import { supabase } from "../lib/supabaseClient";
import { opencritique_backend } from "../../../declarations/opencritique_backend";

const MyStudio = ({ userProfile, updateProfile, likedArtworkIds = [], purchasedNftIds = [] }) => {
  const navigate = useNavigate();
  const ipfsBase = "https://gateway.pinata.cloud/ipfs/";
  const [isInitialized, setIsInitialized] = useState(false);
  const [activeTab, setActiveTab] = useState("created");
  const [displayCount, setDisplayCount] = useState(12);

  const { myArtworks, fetchMyArtworks, loadingMyArts } = useArtContext();
  const { isConnected, principal } = useUserContext();

  // State for liked artworks and purchased NFTs
  const [likedArtworks, setLikedArtworks] = useState([]);
  const [purchasedNFTs, setPurchasedNFTs] = useState([]);
  const [loadingLiked, setLoadingLiked] = useState(false);
  const [loadingPurchased, setLoadingPurchased] = useState(false);

  // 🔥 CRITICAL FIX: BigInt conversion utilities
  const safeBigIntToNumber = (value) => {
    if (typeof value === 'bigint') {
      return Number(value);
    }
    if (typeof value === 'string') {
      return parseFloat(value) || 0;
    }
    return value || 0;
  };

  const convertArtworkBigInts = (artwork) => {
    if (!artwork) return artwork;
    
    return {
      ...artwork,
      id: safeBigIntToNumber(artwork.id),
      feedback_bounty: safeBigIntToNumber(artwork.feedback_bounty),
      nft_price: safeBigIntToNumber(artwork.nft_price),
      created_at_ns: safeBigIntToNumber(artwork.created_at_ns),
      // Convert any other BigInt fields as needed
    };
  };

  // Navigate to artwork details
  const handleArtworkClick = (artId) => {
    navigate(`/art/${artId}`);
  };

  // 🔥 FIXED: Fetch liked artworks with BigInt handling
  const fetchLikedArtworks = useCallback(async () => {
    if (!isConnected || !principal) return;
    
    setLoadingLiked(true);
    try {
      // Get user profile to get liked artwork IDs
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('liked_artwork_ids')
        .eq('principal', principal)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      const likedIds = profileData?.liked_artwork_ids || [];
      console.log('Liked artwork IDs:', likedIds);

      if (likedIds.length === 0) {
        setLikedArtworks([]);
        return;
      }

      // Fetch artwork details from backend canister
      const likedArtworksData = [];
      
      for (const artworkId of likedIds) {
        try {
          const artwork = await opencritique_backend.get_artwork_by_id(artworkId);
          if (artwork && artwork.length > 0) {
            // 🔥 CRITICAL: Convert BigInt values before storing
            const convertedArtwork = convertArtworkBigInts(artwork[0]);
            likedArtworksData.push(convertedArtwork);
          }
        } catch (error) {
          console.warn(`Failed to fetch artwork ${artworkId}:`, error);
        }
      }

      setLikedArtworks(likedArtworksData);
      console.log('✅ Fetched liked artworks:', likedArtworksData.length);

    } catch (error) {
      console.error("Error fetching liked artworks:", error);
      setLikedArtworks([]);
    } finally {
      setLoadingLiked(false);
    }
  }, [isConnected, principal]);

  // 🔥 FIXED: Fetch purchased NFTs with BigInt handling
  const fetchPurchasedNFTs = useCallback(async () => {
    if (!isConnected || !principal) return;
    
    setLoadingPurchased(true);
    try {
      // Get user profile to get purchased NFT IDs
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('purchased_nft_ids')
        .eq('principal', principal)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      const purchasedIds = profileData?.purchased_nft_ids || [];
      console.log('Purchased NFT IDs:', purchasedIds);

      if (purchasedIds.length === 0) {
        setPurchasedNFTs([]);
        return;
      }

      // Fetch NFT details from backend canister
      const purchasedNFTsData = [];
      
      for (const nftId of purchasedIds) {
        try {
          const nft = await opencritique_backend.get_artwork_by_id(nftId);
          if (nft && nft.length > 0 && nft[0].is_nft === true) {
            // 🔥 CRITICAL: Convert BigInt values before storing
            const convertedNFT = convertArtworkBigInts(nft[0]);
            purchasedNFTsData.push(convertedNFT);
          }
        } catch (error) {
          console.warn(`Failed to fetch NFT ${nftId}:`, error);
        }
      }

      setPurchasedNFTs(purchasedNFTsData);
      console.log('✅ Fetched purchased NFTs:', purchasedNFTsData.length);

    } catch (error) {
      console.error("Error fetching purchased NFTs:", error);
      setPurchasedNFTs([]);
    } finally {
      setLoadingPurchased(false);
    }
  }, [isConnected, principal]);

  // Tab configuration
  const tabs = [
    { 
      id: "created", 
      label: "Created", 
      icon: "🎨",
      data: myArtworks || [],
      loading: loadingMyArts
    },
    { 
      id: "liked", 
      label: "Liked", 
      icon: "❤️",
      data: likedArtworks,
      loading: loadingLiked
    },
    { 
      id: "purchased", 
      label: "Purchased NFTs", 
      icon: "💎",
      data: purchasedNFTs,
      loading: loadingPurchased
    }
  ];

  const currentTab = tabs.find(tab => tab.id === activeTab);
  const currentData = currentTab?.data || [];
  const displayedItems = currentData.slice(0, displayCount);
  const hasMore = currentData.length > displayCount;

  // Initialize MyStudio
  const initializeMyStudio = useCallback(async () => {
    if (isInitialized) return;
    
    try {
      const isPlugConnected = await window.ic?.plug?.isConnected?.();
      
      if (isPlugConnected && isConnected && principal && principal !== "2vxsx-fae") {
        console.log("🎨 Initializing MyStudio");
        await Promise.all([
          fetchMyArtworks(),
          fetchLikedArtworks(),
          fetchPurchasedNFTs()
        ]);
        setIsInitialized(true);
      }
    } catch (error) {
      console.error("❌ MyStudio initialization error:", error);
    }
  }, [isConnected, principal, fetchMyArtworks, fetchLikedArtworks, fetchPurchasedNFTs, isInitialized]);

  // Effects
  useEffect(() => {
    if (isConnected && principal && !isInitialized) {
      initializeMyStudio();
    }
  }, [isConnected, principal, initializeMyStudio, isInitialized]);

  useEffect(() => {
    if (!isConnected || !principal) {
      setIsInitialized(false);
      setDisplayCount(12);
    }
  }, [isConnected, principal]);

  // Reset display count when switching tabs
  useEffect(() => {
    setDisplayCount(12);
  }, [activeTab]);

  // Load more function
  const handleLoadMore = () => {
    setDisplayCount(prev => prev + 12);
  };

  // Empty state component
  const EmptyState = ({ tab }) => {
    const emptyStates = {
      created: {
        title: "No artworks created yet",
        description: "Start your artistic journey by uploading your first artwork",
        action: "Upload Artwork",
        actionLink: "/upload"
      },
      liked: {
        title: "No liked artworks yet",
        description: "Explore the gallery and like artworks that inspire you",
        action: "Explore Gallery",
        actionLink: "/"
      },
      purchased: {
        title: "No NFTs purchased yet",
        description: "Browse the marketplace to discover and collect unique NFTs",
        action: "Browse Marketplace",
        actionLink: "/marketplace"
      }
    };

    const state = emptyStates[tab];

    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4 opacity-50">
          {tabs.find(t => t.id === tab)?.icon}
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">
          {state.title}
        </h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          {state.description}
        </p>
        <button 
          onClick={() => window.location.href = state.actionLink}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg font-medium transition-all duration-200"
        >
          {state.action}
        </button>
      </div>
    );
  };

  if (!isConnected) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4 opacity-50">🔗</div>
        <h3 className="text-xl font-semibold text-foreground mb-2">
          Connect Your Wallet
        </h3>
        <p className="text-muted-foreground mb-6">
          Connect your Plug wallet to view your artworks and collections
        </p>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg font-medium transition-all duration-200"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-border">
        <nav className="flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap transition-all duration-200 ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content Area */}
      <div className="min-h-[400px]">
        {currentTab?.loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-muted-foreground">Loading {currentTab.label.toLowerCase()}...</p>
            </div>
          </div>
        ) : displayedItems.length === 0 ? (
          <EmptyState tab={activeTab} />
        ) : (
          <>
            {/* Artworks Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayedItems.map((art, index) => {
                // 🔥 CRITICAL FIX: Ensure artwork data is properly converted before rendering
                const safeArt = convertArtworkBigInts(art);
                
                return (
                  <div
                    key={`${activeTab}-${safeArt.id}-${index}`}
                    className="group relative bg-card/50 backdrop-blur border border-border rounded-2xl overflow-hidden hover:bg-card/70 transition-all duration-300"
                  >
                    {/* Image */}
                    <div 
                      className="aspect-square relative overflow-hidden cursor-pointer" 
                      onClick={() => handleArtworkClick(safeArt.id)}
                    >
                      <img
                        src={`${ipfsBase}${safeArt.image_url}`}
                        alt={safeArt.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      
                      {/* Status badges */}
                      <div className="absolute top-3 left-3 flex gap-2">
                        {safeArt.is_nft && (
                          <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-md text-xs font-medium">
                            NFT
                          </span>
                        )}
                        {safeArt.feedback_bounty > 0 && (
                          <span className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-2 py-1 rounded-md text-xs font-medium">
                            💰 Bounty
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-2">
                      <h3 className="font-semibold text-foreground truncate">
                        {safeArt.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {safeArt.description}
                      </p>
                      
                      {/* Stats */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
                        <span className="flex items-center gap-1">
                          <span>💬</span>
                          {safeArt.critiques?.length || 0}
                        </span>
                        {safeArt.is_nft && safeArt.nft_price > 0 && (
                          <span className="font-medium text-primary">
                            {(safeArt.nft_price / 100000000).toFixed(3)} ICP
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="text-center pt-8">
                <button
                  onClick={handleLoadMore}
                  className="bg-card/80 hover:bg-card border border-border text-foreground px-8 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105"
                >
                  Load More {currentTab.label}
                </button>
              </div>
            )}

            {/* Results Summary */}
            <div className="text-center pt-4 text-sm text-muted-foreground">
              Showing {displayedItems.length} of {currentData.length} {currentTab.label.toLowerCase()}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MyStudio;
