import { useState } from "react";
import ProfileForm from "./ProfileForm";

export default function ProfileDisplay({ profile, principal }) {
  const [isEditing, setIsEditing] = useState(false);

  const handleEditComplete = (updatedProfile) => {
    setIsEditing(false);
    // The ProfileForm will reload the page, so no need to update state here
  };

  if (isEditing) {
    return (
      <ProfileForm
        principal={principal}
        existingProfile={profile}
        onComplete={handleEditComplete}
      />
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-bg-base mt-[70px]">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
        <div className="text-center mb-6">
          {profile.image_url && (
            <img
              src={profile.image_url}
              alt="Profile"
              className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
            />
          )}
          <h2 className="text-2xl font-bold">{profile.name}</h2>
          <p className="text-gray-600">{profile.email}</p>
        </div>

        {profile.bio && (
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Bio</h3>
            <p className="text-gray-700">{profile.bio}</p>
          </div>
        )}

        {profile.socials && (
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Social Media</h3>
            <div className="space-y-2">
              {profile.socials.twitter && (
                <p className="text-gray-700">
                  <span className="font-medium">Twitter:</span> @{profile.socials.twitter}
                </p>
              )}
              {profile.socials.instagram && (
                <p className="text-gray-700">
                  <span className="font-medium">Instagram:</span> @{profile.socials.instagram}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="text-xs text-gray-500 mb-4">
          <p><span className="font-medium">Principal ID:</span> {profile.principal}</p>
          <p><span className="font-medium">Last Updated:</span> {new Date(profile.updated_at).toLocaleDateString()}</p>
        </div>

        <button
          onClick={() => setIsEditing(true)}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-semibold transition"
        >
          Edit Profile
        </button>
      </div>
    </div>
  );
}