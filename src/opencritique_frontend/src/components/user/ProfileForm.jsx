import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function ProfileForm({ principal, onComplete }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    bio: "",
    image_url: "",
    twitter: "",
    instagram: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Build socials object only if values exist
    const socials = {};
    if (formData.twitter) socials.twitter = formData.twitter;
    if (formData.instagram) socials.instagram = formData.instagram;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .upsert(
          [
            {
              wallet_address: principal,
              name: formData.name,
              email: formData.email,
              bio: formData.bio,
              image_url: formData.image_url,
              socials: Object.keys(socials).length > 0 ? socials : null,
              updated_at: new Date().toISOString(),
            },
          ],
          { onConflict: ["principal"] } // ensures unique constraint
        )
        .select()
        .single();

      if (error) {
        console.error("Error saving profile:", error);
        setError("Failed to save profile. Please try again.");
      } else {
        onComplete(data); // Pass saved profile back to parent
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="bg-card border border-border rounded-2xl shadow-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-heading font-bold mb-6 text-center text-foreground">
          Complete Your Profile
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
            className="w-full bg-background border border-input text-foreground rounded-lg p-3"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full bg-background border border-input text-foreground rounded-lg p-3"
            required
          />
          <textarea
            name="bio"
            placeholder="Bio"
            value={formData.bio}
            onChange={handleChange}
            className="w-full bg-background border border-input text-foreground rounded-lg p-3"
            rows={3}
          />
          <input
            type="url"
            name="image_url"
            placeholder="Profile Image URL"
            value={formData.image_url}
            onChange={handleChange}
            className="w-full bg-background border border-input text-foreground rounded-lg p-3"
          />
          <input
            type="text"
            name="twitter"
            placeholder="Twitter handle"
            value={formData.twitter}
            onChange={handleChange}
            className="w-full bg-background border border-input text-foreground rounded-lg p-3"
          />
          <input
            type="text"
            name="instagram"
            placeholder="Instagram handle"
            value={formData.instagram}
            onChange={handleChange}
            className="w-full bg-background border border-input text-foreground rounded-lg p-3"
          />

          {error && <p className="text-destructive text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-lg font-semibold transition"
          >
            {loading ? "Saving..." : "Save Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}
