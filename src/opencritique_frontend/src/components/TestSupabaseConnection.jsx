import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

export default function TestSupabaseConnection() {
  const [connectionStatus, setConnectionStatus] = useState("Testing...");
  const [profiles, setProfiles] = useState([]);

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      // Test basic connection
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(5);

      if (error) {
        setConnectionStatus(`Connection Error: ${error.message}`);
        console.error('Supabase connection error:', error);
      } else {
        setConnectionStatus("✅ Connected to Supabase successfully!");
        setProfiles(data || []);
        console.log('Supabase connected! Found profiles:', data);
      }
    } catch (err) {
      setConnectionStatus(`Connection Failed: ${err.message}`);
      console.error('Connection test failed:', err);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Supabase Connection Test</h2>
      
      <div className="mb-4">
        <p className={`font-medium ${connectionStatus.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>
          {connectionStatus}
        </p>
      </div>

      {profiles.length > 0 && (
        <div>
          <h3 className="font-semibold mb-2">Existing Profiles ({profiles.length}):</h3>
          <div className="space-y-2">
            {profiles.map((profile, index) => (
              <div key={index} className="p-2 bg-gray-100 rounded text-sm">
                <p><strong>Name:</strong> {profile.name || 'N/A'}</p>
                <p><strong>Email:</strong> {profile.email || 'N/A'}</p>
                <p><strong>Principal:</strong> {profile.principal?.substring(0, 20)}...</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <button 
        onClick={testConnection}
        className="mt-4 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
      >
        Test Again
      </button>
    </div>
  );
}