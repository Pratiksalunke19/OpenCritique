import React from "react";
import StatCard from "./StatCard";
import MyStudio from "../MyStudio";

export default function Profile({ user }) {
  // Example props structure:
  user = {
    name: "John Doe",
    username: "john_doe",
    bio: "Digital artist exploring surreal landscapes",
    avatar: "https://example.com/avatar.jpg",
    joinDate: "2025-08-01",
    artworks: 12,
    critiques: 5,
    upvotes: 30,
    rank: 2,
    links: { twitter: "https://twitter.com/johndoe" }
  };

  return (
    <div className="min-h-screen bg-panel text-white px-8 py-10 mt-[70px]">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
        <img
          src=""
          alt="Profile Avatar"
          className="w-32 h-32 rounded-full object-cover border-4 border-orange-500"
        />
        <div>
          <h1 className="text-3xl font-bold">{user.name}</h1>
          <p className="text-gray-400">@{user.username}</p>
          <p className="mt-2 text-gray-300">{user.bio}</p>
          <p className="mt-2 text-sm text-gray-500">
            Joined on {new Date(user.joinDate).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Artworks" value={user.artworks} />
        <StatCard label="Critiques" value={user.critiques} />
        <StatCard label="Upvotes" value={user.upvotes} />
        <StatCard label="Rank" value={`#${user.rank}`} />
      </div>

      {/* Links */}
      {user.links && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Links</h2>
          <div className="flex gap-4">
            {user.links.twitter && (
              <a
                href={user.links.twitter}
                target="_blank"
                rel="noreferrer"
                className="text-blue-400 hover:underline"
              >
                Twitter
              </a>
            )}
            {user.links.portfolio && (
              <a
                href={user.links.portfolio}
                target="_blank"
                rel="noreferrer"
                className="text-blue-400 hover:underline"
              >
                Portfolio
              </a>
            )}
          </div>
        </div>
      )}

      <div>
        <MyStudio/>
      </div>
    </div>
  );
}

