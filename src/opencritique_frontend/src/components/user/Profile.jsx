import React from "react";
import StatCard from "./StatCard";
import MyStudio from "../MyStudio";

export default function Profile() {
  // Example props structure:
  let user = {
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
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section with Gradient Background */}
      <div className="relative bg-gradient-to-br from-purple-600/20 via-blue-500/10 to-orange-500/20 pt-24 pb-8">
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative max-w-7xl mx-auto px-6">
          {/* Profile Header */}
          <div className="flex flex-col lg:flex-row items-center lg:items-end gap-8">
            {/* Avatar with Glowing Border */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 via-purple-500 to-blue-500 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
              <div className="relative">
                <div className="w-36 h-36 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 border-4 border-orange-500/50 flex items-center justify-center overflow-hidden">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt="Profile Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-6xl font-bold text-orange-500">
                      {user.name.charAt(0)}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* User Info */}
            <div className="text-center lg:text-left flex-1">
              <div className="mb-4">
                <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent mb-2">
                  {user.name}
                </h1>
                <p className="text-xl text-purple-300 font-medium">@{user.username}</p>
              </div>
              
              <p className="text-gray-300 text-lg max-w-2xl leading-relaxed mb-4">
                {user.bio}
              </p>
              
              <div className="flex items-center justify-center lg:justify-start gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  <span>Joined {new Date(user.joinDate).toLocaleDateString('en-US', { 
                    month: 'long', 
                    year: 'numeric' 
                  })}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-card/80 backdrop-blur border border-border rounded-2xl p-6 text-center hover:bg-card/90 transition-all duration-300 group">
            <div className="text-3xl font-bold text-purple-400 mb-2 group-hover:scale-110 transition-transform">
              {user.artworks}
            </div>
            <div className="text-muted-foreground font-medium">Artworks</div>
          </div>
          
          <div className="bg-card/80 backdrop-blur border border-border rounded-2xl p-6 text-center hover:bg-card/90 transition-all duration-300 group">
            <div className="text-3xl font-bold text-blue-400 mb-2 group-hover:scale-110 transition-transform">
              {user.critiques}
            </div>
            <div className="text-muted-foreground font-medium">Critiques</div>
          </div>
          
          <div className="bg-card/80 backdrop-blur border border-border rounded-2xl p-6 text-center hover:bg-card/90 transition-all duration-300 group">
            <div className="text-3xl font-bold text-green-400 mb-2 group-hover:scale-110 transition-transform">
              {user.upvotes}
            </div>
            <div className="text-muted-foreground font-medium">Upvotes</div>
          </div>
          
          <div className="bg-card/80 backdrop-blur border border-border rounded-2xl p-6 text-center hover:bg-card/90 transition-all duration-300 group">
            <div className="text-3xl font-bold text-orange-400 mb-2 group-hover:scale-110 transition-transform">
              #{user.rank}
            </div>
            <div className="text-muted-foreground font-medium">Rank</div>
          </div>
        </div>

        {/* Links Section */}
        {user.links && (
          <div className="bg-card/60 backdrop-blur border border-border rounded-2xl p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 text-foreground flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
              </svg>
              Links
            </h2>
            <div className="flex flex-wrap gap-3">
              {user.links.twitter && (
                <a
                  href={user.links.twitter}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-lg text-blue-300 hover:from-blue-500/30 hover:to-blue-600/30 hover:border-blue-400/50 transition-all duration-300 group"
                >
                  <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                  Twitter
                </a>
              )}
              {user.links.portfolio && (
                <a
                  href={user.links.portfolio}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-lg text-purple-300 hover:from-purple-500/30 hover:to-purple-600/30 hover:border-purple-400/50 transition-all duration-300 group"
                >
                  <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9m0 9c-5 0-9-4-9-9s4-9 9-9" />
                  </svg>
                  Portfolio
                </a>
              )}
            </div>
          </div>
        )}

        {/* My Studio Section */}
        <div className="pb-8">
          <MyStudio/>
        </div>
      </div>
    </div>
  );
}
