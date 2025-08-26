import React, { useState } from "react";
import { useArtContext } from "./context/ArtContext";
import { useUserContext } from "./context/UserContext"; // Add this import
import { uploadToPinata } from "../services/pinataUpload";
import { opencritique_backend } from "../../../declarations/opencritique_backend";

const UploadForm = () => {
  const { fetchArtworks } = useArtContext();
  const { isConnected, principal, principalObj, connectWallet, actor } =
    useUserContext(); // Add this
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    tags: "",
    bounty: "",
    license: "",
    anonymous: false,
    artwork: null,
    is_nft: false,
    nft_price: "",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Drag & Drop handlers
  const handleFileChange = (file) => {
    setFormData({ ...formData, artwork: file });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileChange(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Get authenticated principal from Plug
      if (!window.ic?.plug?.agent) {
        await connectWallet();
      }

      const plugPrincipal = await window.ic.plug.agent.getPrincipal();
      console.log("Using principal for upload:", plugPrincipal.toString());

      // Upload to Pinata
      const cid = await uploadToPinata(formData.artwork);

      const bountyInE8s = formData.bounty
        ? Math.floor(parseFloat(formData.bounty) * 100000000)
        : 0;

      // In UploadForm.jsx - call the new function
      const result = await opencritique_backend.upload_art_with_principal(
        formData.title.trim(),
        formData.description.trim(),
        cid,
        formData.anonymous
          ? "Anonymous"
          : plugPrincipal.toString().substring(0, 8) + "...",
        formData.anonymous
          ? "anonymous@example.com"
          : `${plugPrincipal.toString().substring(0, 8)}@opencritique.com`,
        formData.tags.split(",").map((tag) => tag.trim()),
        BigInt(bountyInE8s),
        formData.license || "MIT",
        ["image"],
        ["image/jpeg"],
        [],
        !!formData.is_nft,
        BigInt(
          formData.nft_price
            ? Math.floor(parseFloat(formData.nft_price) * 100000000)
            : 0
        ),
        "",
        plugPrincipal // The new principal parameter
      );

      console.log("✅ Upload successful with explicit principal!");

      await fetchArtworks();
      alert("Artwork uploaded successfully!");

      // Reset form...
    } catch (error) {
      console.error(" Upload failed:", error);
      alert(`Upload failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center p-10 mt-[70px]">
      <form
        onSubmit={handleSubmit}
        className="max-w-xl w-full bg-[#1e293b] p-8 rounded-2xl shadow-lg space-y-6"
      >
        {/* Wallet Connection Status */}
        {!isConnected ? (
          <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <span className="text-yellow-500">⚠️</span>
              <div>
                <p className="text-yellow-400 font-medium">
                  Wallet Not Connected
                </p>
                <p className="text-yellow-300 text-sm">
                  Connect your Plug wallet to upload artwork
                </p>
              </div>
              <button
                type="button"
                onClick={connectWallet}
                className="ml-auto bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
              >
                Connect Wallet
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <span className="text-green-500">✅</span>
              <div>
                <p className="text-green-400 font-medium">Wallet Connected</p>
                <p className="text-green-300 text-sm">
                  Principal: {principal?.substring(0, 16)}...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Title */}
        <input
          type="text"
          name="title"
          placeholder="Artwork Title"
          value={formData.title}
          onChange={handleChange}
          className="w-full p-3 rounded-lg bg-[#0f172a] border border-gray-600 text-white focus:border-orange-400 focus:outline-none transition"
          required
        />

        {/* Description */}
        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          className="w-full p-3 rounded-lg bg-[#0f172a] border border-gray-600 text-white focus:border-orange-400 focus:outline-none transition"
          required
        />

        {/* Drag & Drop Upload */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="w-full h-40 flex flex-col items-center justify-center border-2 border-dashed border-gray-500 rounded-xl bg-[#0f172a] cursor-pointer hover:border-orange-400 transition"
          onClick={() => document.getElementById("fileInput").click()}
        >
          {formData.artwork ? (
            <div className="text-center">
              {formData.artwork.type.startsWith("image/") ? (
                <img
                  src={URL.createObjectURL(formData.artwork)}
                  alt="preview"
                  className="max-h-32 mx-auto rounded-md"
                />
              ) : (
                <div className="flex flex-col items-center">
                  <span className="text-4xl mb-2">📄</span>
                  <p className="text-gray-300 font-medium">
                    {formData.artwork.name}
                  </p>
                  <p className="text-gray-500 text-sm">
                    {(formData.artwork.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center">
              <span className="text-4xl mb-2">📂</span>
              <p className="text-gray-400">
                Drag & drop your art here, or click to browse
              </p>
              <p className="text-gray-500 text-sm mt-1">
                Supports images, audio, video, text files
              </p>
            </div>
          )}
          <input
            type="file"
            id="fileInput"
            className="hidden"
            accept="*"
            onChange={(e) => handleFileChange(e.target.files[0])}
          />
        </div>

        {/* Tags */}
        <input
          type="text"
          name="tags"
          placeholder="Tags (comma separated) - e.g., digital, abstract, modern"
          value={formData.tags}
          onChange={handleChange}
          className="w-full p-3 rounded-lg bg-[#0f172a] border border-gray-600 text-white focus:border-orange-400 focus:outline-none transition"
          required
        />

        {/* Optional Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <input
              type="number"
              step="0.001"
              min="0"
              name="bounty"
              placeholder="Bounty in ICP (optional)"
              value={formData.bounty}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-[#0f172a] border border-gray-600 text-white focus:border-orange-400 focus:outline-none transition"
            />
            {formData.bounty && (
              <p className="text-xs text-gray-400 mt-1">
                ≈ {(parseFloat(formData.bounty) * 100000000).toLocaleString()}{" "}
                e8s
              </p>
            )}
          </div>
          <input
            type="text"
            name="license"
            placeholder="License (e.g., MIT, CC-BY)"
            value={formData.license}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-[#0f172a] border border-gray-600 text-white focus:border-orange-400 focus:outline-none transition"
          />
        </div>

        {/* NFT Options */}
        <div className="bg-gray-800/40 rounded-lg p-4 space-y-3">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-gray-300">Mint as NFT?</span>
            <input
              type="checkbox"
              name="is_nft"
              checked={formData.is_nft}
              onChange={handleChange}
              className="toggle-checkbox sr-only"
            />
            <div className="w-11 h-6 bg-gray-600 rounded-full relative transition-all peer-checked:bg-orange-500">
              <div
                className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  formData.is_nft ? "translate-x-5" : ""
                }`}
              ></div>
            </div>
          </label>

          {formData.is_nft && (
            <input
              type="number"
              step="0.001"
              min="0"
              name="nft_price"
              placeholder="NFT Price in ICP"
              value={formData.nft_price}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-[#0f172a] border border-gray-600 text-white focus:border-orange-400 focus:outline-none transition"
            />
          )}
        </div>

        {/* Anonymous Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <label className="text-gray-300 font-medium">
              Post as anonymous?
            </label>
            <p className="text-gray-500 text-sm">
              Hide your principal ID from public view
            </p>
          </div>
          <label className="inline-flex relative items-center cursor-pointer">
            <input
              type="checkbox"
              name="anonymous"
              checked={formData.anonymous}
              onChange={handleChange}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:bg-orange-500 transition-all after:content-[''] after:absolute after:left-[4px] after:top-[4px] after:bg-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full"></div>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !isConnected}
          className={`w-full py-3 rounded-lg font-semibold shadow-md transition-all duration-200 ${
            loading || !isConnected
              ? "bg-gray-600 text-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white transform hover:scale-[1.02]"
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-5 w-5"
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
              Uploading...
            </div>
          ) : !isConnected ? (
            "Connect Wallet to Upload"
          ) : (
            `Upload Artwork ${
              formData.bounty ? `(${formData.bounty} ICP Bounty)` : ""
            }`
          )}
        </button>

        {/* Help Text */}
        <div className="text-center text-gray-400 text-sm">
          <p>Your artwork will be stored on IPFS via Pinata</p>
          {/* {formData.bounty && (
            // <p className="text-orange-400 mt-1">
            //   💡 Remember to fund your bounty escrow account after upload
            // </p>
          )} */}
        </div>
      </form>
    </div>
  );
};

export default UploadForm;
