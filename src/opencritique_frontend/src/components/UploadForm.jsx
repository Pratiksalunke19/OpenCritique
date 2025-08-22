import React, { useState, useContext } from "react";
import { useArtContext } from "./context/ArtContext";
import { uploadToPinata } from "../services/pinataUpload";
import { opencritique_backend } from "../../../declarations/opencritique_backend";

const UploadForm = () => {
  const { fetchArtworks } = useArtContext();

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    tags: "",
    bounty: "",
    license: "",
    anonymous: false,
    artwork: null,
  });

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "file") {
      setFormData({ ...formData, artwork: files[0] });
    } else {
      setFormData({
        ...formData,
        [name]: type === "checkbox" ? checked : value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Upload to Pinata
      const cid = await uploadToPinata(formData.artwork);

      // 2. Detect media type and MIME
      const file = formData.artwork;
      const mimeType = file?.type || "application/octet-stream";
      let mediaType = "digital";

      if (mimeType.startsWith("image/")) mediaType = "image";
      else if (mimeType.startsWith("audio/")) mediaType = "music";
      else if (mimeType.startsWith("video/")) mediaType = "video";
      else if (mimeType === "text/plain") mediaType = "poetry";

      // Optional text excerpt for text files
      let textExcerpt = null;
      if (mediaType === "poetry" || mediaType === "rap") {
        const textContent = await file.text();
        textExcerpt = textContent.slice(0, 200); // preview first 200 chars
      }

      console.log("mime type: ",mimeType)
      console.log("media type: ",mediaType)

      // 3. Prepare optional field (Candid option => [] for None, [value] for Some)
      const candidTextExcerpt = textExcerpt ? [textExcerpt] : [];

      // 4. Prepare username/email
      const username = formData.anonymous
        ? "anonymous"
        : window.ic?.plug?.principalId || "guest";
      const email = formData.anonymous
        ? "anonymous@example.com"
        : "user@example.com";

      // 5. Call backend
      await opencritique_backend.upload_art(
        formData.title.trim(), // text
        formData.description.trim(), // text
        cid, // text
        username, // text
        email, // text
        formData.tags.split(",").map((tag) => tag.trim()), // vec text
        formData.bounty ? Number(formData.bounty) : 0, // nat64
        formData.license || "N/A", // text
        mediaType, // text
        mimeType, // text
        candidTextExcerpt // opt text
      );

      // 6. Refresh and notify
      await fetchArtworks();
      alert("Artwork uploaded successfully!");
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed. Check console.");
    } finally {
      // 7. Reset form
      setLoading(false);
      e.target.reset();
      setFormData({
        title: "",
        description: "",
        tags: "",
        bounty: "",
        license: "",
        anonymous: false,
        artwork: null,
      });
    }
  };

  return (
    <div className="flex justify-center items-center p-10 mt-[70px]">
      <form
        onSubmit={handleSubmit}
        className="max-w-xl bg-bg-panel p-6 rounded-xl shadow-md text-text-base space-y-4"
      >
        <h2 className="text-2xl font-bold text-center text-primary">
          Upload Artwork
        </h2>

        <input
          type="text"
          name="title"
          placeholder="Title"
          value={formData.title}
          onChange={handleChange}
          className="w-full p-3 rounded-md bg-bg-base border border-border text-text-base"
          required
        />

        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          className="w-full p-3 rounded-md bg-bg-base border border-border text-text-base"
          required
        />

        <div>
          <label className="block text-sm mb-1">Upload Art</label>
          <input
            type="file"
            name="artwork"
            accept="*"
            className="w-full bg-bg-base border border-border p-2 rounded-md"
            required
            onChange={handleChange}
          />
        </div>

        <input
          type="text"
          name="tags"
          placeholder="Tags (minimum 1 tag)"
          value={formData.tags}
          onChange={handleChange}
          className="w-full p-3 rounded-md bg-bg-base border border-border text-text-base"
          required
        />

        <input
          type="number"
          name="bounty"
          placeholder="Feedback bounty: amount (optional)"
          value={formData.bounty}
          onChange={handleChange}
          className="w-full p-3 rounded-md bg-bg-base border border-border text-text-base"
        />

        <input
          type="text"
          name="license"
          placeholder="License (optional)"
          value={formData.license}
          onChange={handleChange}
          className="w-full p-3 rounded-md bg-bg-base border border-border text-text-base"
        />

        <div className="flex items-center justify-between">
          <label className="text-text-muted">Post as anonymous?</label>
          <label className="inline-flex relative items-center cursor-pointer">
            <input
              type="checkbox"
              name="anonymous"
              checked={formData.anonymous}
              onChange={handleChange}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-border rounded-full peer peer-checked:bg-primary transition-all after:content-[''] after:absolute after:left-[4px] after:top-[4px] after:bg-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
          </label>
        </div>

        <button
          type="submit"
          className="w-full py-2 rounded-md bg-primary hover:bg-primary-hover text-white font-semibold"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin h-4 w-4 border-2 border-t-transparent border-black rounded-full p-2"></div>
              Uploading...
            </div>
          ) : (
            "Upload"
          )}
        </button>
      </form>
    </div>
  );
};

export default UploadForm;
