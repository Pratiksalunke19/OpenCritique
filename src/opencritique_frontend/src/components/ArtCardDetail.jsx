import React from "react";
import { useParams } from "react-router-dom";
import { useArtContext } from "./context/ArtContext";
import { useState } from "react";
import { opencritique_backend } from "../../../declarations/opencritique_backend";
import { ThumbsUp } from "lucide-react";

const ArtCardDetail = () => {
  const ipfsBase = "https://gateway.pinata.cloud/ipfs/";
  const { id } = useParams();
  const { artworks } = useArtContext();

  const [critiqueText, setCritiqueText] = useState("");
  const [critiques, setCritiques] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const artwork = artworks.find((art) => art.id.toString() === id);

  React.useEffect(() => {
    fetchCritiques();
  }, [id]);

  React.useEffect(() => {}, [showForm]);

  const fetchCritiques = async () => {
    const result = await opencritique_backend.get_critiques(Number(id));
    setCritiques(result);
  };

  const handleSubmitCritique = async () => {
    try {
      setIsSubmitting(true);
      await opencritique_backend.post_critique(Number(id), critiqueText);
      setShowForm(false);
      setCritiqueText("");
      fetchCritiques(); // refresh critiques
    } catch (e) {
      console.error("Error submitting critique:", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpvote = async (critiqueId) => {
    try {
      await opencritique_backend.upvote_critique(critiqueId);
      fetchCritiques();
    } catch (e) {
      console.error("Upvote failed:", e);
    }
  };

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
              {/* Bounty Card */}
              {artwork.feedback_bounty > 0 && (
                <div className="bg-gradient-to-r from-green-900/20 to-green-800/20 rounded-xl p-4 border border-green-600/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm">💰</span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Bounty Reward</p>
                        <p className="text-xl font-bold text-green-400">
                          {bounty} ICP
                        </p>
                      </div>
                    </div>
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

            {/* Action Button */}
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

            {/* Stats Bar (Optional Enhancement) */}
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
            {/* Close Button */}
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

      {/* Critique List */}
      <div className="mt-8 w-full ">
        <h3 className="text-2xl text-primary mb-4">Community Critiques</h3>
        {critiques[0] ? (
          critiques.map((crit) => (
            <div
              key={crit.id}
              className="bg-[#1e293b] p-8 my-2 rounded-xl flex justify-between items-center"
            >
              <p>{crit.text}</p>
              <button
                onClick={() => handleUpvote(crit.id)}
                className="bg-primary px-3 py-1 rounded mt-2"
              >
                <ThumbsUp /> {crit.upvotes}
              </button>
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
