import React, { useEffect, useState } from "react";
import MyStudioArtCard from "./MyStudioArtCard";
import { opencritique_backend } from "../../../declarations/opencritique_backend";
import { useArtContext } from "./context/ArtContext";
import { useUserContext } from "./context/UserContext";
import { supabase } from "../lib/supabaseClient";

const MyStudio = () => {
  const ipfsBase = "https://gateway.pinata.cloud/ipfs/";
  const [connect, updateConnect] = useState(false);
  const [profile, setProfile] = useState(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: "",
    username: "",
    email: "",
    bio: "",
    image_url: "",
    links: []
  });
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const [activeTab, setActiveTab] = useState("your-collection");
  const [nftTab, setNftTab] = useState("minted");

  const { myArtworks, fetchMyArtworks, loadingMyArts } = useArtContext();
  const { principal, isConnected } = useUserContext();

  useEffect(() => {
    const checkConnection = async () => {
      if (isConnected && principal) {
        updateConnect(true);
        fetchProfile();
        // Only fetch artworks if we have a principal and are connected
        fetchMyArtworks();
      }
    };

    checkConnection();
  }, [isConnected, principal]);

    const [latestImageUrl, setLatestImageUrl] = useState(null);

  useEffect(() => {
    const fetchLatestImage = async () => {
      const uploadedUrl = await uploadProfileImage();
      if (uploadedUrl) {
        setLatestImageUrl(uploadedUrl);
      }
    };
    fetchLatestImage();
  }, []);

  const fetchProfile = async () => {
    if (!principal) return;
    
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("principal", principal)
        .single();

      if (data) {
        setProfile(data);
        setEditFormData({
          name: data.name || "",
          username: data.username || "",
          email: data.email || "",
          bio: data.bio || "",
          image_url: data.image_url || "",
          links: data.socials ? Object.entries(data.socials).map(([key, value]) => ({ type: key, url: value })) : []
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const handleEditProfile = () => {
    setShowEditDialog(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setUploading(true);
    
    try {
      let imageUrl = editFormData.image_url;

      // Upload new image if selected
      if (selectedFile) {
        const uploadedUrl = await uploadProfileImage();
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        } else {
          setUploading(false);
          return; // Stop if upload failed
        }
      }

      const socials = {};
      editFormData.links.forEach(link => {
        if (link.type && link.url) {
          socials[link.type] = link.url;
        }
      });

      const { data, error } = await supabase
        .from("profiles")
        .upsert({
          principal: principal,
          name: editFormData.name,
          username: editFormData.username,
          email: editFormData.email,
          bio: editFormData.bio,
          image_url: imageUrl,
          socials: Object.keys(socials).length > 0 ? socials : null,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error("Error saving profile:", error);
        alert("Failed to save profile");
      } else {
        setProfile(data);
        setShowEditDialog(false);
        setSelectedFile(null);
        alert("Profile updated successfully!");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save profile");
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (e) => {
    setEditFormData({
      ...editFormData,
      [e.target.name]: e.target.value
    });
  };

  const addLink = () => {
    setEditFormData({
      ...editFormData,
      links: [...editFormData.links, { type: "", url: "" }]
    });
  };

  const updateLink = (index, field, value) => {
    const newLinks = [...editFormData.links];
    newLinks[index][field] = value;
    setEditFormData({
      ...editFormData,
      links: newLinks
    });
  };

  const removeLink = (index) => {
    const newLinks = editFormData.links.filter((_, i) => i !== index);
    setEditFormData({
      ...editFormData,
      links: newLinks
    });
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      setSelectedFile(file);
    }
  };

const uploadProfileImage = async () => {
  if (!selectedFile || !principal) return null;

  setUploading(true);
  try {
    // Create unique filename
    const fileExt = selectedFile.name.split('.').pop();
    const fileName = `${principal}_${Date.now()}.${fileExt}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('profile_images')
      .upload(fileName, selectedFile, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Upload error:', error);
      return null;
    }

    // Get public URL
     try {
      const { data: { publicUrl } } = await supabase.storage
        .from('profile_images')
        .getPublicUrl(fileName);
      console.log('Public URL:', publicUrl); // Log the public URL to the console
      return publicUrl;
    } catch (error) {
      console.error('Error retrieving public URL:', error);
      throw error; // Re-throw the error to handle it further
    }
  } catch (error) {
    console.error('Upload error:', error);
    throw error; // Re-throw the error to handle it further
  } finally {
    setUploading(false);
  }
};

  return (
    <div className="min-h-screen bg-panel text-white px-8 py-10 mt-[70px]">
      {latestImageUrl && (
        <img src={latestImageUrl} alt="Latest Uploaded Image" />
      )}
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-start gap-6 mb-8">
        <img
          src={profile?.image_url || ""}
          alt="Profile Avatar"
          className="w-32 h-32 rounded-full object-cover border-4 border-orange-500"
        />
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-3xl font-bold">{profile?.name || "User"}</h1>
            <button
              onClick={handleEditProfile}
              className="p-2 text-orange-400 hover:text-orange-300 transition-colors"
              title="Edit Profile"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="m18.5 2.5 a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
          </div>
          <p className="text-gray-400 mb-2">@{profile?.username || "username"}</p>
          <p className="text-gray-300 mb-4">{profile?.bio || "No bio available"}</p>
          
          {/* Stats moved to right of name area */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-md">
            <div className="bg-bg-panel p-3 rounded-xl text-center shadow-md">
              <p className="text-xl font-bold text-orange-400">{myArtworks.length}</p>
              <p className="text-gray-400 text-sm">Artworks</p>
            </div>
            <div className="bg-bg-panel p-3 rounded-xl text-center shadow-md">
              <p className="text-xl font-bold text-orange-400">0</p>
              <p className="text-gray-400 text-sm">Critiques</p>
            </div>
            <div className="bg-bg-panel p-3 rounded-xl text-center shadow-md">
              <p className="text-xl font-bold text-orange-400">0</p>
              <p className="text-gray-400 text-sm">Upvotes</p>
            </div>
            <div className="bg-bg-panel p-3 rounded-xl text-center shadow-md">
              <p className="text-xl font-bold text-orange-400">#1</p>
              <p className="text-gray-400 text-sm">Rank</p>
            </div>
          </div>
        </div>
      </div>

      {/* Links */}
      {profile?.socials && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Links</h2>
          <div className="flex gap-4">
            {Object.entries(profile.socials).map(([key, value]) => (
              <a
                key={key}
                href={value}
                target="_blank"
                rel="noreferrer"
                className="text-blue-400 hover:underline capitalize"
              >
                {key}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Edit Profile Dialog */}
      {showEditDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Edit Profile</h2>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={editFormData.name}
                onChange={handleInputChange}
                className="w-full border rounded-lg p-3 text-gray-800"
                required
              />
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={editFormData.username}
                onChange={handleInputChange}
                className="w-full border rounded-lg p-3 text-gray-800"
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={editFormData.email}
                onChange={handleInputChange}
                className="w-full border rounded-lg p-3 text-gray-800"
                required
              />
              <textarea
                name="bio"
                placeholder="Bio"
                value={editFormData.bio}
                onChange={handleInputChange}
                className="w-full border rounded-lg p-3 text-gray-800"
                rows={3}
              />
              {/* Image Upload Section */}
              <div>
                <label className="block text-gray-800 font-semibold mb-2">Profile Image</label>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="w-full border rounded-lg p-3 text-gray-800"
                  />
                  {selectedFile && (
                    <p className="text-sm text-green-600">Selected: {selectedFile.name}</p>
                  )}
                  <p className="text-xs text-gray-500">Or enter image URL below:</p>
                  <input
                    type="url"
                    name="image_url"
                    placeholder="Profile Image URL"
                    value={editFormData.image_url}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg p-3 text-gray-800"
                  />
                </div>
              </div>
              
              {/* Links Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-gray-800 font-semibold">Social Links</label>
                  <button
                    type="button"
                    onClick={addLink}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="8" x2="12" y2="16"/>
                      <line x1="8" y1="12" x2="16" y2="12"/>
                    </svg>
                  </button>
                </div>
                {editFormData.links.map((link, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <select
                      value={link.type}
                      onChange={(e) => updateLink(index, 'type', e.target.value)}
                      className="border rounded-lg p-2 text-gray-800"
                    >
                      <option value="">Select type</option>
                      <option value="twitter">Twitter</option>
                      <option value="instagram">Instagram</option>
                      <option value="portfolio">Portfolio</option>
                      <option value="linkedin">LinkedIn</option>
                      <option value="github">GitHub</option>
                    </select>
                    <input
                      type="url"
                      placeholder="URL"
                      value={link.url}
                      onChange={(e) => updateLink(index, 'url', e.target.value)}
                      className="flex-1 border rounded-lg p-2 text-gray-800"
                    />
                    <button
                      type="button"
                      onClick={() => removeLink(index)}
                      className="text-red-500 hover:text-red-700 p-2"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowEditDialog(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold transition hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 bg-primary hover:bg-primary-hover text-white py-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Artworks Section */}
      <div className="flex justify-center mb-4">
        <button
          className={`px-4 py-2 rounded-lg ${
            activeTab === "your-collection" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-500"
          }`}
          onClick={() => setActiveTab("your-collection")}
        >
          Your Collection
        </button>
        <button
          className={`px-4 py-2 rounded-lg ${
            activeTab === "purchased-nfts" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-500"
          }`}
          onClick={() => setActiveTab("purchased-nfts")}
        >
          Purchased NFTs
        </button>
      </div>

      {activeTab === "your-collection" ? (
        <div>
          {myArtworks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myArtworks.map((artwork, index) => (
                <MyStudioArtCard key={index} artwork={artwork} />
              ))}
            </div>
          ) : (
            <p>No arts uploaded yet</p>
          )}
        </div>
      ) : (
        <div>
          <div className="flex justify-center mb-4">
            <button
              className={`px-4 py-2 rounded-lg ${
                nftTab === "minted" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-500"
              }`}
              onClick={() => setNftTab("minted")}
            >
              Minted
            </button>
            <button
              className={`px-4 py-2 rounded-lg ${
                nftTab === "sold" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-500"
              }`}
              onClick={() => setNftTab("sold")}
            >
              Sold
            </button>
          </div>
          {nftTab === "minted" ? (
            <p>No minted NFTs yet</p>
          ) : (
            <p>No sold NFTs yet</p>
          )}
        </div>
      )}
    </div>
  );
};

export default MyStudio;
