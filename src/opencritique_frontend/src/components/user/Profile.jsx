import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient"; // Adjust path as needed
import { useUserContext } from "../context/UserContext";
import MyStudio from "../MyStudio";

export default function Profile() {
  const { isConnected, principal } = useUserContext();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!isConnected || !principal) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Fetch user profile from Supabase
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('principal', principal)
          .single();

        if (profileError) {
          // If profile doesn't exist, create a new one
          if (profileError.code === 'PGRST116') {
            const newProfile = {
              principal,
              name: null,
              username: principal?.substring(0, 8) || 'user',
              email: null,
              bio: null,
              image_url: null,
              socials: null,
              artwork_count: 0,
              critique_count: 0,
              upvote_count: 0,
              user_rank: null,
              liked_artwork_cids: [],
              purchased_nft_cids: []
            };

            const { data: createdProfile, error: createError } = await supabase
              .from('profiles')
              .insert([newProfile])
              .select()
              .single();

            if (createError) {
              throw createError;
            }

            setUser(createdProfile);
          } else {
            throw profileError;
          }
        } else {
          setUser(profileData);
        }

      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [isConnected, principal]);

  // Update profile function
  const updateProfile = async (updates) => {
    if (!user || !principal) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('principal', principal)
        .select()
        .single();

      if (error) throw error;
      setUser(data);
      return data;
    } catch (err) {
      console.error('Error updating profile:', err);
      throw err;
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="flex justify-center items-center py-16">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="text-center py-16">
          <div className="text-6xl mb-4 opacity-50">⚠️</div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Error Loading Profile
          </h3>
          <p className="text-muted-foreground mb-6">
            {error}
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg font-medium transition-all duration-200"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Not connected state
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="text-center py-16">
          <div className="text-6xl mb-4 opacity-50">🔗</div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Connect Your Wallet
          </h3>
          <p className="text-muted-foreground mb-6">
            Connect your Plug wallet to view your profile
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg font-medium transition-all duration-200"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

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
                  {user?.image_url ? (
                    <img
                      src={user.image_url}
                      alt="Profile Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-6xl font-bold text-orange-500">
                      {(user?.name || user?.username || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* User Info */}
            <div className="text-center lg:text-left flex-1">
              <div className="mb-4">
                <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent mb-2">
                  {user?.name || user?.username || 'Anonymous Artist'}
                </h1>
                <p className="text-xl text-purple-300 font-medium">
                  @{user?.username || principal?.substring(0, 8)}
                </p>
              </div>
              
              <p className="text-gray-300 text-lg max-w-2xl leading-relaxed mb-4">
                {user?.bio || "Digital artist exploring the intersection of creativity and technology."}
              </p>
              
              <div className="flex items-center justify-center lg:justify-start gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  <span>
                    Joined {user?.created_at 
                      ? new Date(user.created_at).toLocaleDateString('en-US', { 
                          month: 'long', 
                          year: 'numeric' 
                        })
                      : 'Recently'
                    }
                  </span>
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
              {user?.artwork_count || 0}
            </div>
            <div className="text-muted-foreground font-medium">Artworks</div>
          </div>
          
          <div className="bg-card/80 backdrop-blur border border-border rounded-2xl p-6 text-center hover:bg-card/90 transition-all duration-300 group">
            <div className="text-3xl font-bold text-blue-400 mb-2 group-hover:scale-110 transition-transform">
              {user?.critique_count || 0}
            </div>
            <div className="text-muted-foreground font-medium">Critiques</div>
          </div>
          
          <div className="bg-card/80 backdrop-blur border border-border rounded-2xl p-6 text-center hover:bg-card/90 transition-all duration-300 group">
            <div className="text-3xl font-bold text-green-400 mb-2 group-hover:scale-110 transition-transform">
              {user?.upvote_count || 0}
            </div>
            <div className="text-muted-foreground font-medium">Upvotes</div>
          </div>
          
          <div className="bg-card/80 backdrop-blur border border-border rounded-2xl p-6 text-center hover:bg-card/90 transition-all duration-300 group">
            <div className="text-3xl font-bold text-orange-400 mb-2 group-hover:scale-110 transition-transform">
              #{user?.user_rank || '∞'}
            </div>
            <div className="text-muted-foreground font-medium">Rank</div>
          </div>
        </div>

        {/* Social Links Section */}
        {user?.socials && Object.keys(user.socials).length > 0 && (
          <div className="bg-card/60 backdrop-blur border border-border rounded-2xl p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 text-foreground flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
              </svg>
              Social Links
            </h2>
            <div className="flex flex-wrap gap-3">
              {user.socials.twitter && (
                <a
                  href={user.socials.twitter}
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
              {user.socials.portfolio && (
                <a
                  href={user.socials.portfolio}
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

        {/* My Studio Section with Database Integration */}
        <div className="pb-8">
          <MyStudio 
            userProfile={user} 
            updateProfile={updateProfile}
            likedArtworkCids={user?.liked_artwork_cids || []}
            purchasedNftCids={user?.purchased_nft_cids || []}
          />
        </div>
      </div>
    </div>
  );
}
