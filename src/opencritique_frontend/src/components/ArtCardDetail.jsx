import React from "react";
import { useParams } from "react-router-dom";
import { useArtContext } from "./context/ArtContext";
import { useState } from "react";
import { opencritique_backend } from "../../../declarations/opencritique_backend";
import { ThumbsUp, Gift, X } from "lucide-react";
import { useUserContext } from "./context/UserContext";

const ArtCardDetail = () => {
  const ipfsBase = "https://gateway.pinata.cloud/ipfs/";
  const { id } = useParams();
  const { artworks } = useArtContext();
  const { user } = useUserContext();

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

  // 🔥 NEW: Critical state additions for proper authentication
  const [userPrincipal, setUserPrincipal] = useState(null);
  const [bountyBalance, setBountyBalance] = useState(0);
  const [isLoadingBounty, setIsLoadingBounty] = useState(false);

  const artwork = artworks.find((art) => art.id.toString() === id);

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

  // 🔥 ENHANCED: Better reward submission with validation and feedback
  const handleRewardSubmit = async () => {
    if (!selectedCritique || !rewardAmount) {
      alert("Please enter a valid reward amount.");
      return;
    }

    const amount = parseFloat(rewardAmount);
    const maxAmount = bountyBalance / 100000000;

    if (amount <= 0) {
      alert("Please enter a valid amount greater than 0.");
      return;
    }

    if (amount > maxAmount) {
      alert(
        `Amount exceeds available bounty balance of ${maxAmount.toFixed(
          8
        )} ICP.`
      );
      return;
    }

    try {
      setIsRewarding(true);
      const amountInE8s = Math.floor(amount * 100000000);

      console.log("Transferring bounty:", {
        artworkId: Number(id),
        critic: selectedCritique.critic.toString(),
        amount: amountInE8s,
      });

      const result = await opencritique_backend.transfer_bounty_to_critic(
        Number(id),
        selectedCritique.critic,
        amountInE8s
      );

      if (result.Success) {
        alert(`🎉 Successfully rewarded ${amount} ICP to critic!`);

        // Refresh data
        fetchCritiques();

        // Update bounty balance
        const newBalance = await opencritique_backend.get_bounty_balance(
          Number(id)
        );
        setBountyBalance(Number(newBalance));

        // Close modal and reset
        setShowRewardModal(false);
        setRewardAmount("");
        setSelectedCritique(null);
      } else {
        alert(`❌ Transfer failed: ${result.Error}`);
      }
    } catch (error) {
      console.error("Reward transfer error:", error);
      alert(
        "❌ Failed to transfer reward. Please check your connection and try again."
      );
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
    <div className="min-h-screen p-10 flex flex-col md:flex-col items-center justify-center bg-[#0f172a] text-white mt-[70px]">
      <div className="w-full flex">
        {/* Left side: Artwork Image */}
        <div className="w-full md:w-1/2 p-6">
          <img
            src={`${ipfsBase}${image_url}`}
            alt={title}
            className="rounded-2xl shadow-lg w-full object-cover max-h-[600px]"
          />
        </div>

        {/* Right side: Details */}
        <div className="w-full md:w-1/2 p-6">
          <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded-3xl shadow-2xl p-8 space-y-6 border border-gray-700/30">
            {/* Header Section */}
            <div className="border-b border-gray-600/50 pb-6">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent mb-3">
                {title}
              </h1>
              <p className="text-gray-300 text-lg leading-relaxed font-light">
                {description}
              </p>
            </div>

            {/* Artist Info Card */}
            <div className="bg-gray-800/40 backdrop-blur-sm rounded-2xl p-5 border border-gray-600/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {username}
                  </h3>
                  <p className="text-sm text-gray-400">Artist</p>
                </div>
              </div>

              {username !== "Anonymous" && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-400">Contact:</span>
                  <span className="text-blue-400 hover:text-blue-300 transition-colors cursor-pointer">
                    {email}
                  </span>
                </div>
              )}
            </div>

            {/* Artwork Details Grid */}
            <div className="grid grid-cols-1 gap-4">
              {/* 🔥 ENHANCED: Bounty Card with real-time balance */}
              {bountyBalance > 0 && (
                <div className="bg-gradient-to-r from-green-900/20 to-green-800/20 rounded-xl p-4 border border-green-600/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm">💰</span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">
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
                <div className="bg-gray-800/40 rounded-xl p-4 border border-gray-600/20">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-blue-400">📜</span>
                    <span className="text-sm text-gray-400">License</span>
                  </div>
                  <p className="text-white font-medium">{license}</p>
                </div>

                <div className="bg-gray-800/40 rounded-xl p-4 border border-gray-600/20">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-purple-400">🏷️</span>
                    <span className="text-sm text-gray-400">Tags</span>
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
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-4 rounded-2xl shadow-lg transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl flex items-center justify-center gap-3 group"
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
            <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-600/20">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">Views:</span>
                  <span className="text-white font-medium">-</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">Critiques:</span>
                  <span className="text-white font-medium">
                    {critiques.length}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">Listed:</span>
                  <span className="text-white font-medium">Recently</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Critique Form (Floating Overlay) */}
      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-[#1e293b] w-full max-w-lg p-6 rounded-2xl shadow-2xl relative transform transition-all duration-300 scale-100 hover:scale-105">
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-white"
            >
              ✕
            </button>

            <h2 className="text-xl font-semibold text-white mb-4">
              Write a Critique
            </h2>

            <textarea
              value={critiqueText}
              onChange={(e) => setCritiqueText(e.target.value)}
              className="w-full p-3 rounded-lg bg-white/90 text-black focus:outline-none focus:ring-2 focus:ring-green-500 transition"
              rows={5}
              placeholder="Share your thoughts..."
            />

            <button
              onClick={handleSubmitCritique}
              disabled={isSubmitting}
              className="mt-4 w-full flex items-center justify-center bg-green-600 text-white px-4 py-2 rounded-lg font-medium shadow-md hover:bg-green-700 transition"
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

      {/* 🔥 ENHANCED: Reward Modal with better validation */}
      {showRewardModal && selectedCritique && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-[#1e293b] w-full max-w-md p-6 rounded-2xl shadow-2xl relative">
            <button
              onClick={() => setShowRewardModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>

            <div className="text-center mb-6">
              <Gift className="mx-auto mb-3 text-yellow-500" size={48} />
              <h2 className="text-xl font-semibold text-white mb-2">
                Reward Critic
              </h2>
              <p className="text-gray-400 text-sm">
                Send ICP to {getUsernameFromPrincipal(selectedCritique.critic)}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Reward Amount (ICP)
                </label>
                <input
                  type="number"
                  step="0.00000001"
                  min="0.00000001"
                  max={(bountyBalance / 100000000).toFixed(8)}
                  value={rewardAmount}
                  onChange={(e) => setRewardAmount(e.target.value)}
                  className="w-full p-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 transition"
                  placeholder="0.00000001"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Available: {(bountyBalance / 100000000).toFixed(8)} ICP
                </p>
              </div>

              {/* 🔥 ENHANCED: Better quick amount buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => setRewardAmount("0.00000001")}
                  className="flex-1 py-2 px-3 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-500 transition"
                >
                  Min Amount
                </button>
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
              </div>

              <div className="bg-gray-700/50 rounded-lg p-3">
                <p className="text-sm text-gray-300">
                  <strong>Critique:</strong> "
                  {selectedCritique.text.substring(0, 100)}
                  {selectedCritique.text.length > 100 ? "..." : ""}"
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowRewardModal(false)}
                  className="flex-1 py-3 px-4 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRewardSubmit}
                  disabled={isRewarding || !rewardAmount}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg font-medium hover:from-yellow-600 hover:to-yellow-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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
                  hasBounty &&
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
