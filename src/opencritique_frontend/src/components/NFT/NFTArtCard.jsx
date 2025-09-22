import React from "react";
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useArtContext } from "../context/ArtContext";
import { useUserContext } from "../context/UserContext"; // Add this import
import { supabase } from "../../lib/supabaseClient"; // Add Supabase import
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
  const { isConnected, principal } = useUserContext(); // Add user context

  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false); // Loading state for purchase

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

  // 🔥 NEW: Add purchased NFT to Supabase
  const addPurchasedNFTToProfile = async (nftId) => {
    if (!isConnected || !principal) {
      console.warn('User not connected, cannot save purchase');
      return;
    }

    try {
      console.log('💎 Adding purchased NFT to profile:', { principal, nftId });

      // Use the database function to add purchased NFT
      const { error } = await supabase.rpc('add_purchased_nft', {
        user_principal: principal,
        nft_id: parseInt(nftId)
      });

      if (error) {
        throw error;
      }

      console.log('✅ Successfully added NFT to purchased list');

      // Optional: Update user's NFT purchase count
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          updated_at: new Date().toISOString()
        })
        .eq('principal', principal);

      if (updateError) {
        console.warn('Failed to update profile timestamp:', updateError);
      }

    } catch (error) {
      console.error('❌ Error adding purchased NFT to profile:', error);
      // Don't throw the error to avoid breaking the purchase flow
      // The purchase was successful, saving to profile is secondary
    }
  };

  // 🔥 NEW: Mock purchase transaction with Supabase integration
  const performMockPurchase = async (artwork) => {
    setIsPurchasing(true);

    try {
      console.log('🛒 Starting mock purchase for NFT:', artwork.id);

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock transaction - in real implementation, this would involve:
      // 1. Actual ICP transfer via Plug wallet
      // 2. Backend canister call to update NFT ownership
      // 3. Blockchain transaction confirmation

      const mockTransactionResult = {
        success: true,
        transactionId: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        blockHeight: Math.floor(Math.random() * 1000000),
        timestamp: Date.now(),
        amount: artwork.nft_price,
        buyer: principal,
        seller: artwork.author
      };

      console.log('💳 Mock transaction completed:', mockTransactionResult);

      // 🔥 CRITICAL: Add to purchased NFTs in Supabase
      await addPurchasedNFTToProfile(artwork.id);

      return mockTransactionResult;

    } catch (error) {
      console.error('❌ Mock purchase failed:', error);
      throw new Error(`Purchase failed: ${error.message}`);
    } finally {
      setIsPurchasing(false);
    }
  };

  // Update the handlePurchase function
  const handlePurchase = () => {
    if (!isConnected) {
      alert('Please connect your wallet to purchase NFTs');
      return;
    }

    if (isSold) {
      alert('This NFT has already been sold');
      return;
    }

    setShowPurchaseModal(true);
  };

  // 🔥 ENHANCED: Handle purchase success with Supabase integration
  const handlePurchaseSuccess = async (purchasedArtwork) => {
    try {
      console.log("🎉 NFT purchase initiated:", purchasedArtwork.title);

      // Perform the mock purchase transaction
      const transactionResult = await performMockPurchase(purchasedArtwork);

      // Close modal first
      setShowPurchaseModal(false);

      // Show success message with transaction details
      const successMessage = `
🎉 Successfully purchased "${purchasedArtwork.title}"!

Transaction Details:
• Transaction ID: ${transactionResult.transactionId}
• Block Height: ${transactionResult.blockHeight}
• Amount: ${purchasedArtwork.nft_price} ICP

The NFT has been added to your collection and will appear in your "My Studio" purchased NFTs section.
      `.trim();

      alert(successMessage);

      // Optional: Navigate to user's collection
      // navigate('/profile?tab=purchased');

    } catch (error) {
      console.error('❌ Purchase failed:', error);
      alert(`Purchase failed: ${error.message}`);
    }
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

          {/* 🔥 NEW: Connection status indicator */}
          {!isConnected && (
            <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
              Connect wallet to purchase
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Image */}
          <div className="space-y-4">
            <div className="bg-card rounded-2xl p-4 shadow-sm relative">
              <img
                src={`${ipfsBase}${image_url}`}
                alt={title}
                className={`w-full aspect-square object-cover rounded-xl ${
                  isSold ? "opacity-75" : ""
                }`}
              />
              {/* Sold Out Overlay */}
              {isSold && (
                <div className="absolute inset-4 bg-black bg-opacity-50 rounded-xl flex items-center justify-center">
                  <div className="bg-red-500 text-white px-6 py-3 rounded-xl font-bold text-xl transform -rotate-12 shadow-lg">
                    SOLD OUT
                  </div>
                </div>
              )}

              {/* 🔥 NEW: Processing overlay during purchase */}
              {isPurchasing && (
                <div className="absolute inset-4 bg-blue-500 bg-opacity-75 rounded-xl flex items-center justify-center">
                  <div className="bg-white text-blue-600 px-6 py-3 rounded-xl font-bold text-lg shadow-lg flex items-center gap-3">
                    <div className="w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    PROCESSING PURCHASE...
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
                <div className="mb-6">
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
            <div className="bg-card rounded-2xl p-6 shadow-sm">
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
                  disabled={isSold || isPurchasing || !isConnected}
                  className={`w-full py-4 rounded-xl font-semibold text-lg transition-colors flex items-center justify-center gap-2 shadow-lg ${
                    isSold
                      ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                      : isPurchasing
                      ? 'bg-blue-400 text-white cursor-not-allowed'
                      : !isConnected
                      ? 'bg-orange-500 text-white cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isPurchasing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : isSold ? (
                    'Sold Out'
                  ) : !isConnected ? (
                    'Connect Wallet'
                  ) : (
                    <>
                      <ShoppingCart size={20} />
                      Buy Now
                    </>
                  )}
                </button>

                {/* {email && email !== "N/A" && (
                  <button
                    onClick={handleContactArtist}
                    disabled={isPurchasing}
                    className="w-full border-2 border-border text-gray-700 py-3 rounded-xl font-semibold hover:border-gray-400 hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Contact Artist
                  </button>
                )} */}
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

              {/* 🔥 NEW: Purchase status messages */}
              {!isConnected && (
                <div className="mt-4 p-3 bg-orange-100 border border-orange-300 rounded-lg">
                  <p className="text-orange-800 text-sm text-center">
                    Please connect your Plug wallet to purchase this NFT
                  </p>
                </div>
              )}

              {isPurchasing && (
                <div className="mt-4 p-3 bg-blue-100 border border-blue-300 rounded-lg">
                  <p className="text-blue-800 text-sm text-center">
                    Processing your purchase... Please wait.
                  </p>
                </div>
              )}
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
