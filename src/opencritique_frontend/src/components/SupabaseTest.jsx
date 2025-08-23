import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

export default function SupabaseTest() {
  const [status, setStatus] = useState("Testing connection...");
  const [profiles, setProfiles] = useState([]);
  const [testProfile, setTestProfile] = useState({
    name: "Test User",
    email: "test@example.com",
    principal: "test-principal-123"
  });

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
        setStatus(`❌ Connection Error: ${error.message}`);
        console.error('Supabase error:', error);
      } else {
        setStatus("✅ Connected to Supabase successfully!");
        setProfiles(data || []);
        console.log('Profiles found:', data);
      }
    } catch (err) {
      setStatus(`❌ Connection Failed: ${err.message}`);
      console.error('Connection test failed:', err);
    }
  };

  const createTestProfile = async () => {
    try {
      setStatus("Creating test profile...");
      
      const { data, error } = await supabase
        .from('profiles')
        .insert([testProfile])
        .select()
        .single();

      if (error) {
        setStatus(`❌ Insert Error: ${error.message}`);
        console.error('Insert error:', error);
      } else {
        setStatus("✅ Test profile created successfully!");
        setProfiles([...profiles, data]);
        console.log('Created profile:', data);
      }
    } catch (err) {
      setStatus(`❌ Insert Failed: ${err.message}`);
      console.error('Insert failed:', err);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>
      
      <div className="mb-6">
        <p className={`text-lg font-medium ${status.includes('✅') ? 'text-green-600' : status.includes('❌') ? 'text-red-600' : 'text-blue-600'}`}>
          {status}
        </p>
      </div>

      <div className="space-y-4">
        <button 
          onClick={testConnection}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Test Connection
        </button>

        <button 
          onClick={createTestProfile}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 ml-2"
        >
          Create Test Profile
        </button>
      </div>

      {profiles.length > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold mb-2">Existing Profiles ({profiles.length}):</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {profiles.map((profile, index) => (
              <div key={index} className="p-3 bg-gray-100 rounded text-sm">
                <p><strong>Name:</strong> {profile.name || 'N/A'}</p>
                <p><strong>Email:</strong> {profile.email || 'N/A'}</p>
                <p><strong>Principal:</strong> {profile.principal?.substring(0, 30)}...</p>
                <p><strong>Created:</strong> {new Date(profile.created_at).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 p-4 bg-gray-50 rounded">
        <h4 className="font-semibold mb-2">Environment Check:</h4>
        <p><strong>Supabase URL:</strong> {import.meta.env.VITE_SUPABASE_URL || 'Not set'}</p>
        <p><strong>Anon Key:</strong> {import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set ✅' : 'Not set ❌'}</p>
      </div>
    </div>
  );
}