import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient"; 
import ProfileForm from "./ProfileForm"; 
import ProfileDisplay from "./ProfileDisplay";
import { useUserContext } from "../context/UserContext";

const CheckProfileCompletion = ({ children }) => {
  const { principal } = useUserContext();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (!principal) {
      setLoading(false);
      return;
    }

    async function fetchProfile() {
      setLoading(true);
      try {
        console.log("Fetching profile for principal:", principal);
        
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("principal", principal)
          .maybeSingle(); // Use maybeSingle instead of single to avoid errors when no data

        if (error) {
          console.error("Error fetching profile:", error);
          setProfile(null);
        } else {
          console.log("Profile data:", data);
          setProfile(data);
        }
      } catch (err) {
        console.error("Unexpected error fetching profile:", err);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [principal]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-lg">Loading profile...</p>
    </div>
  );

  // No principal (not connected) → render app normally
  if (!principal) {
    return <>{children}</>;
  }

  // No profile yet → show form to create one
  if (!profile) {
    return (
      <ProfileForm
        principal={principal}
        onComplete={(newProfile) => setProfile(newProfile)}
      />
    );
  }

  // Profile exists → show profile display with edit option
  // You can change this to return children if you want the main app to show
  return (
    <ProfileDisplay 
      profile={profile} 
      principal={principal} 
    />
  );
};

export default CheckProfileCompletion;
