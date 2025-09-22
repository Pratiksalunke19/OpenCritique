import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import MyStudioArtCard from "./MyStudioArtCard";
import { useArtContext } from "./context/ArtContext";
import { useUserContext } from "./context/UserContext";

const MyStudio = () => {
  const navigate = useNavigate();
  const ipfsBase = "https://gateway.pinata.cloud/ipfs/";
  const [isInitialized, setIsInitialized] = useState(false);
  const [activeTab, setActiveTab] = useState("created");
  const [displayCount, setDisplayCount] = useState(12); // Show 12 items initially

  const { myArtworks, fetchMyArtworks, loadingMyArts } = useArtContext();
  const { isConnected, principal } = useUserContext();

  // Mock data for liked and purchased NFTs (replace with real API calls)
  const [likedArtworks, setLikedArtworks] = useState([]);
  const [purchasedNFTs, setPurchasedNFTs] = useState([]);
  const [loadingLiked, setLoadingLiked] = useState(false);
  const [loadingPurchased, setLoadingPurchased] = useState(false);

  // Navigate to artwork details
  const handleArtworkClick = (artId) => {
    navigate(`/art/${artId}`);
  };

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

  // Fetch liked artworks
  const fetchLikedArtworks = useCallback(async () => {
    if (!isConnected || !principal) return;
    
    setLoadingLiked(true);
    try {
      // Replace with your actual API call
      // const liked = await opencritique_backend.get_liked_artworks(principal);
      // setLikedArtworks(liked);
      
      // Mock data for now
      setLikedArtworks([
        // Add mock liked artworks here
      ]);
    } catch (error) {
      console.error("Error fetching liked artworks:", error);
    } finally {
      setLoadingLiked(false);
    }
  }, [isConnected, principal]);

  // Fetch purchased NFTs
  const fetchPurchasedNFTs = useCallback(async () => {
    if (!isConnected || !principal) return;
    
    setLoadingPurchased(true);
    try {
      // Replace with your actual API call
      // const purchased = await opencritique_backend.get_purchased_nfts(principal);
      // setPurchasedNFTs(purchased);
      
      // Mock data for now
      setPurchasedNFTs([
        // Add mock purchased NFTs here
      ]);
    } catch (error) {
      console.error("Error fetching purchased NFTs:", error);
    } finally {
      setLoadingPurchased(false);
    }
  }, [isConnected, principal]);

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
      setDisplayCount(12); // Reset display count
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
              {displayedItems.map((art, index) => (
                <div
                  key={`${activeTab}-${art.id}-${index}`}
                  className="group relative bg-card/50 backdrop-blur border border-border rounded-2xl overflow-hidden hover:bg-card/70 transition-all duration-300"
                >
                  {/* Image */}
                  <div 
                    className="aspect-square relative overflow-hidden cursor-pointer" 
                    onClick={() => handleArtworkClick(art.id)}
                  >
                    <img
                      src={`${ipfsBase}${art.image_url}`}
                      alt={art.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    
                    {/* Status badges */}
                    <div className="absolute top-3 left-3 flex gap-2">
                      {art.is_nft && (
                        <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-md text-xs font-medium">
                          NFT
                        </span>
                      )}
                      {art.feedback_bounty > 0 && (
                        <span className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-2 py-1 rounded-md text-xs font-medium">
                          💰 Bounty
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 space-y-2">
                    <h3 className="font-semibold text-foreground truncate">
                      {art.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {art.description}
                    </p>
                    
                    {/* Stats */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
                      <span className="flex items-center gap-1">
                        <span>💬</span>
                        {art.critiques?.length || 0}
                      </span>
                      {art.is_nft && art.nft_price > 0 && (
                        <span className="font-medium text-primary">
                          {(art.nft_price / 100000000).toFixed(3)} ICP
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
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
