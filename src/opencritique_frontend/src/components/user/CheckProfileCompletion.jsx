import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient"; 
import ProfileForm from "./ProfileForm"; 
import { useUserContext } from "../context/UserContext";
import LoadingSpinner from "../LoadingSpinner";

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
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("principal", principal)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching profile:", error);
      }

      setProfile(data); // will be null if not found
      setLoading(false);
    }

    fetchProfile();
  }, [principal]);

  if (loading) return <div className="h-[100vh] w-[100vw] mt-[500px]"><LoadingSpinner/></div>;

  // No profile yet → show form
  if (principal && !profile) {
    return (
      <ProfileForm
        principal={principal}
        onComplete={(newProfile) => setProfile(newProfile)} // 👈 pass callback
      />
    );
  }

  // Profile exists → render app
  return <>{children}</>;
};

export default CheckProfileCompletion;
