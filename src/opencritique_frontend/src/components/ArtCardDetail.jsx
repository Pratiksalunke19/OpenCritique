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
        <div className="w-full md:w-1/2 p-4">
          <img
            src={`${ipfsBase}${image_url}`}
            alt={title}
            className="rounded-2xl shadow-lg w-full object-cover max-h-[600px]"
          />
        </div>

        {/* Right side: Details */}
        <div className="w-full md:w-1/2 p-6">
          <div className="bg-[#1e293b] rounded-2xl shadow-lg p-6 space-y-4">
            {/* Title & Description */}
            <h2 className="text-3xl font-bold text-primary">{title}</h2>
            <p className="text-gray-300 italic">{description}</p>

            {/* Metadata */}
            <div className="space-y-3 text-sm divide-y divide-gray-700">
              <div className="flex items-center gap-2 pt-2">
                <span className="text-orange-400 font-semibold">
                  👤 Artist:
                </span>
                <span>{username}</span>
              </div>

              {username != "Anonymous" && (
                <div className="flex items-center gap-2 pt-2">
                  <span className="text-orange-400 font-semibold">
                    📧 Email:
                  </span>
                  <span className="text-blue-400">{email}</span>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <span className="text-orange-400 font-semibold">
                  💰 Bounty:
                </span>
                <span>{bounty} ICP</span>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <span className="text-orange-400 font-semibold">
                  📜 License:
                </span>
                <span>{license}</span>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <span className="text-orange-400 font-semibold">🏷️ Tags:</span>
                <span>{tags?.join(", ") || "None"}</span>
              </div>
            </div>

            {/* Critique button */}
            <button
              className="mt-4 w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-lg shadow-md transition duration-200"
              onClick={() => setShowForm(true)}
            >
              ✍️ Critique this Artwork
            </button>
          </div>
        </div>
      </div>

      {/* Critique Form */}
      {showForm && (
        <div className="mt-8 bg-[#1e293b] w-full p-4 rounded-lg">
          <textarea
            value={critiqueText}
            onChange={(e) => setCritiqueText(e.target.value)}
            className="w-full p-2 rounded text-black"
            rows={4}
            cols={60}
            placeholder="Write your critique here..."
          />
          <button
            onClick={handleSubmitCritique}
            className="mt-2 bg-green-600 px-4 py-2 rounded hover:bg-green-700"
          >
            {isSubmitting && (
              <svg
                className="animate-spin h-4 w-4 text-white"
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
            Submit
          </button>
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
                <ThumbsUp/> {crit.upvotes}
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
