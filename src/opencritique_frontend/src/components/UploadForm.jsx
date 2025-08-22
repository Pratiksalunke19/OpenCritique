import React, { useState } from "react";
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
      // Upload to Pinata
      const cid = await uploadToPinata(formData.artwork);
      const file = formData.artwork;
      const mimeType = file?.type || "application/octet-stream";

      let mediaType = "digital";
      if (mimeType.startsWith("image/")) mediaType = "image";
      else if (mimeType.startsWith("audio/")) mediaType = "music";
      else if (mimeType.startsWith("video/")) mediaType = "video";
      else if (mimeType === "text/plain") mediaType = "poetry";

      let textExcerpt = null;
      if (mediaType === "poetry" || mediaType === "rap") {
        const textContent = await file.text();
        textExcerpt = textContent.slice(0, 200);
      }

      const username = formData.anonymous
        ? "anonymous"
        : window.ic?.plug?.principalId || "guest";
      const email = formData.anonymous
        ? "anonymous@example.com"
        : "user@example.com";

      await opencritique_backend.upload_art(
        formData.title.trim(),
        formData.description.trim(),
        cid,
        formData.anonymous? "Anonymous" : username,
        email,
        formData.tags.split(",").map((tag) => tag.trim()),
        formData.bounty ? Number(formData.bounty) : 0,
        formData.license || "N/A",
        mediaType ? [mediaType] : [],
        mimeType ? [mimeType] : [],
        textExcerpt ? [textExcerpt] : []
      );

      await fetchArtworks();
      alert("Artwork uploaded successfully!");
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed. Check console.");
    } finally {
      setLoading(false);
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
        className="max-w-xl w-full bg-[#1e293b] p-8 rounded-2xl shadow-lg space-y-6"
      >
        {/* <h2 className="text-2xl font-bold text-center text-orange-400">
          Upload Artwork
        </h2> */}

        {/* Title */}
        <input
          type="text"
          name="title"
          placeholder="Artwork Title"
          value={formData.title}
          onChange={handleChange}
          className="w-full p-3 rounded-lg bg-[#0f172a] border border-gray-600 text-white"
          required
        />

        {/* Description */}
        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          className="w-full p-3 rounded-lg bg-[#0f172a] border border-gray-600 text-white"
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
                <p className="text-gray-300">{formData.artwork.name}</p>
              )}
            </div>
          ) : (
            <p className="text-gray-400">📂 Drag & drop your art here, or click to browse</p>
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
          placeholder="Tags (comma separated)"
          value={formData.tags}
          onChange={handleChange}
          className="w-full p-3 rounded-lg bg-[#0f172a] border border-gray-600 text-white"
          required
        />

        {/* Optional Fields */}
        <div className="grid grid-cols-2 gap-4">
          <input
            type="number"
            name="bounty"
            placeholder="Bounty (optional)"
            value={formData.bounty}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-[#0f172a] border border-gray-600 text-white"
          />
          <input
            type="text"
            name="license"
            placeholder="License (optional)"
            value={formData.license}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-[#0f172a] border border-gray-600 text-white"
          />
        </div>

        {/* Anonymous Toggle */}
        <div className="flex items-center justify-between">
          <label className="text-gray-300">Post as anonymous?</label>
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

        {/* Submit */}
        <button
          type="submit"
          className="w-full py-3 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-semibold shadow-md"
        >
          {loading ? "Uploading..." : "Upload"}
        </button>
      </form>
    </div>
  );
};

export default UploadForm;
