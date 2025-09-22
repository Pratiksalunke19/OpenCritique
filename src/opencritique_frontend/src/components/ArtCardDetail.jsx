import React from "react";
import { useParams } from "react-router-dom";
import { useArtContext } from "./context/ArtContext";
import { useState } from "react";
import { opencritique_backend } from "../../../declarations/opencritique_backend";
import { ThumbsUp, Gift, X, Heart } from "lucide-react";
import { useUserContext } from "./context/UserContext";
import { supabase } from "../lib/supabaseClient"; // Add Supabase import

const ArtCardDetail = () => {
  const ipfsBase = "https://gateway.pinata.cloud/ipfs/";
  const { id } = useParams();
  const { artworks } = useArtContext();
  const { user, isConnected, principal } = useUserContext();

  // State variables
  const [critiqueText, setCritiqueText] = useState("");
  const [critiques, setCritiques] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [selectedCritique, setSelectedCritique] = useState(null);
  const [rewardAmount, setRewardAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRewarding, setIsRewarding] = useState(false);
  const [hoveredCritiqueId, setHoveredCritiqueId] = useState(null);

  // 🔥 NEW: Like functionality state
  const [isLiked, setIsLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  // 🔥 NEW: Critical state additions for proper authentication
  const [userPrincipal, setUserPrincipal] = useState(null);
  const [bountyBalance, setBountyBalance] = useState(0);
  const [isLoadingBounty, setIsLoadingBounty] = useState(false);

  const artwork = artworks.find((art) => art.id.toString() === id);

  // 🔥 NEW: Reward transfer status
  const [rewardStatus, setRewardStatus] = useState("");

  // 🔥 NEW: Get user principal from Plug wallet
  React.useEffect(() => {
    const getUserPrincipal = async () => {
      if (window.ic?.plug?.agent) {
        try {
          const principal = await window.ic.plug.agent.getPrincipal();
          setUserPrincipal(principal);
          console.log("Current user principal:", principal.toString());
        } catch (error) {
          console.error("Error getting principal:", error);
        }
      }
    };
    getUserPrincipal();
  }, []);

  // 🔥 NEW: Check if artwork is liked by current user
  React.useEffect(() => {
    const checkLikeStatus = async () => {
      if (!isConnected || !principal || !artwork) return;

      try {
        // Get user profile to check liked artworks
        const { data: profileData, error } = await supabase
          .from("profiles")
          .select("liked_artwork_cids")
          .eq("principal", principal)
          .single();

        if (error && error.code !== "PGRST116") {
          console.error("Error checking like status:", error);
          return;
        }

        if (profileData?.liked_artwork_cids) {
          const isCurrentlyLiked = profileData.liked_artwork_cids.includes(
            artwork.image_url
          );
          setIsLiked(isCurrentlyLiked);
        }

        // TODO: Get total like count for this artwork from a likes table or counter
        // For now, we'll use a placeholder
        setLikeCount(0); // Replace with actual count from database
      } catch (error) {
        console.error("Error checking like status:", error);
      }
    };

    checkLikeStatus();
  }, [isConnected, principal, artwork]);

  // 🔥 UPDATED: Handle like/unlike functionality with artwork IDs
  const handleLike = async () => {
    if (!isConnected || !principal || !artwork) {
      alert("Please connect your wallet to like artworks");
      return;
    }

    setIsLiking(true);

    try {
      if (isLiked) {
        // Unlike the artwork
        const { error } = await supabase.rpc("remove_liked_artwork", {
          user_principal: principal,
          artwork_id: parseInt(artwork.id), // Use artwork ID instead of CID
        });

        if (error) throw error;

        setIsLiked(false);
        setLikeCount((prev) => Math.max(0, prev - 1));
        console.log("✅ Artwork unliked");
      } else {
        // Like the artwork
        const { error } = await supabase.rpc("add_liked_artwork", {
          user_principal: principal,
          artwork_id: parseInt(artwork.id), // Use artwork ID instead of CID
        });

        if (error) throw error;

        setIsLiked(true);
        setLikeCount((prev) => prev + 1);
        console.log("✅ Artwork liked");
      }
    } catch (error) {
      console.error("Error updating like status:", error);
      alert("Failed to update like status. Please try again.");
    } finally {
      setIsLiking(false);
    }
  };

  // 🔥 UPDATED: Check if artwork is liked by current user
  React.useEffect(() => {
    const checkLikeStatus = async () => {
      if (!isConnected || !principal || !artwork) return;

      try {
        // Get user profile to check liked artworks
        const { data: profileData, error } = await supabase
          .from("profiles")
          .select("liked_artwork_ids")
          .eq("principal", principal)
          .single();

        if (error && error.code !== "PGRST116") {
          console.error("Error checking like status:", error);
          return;
        }

        if (profileData?.liked_artwork_ids) {
          const isCurrentlyLiked = profileData.liked_artwork_ids.includes(
            parseInt(artwork.id)
          );
          setIsLiked(isCurrentlyLiked);
        }

        // TODO: Get total like count for this artwork from database
        // You might want to add a separate likes table or counter
        setLikeCount(0); // Replace with actual count from database
      } catch (error) {
        console.error("Error checking like status:", error);
      }
    };

    checkLikeStatus();
  }, [isConnected, principal, artwork]);

  // 🔥 NEW: Fetch real-time bounty balance
  React.useEffect(() => {
    const fetchBountyBalance = async () => {
      if (artwork?.bounty && artwork.id) {
        try {
          setIsLoadingBounty(true);
          const balance = await opencritique_backend.get_bounty_balance(
            Number(artwork.id)
          );
          setBountyBalance(Number(balance));
          console.log("Current bounty balance:", balance);
        } catch (error) {
          console.error("Error fetching bounty balance:", error);
          setBountyBalance(0);
        } finally {
          setIsLoadingBounty(false);
        }
      }
    };
    fetchBountyBalance();
  }, [artwork?.id]);

  React.useEffect(() => {
    fetchCritiques();
  }, [id]);

  const fetchCritiques = async () => {
    try {
      const result = await opencritique_backend.get_critiques(Number(id));
      setCritiques(result);
    } catch (error) {
      console.error("Error fetching critiques:", error);
    }
  };

  const handleSubmitCritique = async () => {
    try {
      setIsSubmitting(true);
      await opencritique_backend.post_critique(Number(id), critiqueText);
      setShowForm(false);
      setCritiqueText("");
      fetchCritiques();
    } catch (e) {
      console.error("Error submitting critique:", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpvote = async (critiqueId) => {
    try {
      await opencritique_backend.upvote_critique(Number(id), critiqueId);
      fetchCritiques();
    } catch (e) {
      console.error("Upvote failed:", e);
    }
  };

  const handleRewardUser = (critique) => {
    setSelectedCritique(critique);
    setShowRewardModal(true);
    setRewardAmount(""); // Reset amount
  };

  // 🔥 NEW: Direct ICP transfer via Plug wallet (like UploadForm bounty funding)
  const transferICPDirectly = async (criticPrincipal, amountICP) => {
    try {
      setRewardStatus("Requesting transfer approval...");

      // Convert ICP to e8s (1 ICP = 100,000,000 e8s)
      const amountE8s = Math.floor(parseFloat(amountICP) * 100000000);

      // Configure host for transfer
      const host = process.env.NODE_ENV === "development" 
        ? "http://localhost:4943" 
        : "https://ic0.app";

      // Ensure agent is properly configured
      if (!window.ic.plug.agent || window.ic.plug.agent._host !== host) {
        console.log("Reconfiguring Plug agent for transfer...");
        await window.ic.plug.requestConnect({
          whitelist: [
            "be2us-64aaa-aaaaa-qaabq-cai", // Backend canister
            "bkyz2-fmaaa-aaaaa-qaaaq-cai"  // Local ICP ledger canister
          ],
          host: host,
        });
      }

      // Prepare transfer parameters
      const transferParams = {
        to: criticPrincipal.toString(),
        amount: amountE8s,
      };

      console.log("Direct ICP transfer parameters:", transferParams);
      console.log("Using host:", host);

      setRewardStatus("Confirm transfer in Plug wallet...");

      // This will show Plug wallet popup for user approval
      const transferResult = await window.ic.plug.requestTransfer(transferParams);
      console.log("Direct ICP transfer successful:", transferResult);

      setRewardStatus("Transfer completed!");
      
      // Wait a moment for blockchain confirmation
      await new Promise(resolve => setTimeout(resolve, 2000));

      return transferResult;
    } catch (error) {
      console.error("Direct ICP transfer failed:", error);
      throw new Error(`Direct transfer failed: ${error.message}`);
    }
  };

  // 🔥 ENHANCED: Reward submission with Plug wallet integration
  const handleRewardSubmit = async () => {
    if (!selectedCritique || !rewardAmount) {
      alert("Please enter a valid reward amount.");
      return;
    }

    const amount = parseFloat(rewardAmount);

    if (amount <= 0) {
      alert("Please enter a valid amount greater than 0.");
      return;
    }

    // Check if user has enough balance (optional check)
    const maxBountyAmount = bountyBalance > 0 ? bountyBalance / 100000000 : Infinity;
    
    try {
      setIsRewarding(true);
      setRewardStatus("Initiating reward transfer...");

      console.log("🎁 Starting reward transfer:", {
        artworkId: Number(id),
        critic: selectedCritique.critic.toString(),
        amount: amount,
        method: bountyBalance > 0 ? "bounty" : "direct"
      });

      let transferResult;

      if (bountyBalance > 0 && amount <= maxBountyAmount) {
        // 🔥 Option 1: Use bounty escrow system (existing backend method)
        setRewardStatus("Using bounty escrow...");
        
        const amountInE8s = Math.floor(amount * 100000000);
        const result = await opencritique_backend.transfer_bounty_to_critic(
          Number(id),
          selectedCritique.critic,
          amountInE8s
        );

        if (!result.Success) {
          throw new Error(result.Error || "Bounty transfer failed");
        }

        transferResult = result;
        console.log("✅ Bounty transfer completed:", result);

      } else {
        // 🔥 Option 2: Direct ICP transfer via Plug wallet (new method)
        setRewardStatus("Processing direct ICP transfer...");
        
        transferResult = await transferICPDirectly(selectedCritique.critic, amount);
        console.log("✅ Direct ICP transfer completed:", transferResult);
      }

      // Success feedback
      const successMessage = bountyBalance > 0 && amount <= maxBountyAmount
        ? `🎉 Successfully rewarded ${amount} ICP from bounty escrow!`
        : `🎉 Successfully sent ${amount} ICP directly to critic!`;
      
      alert(successMessage);

      // Refresh data
      fetchCritiques();

      // Update bounty balance if bounty was used
      if (bountyBalance > 0) {
        const newBalance = await opencritique_backend.get_bounty_balance(Number(id));
        setBountyBalance(Number(newBalance));
      }

      // Close modal and reset
      setShowRewardModal(false);
      setRewardAmount("");
      setSelectedCritique(null);
      setRewardStatus("");

    } catch (error) {
      console.error("Reward transfer error:", error);
      setRewardStatus("");
      alert(`❌ Reward failed: ${error.message}`);
    } finally {
      setIsRewarding(false);
    }
  };

  const getUsernameFromPrincipal = (principal) => {
    const principalStr = principal.toString();
    return principalStr.substring(0, 8) + "...";
  };

  // 🔥 FIXED: Proper ownership check using userPrincipal
  const isArtworkOwner =
    userPrincipal &&
    artwork &&
    userPrincipal.toString() === artwork.author.toString();

  // 🔥 FIXED: Proper bounty check using real balance
  const hasBounty = artwork?.bounty && bountyBalance > 0;

  if (!artwork) {
    return (
      <div className="text-white text-center mt-20">Artwork not found.</div>
    );
  }

  const {
    image_url,
    title,
    description,
    username,
    email,
    bounty,
    license,
    tags,
  } = artwork;

  return (
    <div className="min-h-screen p-6 md:p-10 flex flex-col md:flex-col items-center justify-center bg-background text-foreground animate-fade-in">
      <div className="w-full flex">
        {/* Left side: Artwork Image */}
        <div className="w-full md:w-1/2 p-4 md:p-6 relative">
          <div className="relative">
            <img
              src={`${ipfsBase}${image_url}`}
              alt={title}
              className="rounded-2xl shadow-lg w-full object-cover max-h-[600px] border border-border"
            />
          </div>
        </div>

        {/* Right side: Details */}
        <div className="w-full md:w-1/2 p-4 md:p-6">
          <div className="relative bg-card rounded-3xl shadow-2xl p-6 md:p-8 space-y-6 border border-border animate-slide-up">
            {/* 🔥 NEW: Like Button in Top Right Corner */}
            <button
              onClick={handleLike}
              disabled={isLiking || !isConnected}
              className={`absolute top-4 right-4 p-3 rounded-full backdrop-blur-sm border transition-all duration-300 group ${
                isLiked
                  ? "bg-red-500/20 border-red-500/50 text-red-400 hover:bg-red-500/30"
                  : "bg-black/20 border-white/20 text-white hover:bg-black/40 hover:border-white/40"
              } ${isLiking ? "scale-95" : "hover:scale-110"} ${
                !isConnected
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer"
              }`}
            >
              <Heart
                size={24}
                className={`transition-all duration-300 ${
                  isLiked ? "fill-current scale-110" : "group-hover:scale-110"
                } ${isLiking ? "animate-pulse" : ""}`}
              />
            </button>

            {/* Header Section */}
            <div className="border-b border-border pb-6">
              <h1 className="text-3xl md:text-4xl font-heading font-bold gradient-text mb-3">
                {title}
              </h1>
              <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
                {description}
              </p>
            </div>

            {/* Artist Info Card */}
            <div className="bg-background/40 backdrop-blur-sm rounded-2xl p-5 border border-border">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center">
                  <span className="text-foreground font-bold text-sm">
                    {username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {username}
                  </h3>
                  <p className="text-sm text-muted-foreground">Artist</p>
                </div>
              </div>

              {username !== "Anonymous" && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Contact:</span>
                  <span className="text-accent hover:text-primary transition-colors cursor-pointer">
                    {email}
                  </span>
                </div>
              )}
            </div>

            {/* Artwork Details Grid */}
            <div className="grid grid-cols-1 gap-4">
              {/* 🔥 ENHANCED: Bounty Card with real-time balance */}
              {bountyBalance > 0 && (
                <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                        <span className="text-foreground text-sm">💰</span>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Available Bounty
                        </p>
                        <p className="text-xl font-bold text-green-400">
                          {isLoadingBounty
                            ? "Loading..."
                            : `${(bountyBalance / 100000000).toFixed(6)} ICP`}
                        </p>
                      </div>
                    </div>
                    {hasBounty && isArtworkOwner && (
                      <div className="text-xs bg-green-600/20 text-green-400 px-2 py-1 rounded-full">
                        Ready to Reward
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* License & Tags */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-background/40 rounded-xl p-4 border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-accent">📜</span>
                    <span className="text-sm text-muted-foreground">
                      License
                    </span>
                  </div>
                  <p className="text-foreground font-medium">{license}</p>
                </div>

                <div className="bg-background/40 rounded-xl p-4 border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-purple-400">🏷️</span>
                    <span className="text-sm text-muted-foreground">Tags</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {tags?.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-purple-600/20 text-purple-300 rounded-md text-xs border border-purple-500/30"
                      >
                        {tag}
                      </span>
                    )) || <span className="text-gray-500 text-sm">None</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Button - Only show for non-owners */}
            {!isArtworkOwner && (
              <div className="pt-4">
                <button
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-4 rounded-2xl shadow-lg transition-all duration-300 flex items-center justify-center gap-3 group"
                  onClick={() => setShowForm(true)}
                >
                  <span className="text-lg">✍️</span>
                  <span className="text-lg">Critique this Artwork</span>
                  <svg
                    className="w-5 h-5 transform group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </button>
              </div>
            )}

            {/* Stats Bar */}
            <div className="bg-background/30 rounded-xl p-4 border border-border">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Heart
                    size={16}
                    className={
                      isLiked
                        ? "text-red-400 fill-current"
                        : "text-muted-foreground"
                    }
                  />
                  <span className="text-foreground font-medium">
                    {likeCount} {likeCount === 1 ? "like" : "likes"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Critiques:</span>
                  <span className="text-foreground font-medium">
                    {critiques.length}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Listed:</span>
                  <span className="text-foreground font-medium">Recently</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Critique Form (Floating Overlay) */}
      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-card w-full max-w-lg p-6 rounded-2xl shadow-2xl border border-border relative">
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>

            <h2 className="text-xl font-semibold text-foreground mb-4">
              Write a Critique
            </h2>

            <textarea
              value={critiqueText}
              onChange={(e) => setCritiqueText(e.target.value)}
              className="w-full p-3 rounded-lg bg-background text-foreground border border-input focus:outline-none focus:ring-2 focus:ring-primary transition"
              rows={5}
              placeholder="Share your thoughts..."
            />

            <button
              onClick={handleSubmitCritique}
              disabled={isSubmitting}
              className="mt-4 w-full flex items-center justify-center bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium shadow-md hover:bg-primary/90 transition"
            >
              {isSubmitting && (
                <svg
                  className="animate-spin h-5 w-5 text-white mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
              )}
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </div>
      )}

      {/* 🔥 ENHANCED: Reward Modal with Plug wallet integration */}
      {showRewardModal && selectedCritique && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-card w-full max-w-md p-6 rounded-2xl shadow-2xl border border-border relative">
            <button
              onClick={() => setShowRewardModal(false)}
              className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
            >
              <X size={20} />
            </button>

            <div className="text-center mb-6">
              <Gift className="mx-auto mb-3 text-primary" size={48} />
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Reward Critic
              </h2>
              <p className="text-muted-foreground text-sm">
                Send ICP to {getUsernameFromPrincipal(selectedCritique.critic)}
              </p>
            </div>

            <div className="space-y-4">
              {/* 🔥 NEW: Transfer method indicator */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-blue-800 text-sm">
                  {bountyBalance > 0 
                    ? `💰 Bounty Available: ${(bountyBalance / 100000000).toFixed(6)} ICP`
                    : "💳 Direct ICP transfer from your wallet"
                  }
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Reward Amount (ICP)
                </label>
                <input
                  type="number"
                  step="0.00000001"
                  min="0.00000001"
                  max={bountyBalance > 0 ? (bountyBalance / 100000000).toFixed(8) : undefined}
                  value={rewardAmount}
                  onChange={(e) => setRewardAmount(e.target.value)}
                  className="w-full p-3 rounded-lg bg-background text-foreground border border-input focus:outline-none focus:ring-2 focus:ring-primary transition"
                  placeholder="0.00000001"
                />
                {bountyBalance > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Available in bounty: {(bountyBalance / 100000000).toFixed(8)} ICP
                  </p>
                )}
              </div>

              {/* Quick amount buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => setRewardAmount("0.00000001")}
                  className="flex-1 py-2 px-3 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-500 transition"
                >
                  Min Amount
                </button>
                {bountyBalance > 0 && (
                  <>
                    <button
                      onClick={() =>
                        setRewardAmount(
                          ((bountyBalance / 100000000) * 0.1).toFixed(8)
                        )
                      }
                      className="flex-1 py-2 px-3 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-500 transition"
                    >
                      10% Bounty
                    </button>
                    <button
                      onClick={() =>
                        setRewardAmount((bountyBalance / 100000000).toFixed(8))
                      }
                      className="flex-1 py-2 px-3 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-500 transition"
                    >
                      Full Bounty
                    </button>
                  </>
                )}
              </div>

              {/* 🔥 NEW: Transfer status indicator */}
              {rewardStatus && (
                <div className="bg-blue-100 border border-blue-300 rounded-lg p-3">
                  <p className="text-blue-800 text-sm flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    {rewardStatus}
                  </p>
                </div>
              )}

              <div className="bg-background/50 rounded-lg p-3 border border-border">
                <p className="text-sm text-foreground">
                  <strong>Critique:</strong> "
                  {selectedCritique.text.substring(0, 100)}
                  {selectedCritique.text.length > 100 ? "..." : ""}"
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowRewardModal(false)}
                  disabled={isRewarding}
                  className="flex-1 py-3 px-4 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRewardSubmit}
                  disabled={isRewarding || !rewardAmount}
                  className="flex-1 py-3 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isRewarding ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8H4z"
                        />
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Gift size={16} className="mr-2" />
                      Send Reward
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🔥 ENHANCED: Critique List with bounty status header */}
      <div className="mt-8 w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl text-primary">Community Critiques</h3>
          {isArtworkOwner && hasBounty && (
            <div className="flex items-center gap-2 bg-green-600/20 text-green-400 px-3 py-1.5 rounded-full text-sm">
              <Gift size={16} />
              <span>
                {(bountyBalance / 100000000).toFixed(4)} ICP available to reward
              </span>
            </div>
          )}
        </div>

        {critiques.length > 0 ? (
          critiques.map((crit) => (
            <div
              key={crit.id}
              className="bg-[#1e293b] p-6 my-4 rounded-xl relative group transition-all duration-200 hover:bg-[#253445]"
              onMouseEnter={() => setHoveredCritiqueId(crit.id)}
              onMouseLeave={() => setHoveredCritiqueId(null)}
            >
              {/* Critic Username Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {getUsernameFromPrincipal(crit.critic)
                        .charAt(0)
                        .toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-medium">
                      {getUsernameFromPrincipal(crit.critic)}
                    </p>
                    <p className="text-gray-400 text-xs">Critic</p>
                  </div>
                  {/* 🔥 FIXED: Proper reward status check */}
                  {crit.is_rewarded === true && (
                    <div className="bg-green-600/20 text-green-400 px-2 py-1 rounded-full text-xs flex items-center gap-1">
                      <Gift size={12} />
                      Rewarded
                    </div>
                  )}
                </div>

                {/* 🔥 FIXED: Proper reward button condition */}
                {hoveredCritiqueId === crit.id &&
                  isArtworkOwner &&
                  // hasBounty &&
                  crit.is_rewarded !== true && (
                    <button
                      onClick={() => handleRewardUser(crit)}
                      className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:from-yellow-600 hover:to-yellow-700 transition-all duration-200 flex items-center gap-2 shadow-lg"
                    >
                      <Gift size={14} />
                      Reward User
                    </button>
                  )}
              </div>

              {/* Critique Text */}
              <p className="text-gray-200 mb-4 leading-relaxed">{crit.text}</p>

              {/* Upvote Button */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => handleUpvote(crit.id)}
                  className="bg-primary/20 hover:bg-primary/30 text-primary px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 group/upvote"
                >
                  <ThumbsUp
                    size={16}
                    className="group-hover/upvote:scale-110 transition-transform"
                  />
                  <span className="font-medium">{crit.upvotes}</span>
                </button>

                <div className="text-xs text-gray-500">Critique #{crit.id}</div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex justify-start items-center">
            <p className="text-gray-500 text-lg">No critiques yet!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtCardDetail;
