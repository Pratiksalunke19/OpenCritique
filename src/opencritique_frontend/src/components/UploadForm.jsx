import React, { useState } from "react";
import { useArtContext } from "./context/ArtContext";
import { useUserContext } from "./context/UserContext";
import { uploadToPinata } from "../services/pinataUpload";
import { opencritique_backend } from "../../../declarations/opencritique_backend";

const UploadForm = () => {
  const { fetchArtworks } = useArtContext();
  const { isConnected, principal, principalObj, connectWallet } =
    useUserContext();
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
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

  // Fund bounty escrow account
  const fundBountyEscrow = async (artworkId, bountyAmount) => {
    try {
      setUploadStatus("Getting escrow account...");

      // Get escrow account for the artwork
      const escrowResult =
        await opencritique_backend.get_artwork_escrow_account(artworkId);
      let escrowAccount;
      if (escrowResult.Ok) {
        escrowAccount = escrowResult.Ok;
      } else {
        throw new Error(
          `Failed to get escrow account: ${escrowResult.Err || "Unknown error"}`
        );
      }

      console.log("Escrow account:", escrowAccount);

      setUploadStatus("Requesting transfer approval...");

      // Convert ICP to e8s (1 ICP = 100,000,000 e8s)
      const amountE8s = Math.floor(parseFloat(bountyAmount) * 100000000);

      // ✅ FIX 1: Proper host configuration for requestTransfer
      const host =
        process.env.NODE_ENV === "development"
          ? "http://localhost:4943"
          : "https://ic0.app";

      // ✅ FIX 2: Ensure agent is properly configured with correct host
      if (!window.ic.plug.agent || window.ic.plug.agent._host !== host) {
        console.log("Reconfiguring Plug agent for transfer...");
        await window.ic.plug.requestConnect({
          whitelist: [
            "be2us-64aaa-aaaaa-qaabq-cai",
            "bkyz2-fmaaa-aaaaa-qaaaq-cai",
          ], // Add ledger canister
          host: host,
        });
      }

      // ✅ FIX 3: Simplified requestTransfer parameters
      const transferParams = {
        to: escrowAccount,
        amount: amountE8s,
      };

      console.log("Transfer parameters:", transferParams);
      console.log("Using host:", host);
      console.log("Agent host:", window.ic.plug.agent._host);

      // This will show Plug wallet popup for user approval
      const transferResult = await window.ic.plug.requestTransfer(
        transferParams
      );
      console.log("Transfer successful:", transferResult);

      setUploadStatus("Verifying bounty funding...");

      // Wait a moment for blockchain confirmation
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Verify the bounty balance
      const balance = await opencritique_backend.get_bounty_balance(artworkId);
      console.log("Bounty balance after funding:", balance);

      return transferResult;
    } catch (error) {
      console.error("Bounty funding failed:", error);
      throw new Error(`Bounty funding failed: ${error.message}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setUploadStatus("Preparing upload...");

    try {
      // Get authenticated principal from Plug
      if (!window.ic?.plug?.agent) {
        await connectWallet();
      }

      const plugPrincipal = await window.ic.plug.agent.getPrincipal();
      console.log("Using principal for upload:", plugPrincipal.toString());

      setUploadStatus("Uploading to IPFS...");

      // Upload to Pinata
      const cid = await uploadToPinata(formData.artwork);
      console.log("IPFS CID:", cid);

      const bountyInE8s = formData.bounty
        ? Math.floor(parseFloat(formData.bounty) * 100000000)
        : 0;

      setUploadStatus("Creating artwork on blockchain...");

      // ✅ FIXED: Proper Candid Option<String> formatting
      const result = await opencritique_backend.upload_art_with_principal(
        formData.title.trim(), // title: String
        formData.description.trim(), // description: String
        cid, // primary_url_or_cid: String
        formData.anonymous // username: String
          ? "Anonymous"
          : `${plugPrincipal.toString().substring(0, 8)}...`,
        formData.anonymous // email: String
          ? "anonymous@example.com"
          : `${plugPrincipal.toString().substring(0, 8)}@opencritique.com`,
        formData.tags.split(",").map((tag) => tag.trim()), // tags: Vec<String>
        bountyInE8s, // feedback_bounty: u64
        formData.license || "MIT", // license: String

        // ✅ FIX: Option<String> parameters as arrays
        formData.artwork.type.startsWith("image/") ? ["image"] : [], // media_type: Option<String>
        formData.artwork.type ? [formData.artwork.type] : [], // mime_type: Option<String>
        [], // text_excerpt: Option<String> (null)

        formData.is_nft, // is_nft: bool
        formData.nft_price // nft_price: u64
          ? Math.floor(parseFloat(formData.nft_price) * 100000000)
          : 0,
        "", // nft_buyer: String
        plugPrincipal // author_principal: Principal
      );

      console.log("✅ Upload successful with explicit principal!");

      // Get the artwork ID from the result or fetch latest
      const artworks =
        await opencritique_backend.get_my_artworks_using_principal(
          plugPrincipal
        );
      const latestArtwork = artworks[artworks.length - 1];
      const artworkId = latestArtwork.id;

      console.log("Created artwork with ID:", artworkId);

      // ✅ NEW: Auto-fund bounty if specified
      if (formData.bounty && parseFloat(formData.bounty) > 0) {
        setUploadStatus("Funding bounty escrow...");

        try {
          await fundBountyEscrow(artworkId, formData.bounty);
          setUploadStatus("Bounty funded successfully!");
        } catch (bountyError) {
          console.warn(
            "Artwork uploaded but bounty funding failed:",
            bountyError
          );
          alert(
            `Artwork uploaded successfully, but bounty funding failed: ${bountyError.message}\n\nYou can fund the bounty later from the artwork details page.`
          );
        }
      }

      await fetchArtworks();
      setUploadStatus("Upload complete!");

      alert(
        formData.bounty
          ? `Artwork uploaded and bounty of ${formData.bounty} ICP funded successfully!`
          : "Artwork uploaded successfully!"
      );

      // Reset form
      setFormData({
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
    } catch (error) {
      console.error("❌ Upload failed:", error);
      setUploadStatus("");
      alert(`Upload failed: ${error.message}`);
    } finally {
      setLoading(false);
      setUploadStatus("");
    }
  };

  return (
    <div className="flex justify-center items-center p-6 md:p-10">
      <form
        onSubmit={handleSubmit}
        className="max-w-xl w-full bg-card border border-border p-6 md:p-8 rounded-2xl shadow-lg space-y-6"
      >
        {/* Wallet Connection Status */}
        {!isConnected ? (
          <div className="bg-destructive/10 border border-destructive/30 text-destructive-foreground rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <span className="text-destructive">⚠️</span>
              <div>
                <p className="text-foreground font-medium">
                  Wallet Not Connected
                </p>
                <p className="text-muted-foreground text-sm">
                  Connect your Plug wallet to upload artwork
                </p>
              </div>
              <button
                type="button"
                onClick={connectWallet}
                className="ml-auto bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium transition interactive-button"
              >
                Connect Wallet
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <span className="text-green-500">✅</span>
              <div>
                <p className="text-foreground font-medium">Wallet Connected</p>
                <p className="text-muted-foreground text-sm">
                  Principal: {principal?.substring(0, 16)}...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Upload Status Indicator */}
        {loading && uploadStatus && (
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <svg
                className="animate-spin h-5 w-5 text-blue-500"
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
              <p className="text-foreground font-medium">{uploadStatus}</p>
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
          className="w-full p-3 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-primary focus:outline-none transition"
          required
        />

        {/* Description */}
        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          className="w-full p-3 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-primary focus:outline-none transition"
          required
        />

        {/* Drag & Drop Upload */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="w-full h-40 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl bg-background cursor-pointer hover:border-primary transition"
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
                  <p className="text-foreground font-medium">
                    {formData.artwork.name}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {(formData.artwork.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center">
              <span className="text-4xl mb-2">📂</span>
              <p className="text-muted-foreground">
                Drag & drop your art here, or click to browse
              </p>
              <p className="text-muted-foreground text-sm mt-1">
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
          className="w-full p-3 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-primary focus:outline-none transition"
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
              className="w-full p-3 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-primary focus:outline-none transition"
            />
            {formData.bounty && (
              <div className="mt-1 space-y-1">
                <p className="text-xs text-muted-foreground">
                  ≈ {(parseFloat(formData.bounty) * 100000000).toLocaleString()}{" "}
                  e8s
                </p>
                <p className="text-xs text-orange-400">
                  💰 Bounty will be auto-funded from your Plug wallet
                </p>
              </div>
            )}
          </div>
          <input
            type="text"
            name="license"
            placeholder="License (e.g., MIT, CC-BY)"
            value={formData.license}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-primary focus:outline-none transition"
          />
        </div>

        {/* NFT Options */}
        <div className="bg-background/40 border border-border rounded-lg p-4 space-y-3">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-foreground">Mint as NFT?</span>
            <input
              type="checkbox"
              name="is_nft"
              checked={formData.is_nft}
              onChange={handleChange}
              className="toggle-checkbox sr-only"
            />
            <div className="w-11 h-6 bg-muted rounded-full relative transition-all peer-checked:bg-primary">
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
              className="w-full p-3 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-primary focus:outline-none transition"
            />
          )}
        </div>

        {/* Anonymous Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <label className="text-foreground font-medium">
              Post as anonymous?
            </label>
            <p className="text-muted-foreground text-sm">
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
            <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:bg-primary transition-all after:content-[''] after:absolute after:left-[4px] after:top-[4px] after:bg-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full"></div>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !isConnected}
          className={`w-full py-3 rounded-lg font-semibold shadow-md transition-all duration-200 ${
            loading || !isConnected
              ? "bg-muted text-muted-foreground cursor-not-allowed"
              : "bg-primary hover:bg-primary/90 text-primary-foreground interactive-button"
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
              {uploadStatus || "Uploading..."}
            </div>
          ) : !isConnected ? (
            "Connect Wallet to Upload"
          ) : (
            `Upload Artwork ${
              formData.bounty ? `(+ Fund ${formData.bounty} ICP Bounty)` : ""
            }`
          )}
        </button>

        {/* Help Text */}
        <div className="text-center text-muted-foreground text-sm space-y-1">
          <p>Your artwork will be stored on IPFS via Pinata</p>
          {formData.bounty && (
            <p className="text-orange-400">
              💡 Bounty will be automatically funded via Plug wallet approval
            </p>
          )}
        </div>
      </form>
    </div>
  );
};

export default UploadForm;
