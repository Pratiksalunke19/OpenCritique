import React, { useState } from "react";
import { X, Wallet, CreditCard, Shield } from "lucide-react";
import { opencritique_backend } from "../../../../declarations/opencritique_backend";
import { useUserContext } from "../context/UserContext";

const PurchaseModal = ({ artwork, isOpen, onClose, onPurchaseSuccess }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("wallet");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Get current user's principal from UserContext
  const { isConnected, principal, connectWallet } = useUserContext();

  const safePrice =
    typeof artwork.nft_price === "bigint"
      ? Number(artwork.nft_price)
      : artwork.nft_price || 0;
  const serviceFee = safePrice * 0.025;
  const totalPrice = safePrice + serviceFee;

  const handlePurchase = async () => {
    if (!isConnected || !principal) {
      setError("Please connect your wallet first");
      return;
    }

    if (!termsAccepted) {
      setError("Please accept the terms and conditions");
      return;
    }

    setIsProcessing(true);
    setError("");

    try {
      // Step 1: Validate payment (mock for now)
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Step 2: Set NFT buyer in backend
      setCurrentStep(2);

    //   console.log("Artwork ID:", Number(artwork.id));
    //   console.log("Principal Object:", principalObj);
    //   console.log("Principal Text:", principal);
    //   console.log(
    //     "Is Principal valid:",
    //     principalObj && typeof principalObj.toText === "function"
    //   );

      // Only pass the artwork ID - backend will use caller() as buyer
      const result = await opencritique_backend.set_nft_buyer(
        Number(artwork.id)
      );

      if (result.Err) {
        throw new Error(result.Err);
      }

      console.log("Purchase successful:", result.Ok);

      // Step 3: Success
      setCurrentStep(3);

      // Update the local artwork object
      const updatedArtwork = {
        ...artwork,
        nft_buyer: principal,
      };

      onPurchaseSuccess(updatedArtwork);
    } catch (err) {
      console.error("Purchase failed:", err);
      setError(err.message || "Purchase failed. Please try again.");
      setIsProcessing(false);
      setCurrentStep(1);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">
            {currentStep === 1 && "Complete Purchase"}
            {currentStep === 2 && "Processing..."}
            {currentStep === 3 && "Purchase Successful!"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={isProcessing}
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* Step 1: Purchase Review */}
          {currentStep === 1 && (
            <div className="space-y-6">
              {/* Artwork Summary */}
              <div className="flex gap-4">
                <img
                  src={`https://gateway.pinata.cloud/ipfs/${artwork.image_url}`}
                  alt={artwork.title}
                  className="w-20 h-20 rounded-lg object-cover"
                />
                <div>
                  <h3 className="font-semibold text-lg">{artwork.title}</h3>
                  <p className="text-gray-600">by {artwork.username}</p>
                </div>
              </div>

              {/* Authentication Check */}
              {!isConnected ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800 mb-3">
                    Please connect your Plug wallet to purchase this NFT.
                  </p>
                  <button
                    onClick={handleConnectWallet}
                    className="w-full bg-yellow-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-yellow-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Wallet size={18} />
                    Connect Plug Wallet
                  </button>
                </div>
              ) : (
                <>
                  {/* Payment Method */}
                  <div>
                    <h4 className="font-semibold mb-3">Payment Method</h4>
                    <div className="space-y-2">
                      <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 border-blue-200 bg-blue-50">
                        <input
                          type="radio"
                          name="payment"
                          value="wallet"
                          checked={paymentMethod === "wallet"}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                        />
                        <Wallet size={20} className="text-blue-500" />
                        <div className="flex-1">
                          <p className="font-medium">Plug Wallet</p>
                          <p className="text-sm text-gray-500">
                            Pay with your ICP wallet
                          </p>
                          <p className="text-xs text-blue-600">
                            Connected: {principal?.slice(0, 10)}...
                            {principal?.slice(-6)}
                          </p>
                        </div>
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      </label>

                      <label className="flex items-center gap-3 p-3 border rounded-lg cursor-not-allowed opacity-50">
                        <input
                          type="radio"
                          name="payment"
                          value="card"
                          disabled
                        />
                        <CreditCard size={20} className="text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-400">
                            Credit Card
                          </p>
                          <p className="text-sm text-gray-400">Coming soon</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Price Breakdown */}
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span>NFT Price</span>
                      <span className="font-medium">{safePrice} ICP</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Service Fee (2.5%)</span>
                      <span className="font-medium">
                        {serviceFee.toFixed(3)} ICP
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Network Fee</span>
                      <span>~0.001 ICP</span>
                    </div>
                    <hr className="my-2" />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>{totalPrice.toFixed(3)} ICP</span>
                    </div>
                    <div className="text-xs text-gray-500 text-right">
                      ≈ ${(totalPrice * 12).toFixed(2)} USD
                    </div>
                  </div>

                  {/* Terms */}
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="terms"
                      className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                    />
                    <label
                      htmlFor="terms"
                      className="text-sm text-gray-600 leading-relaxed"
                    >
                      I agree to the{" "}
                      <span className="text-blue-600 underline cursor-pointer">
                        Terms of Service
                      </span>{" "}
                      and understand that blockchain transactions are
                      irreversible. I confirm that I have sufficient ICP balance
                      for this purchase.
                    </label>
                  </div>

                  {/* Purchase Button */}
                  <button
                    onClick={handlePurchase}
                    disabled={isProcessing || !termsAccepted}
                    className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <Shield size={20} />
                        Complete Purchase
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          )}

          {/* Step 2: Processing */}
          {currentStep === 2 && (
            <div className="text-center py-8">
              <div className="animate-spin w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-6"></div>
              <h3 className="text-xl font-semibold mb-2">
                Processing Your Purchase
              </h3>
              <p className="text-gray-600 mb-6">
                Please wait while we confirm your transaction on the Internet
                Computer...
              </p>

              <div className="space-y-3 text-left bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm">Validating payment...</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-sm">Transferring NFT ownership...</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                  <span className="text-sm">Updating marketplace...</span>
                </div>
              </div>

              <p className="text-xs text-gray-500 mt-4">
                This may take a few moments. Please don't close this window.
              </p>
            </div>
          )}

          {/* Step 3: Success */}
          {currentStep === 3 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-8 h-8 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>

              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                Congratulations!
              </h3>
              <p className="text-gray-600 mb-4">You are now the owner of</p>
              <p className="text-xl font-semibold text-gray-800 mb-6">
                "{artwork.title}"
              </p>

              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800 flex items-center justify-center gap-2">
                  <Shield className="w-4 h-4" />
                  Your NFT has been transferred to your wallet and is now
                  visible in your collection.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-3 mb-6 text-sm">
                <div className="flex justify-between mb-1">
                  <span className="text-gray-600">Transaction ID:</span>
                  <span className="font-mono text-xs">
                    #{artwork.id}-{Date.now()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Purchased for:</span>
                  <span className="font-semibold">
                    {totalPrice.toFixed(3)} ICP
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => window.open("/my-studio", "_self")}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  View in My Collection
                </button>
                <button
                  onClick={onClose}
                  className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PurchaseModal;
