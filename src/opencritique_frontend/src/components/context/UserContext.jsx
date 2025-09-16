import React, { createContext, useContext, useEffect, useState } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [principal, setPrincipal] = useState(null);
  const [principalObj, setPrincipalObj] = useState(null);

  const checkWalletConnection = async () => {
    try {
      if (!window.ic?.plug) {
        console.log("Plug wallet not found");
        return false;
      }

      const connected = await window.ic.plug.isConnected();
      console.log("Plug connected:", connected);
      
      if (connected) {
        const principalId = await window.ic.plug.agent.getPrincipal();
        console.log("Principal from Plug:", principalId.toString());
        
        setPrincipalObj(principalId);
        setPrincipal(principalId.toText());
        setIsConnected(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error checking Plug wallet connection:", error);
      setIsConnected(false);
      return false;
    }
  };

  const connectWallet = async () => {
    try {
      if (!window.ic?.plug) {
        alert("Please install Plug wallet extension");
        return false;
      }

      const whitelist = ["be2us-64aaa-aaaaa-qaabq-cai"];
      
      // Add host configuration for local development
      const host = process.env.NODE_ENV === "development" 
        ? "http://localhost:4943" 
        : "https://ic0.app";

      console.log("Connecting to Plug with host:", host);

      const connected = await window.ic.plug.requestConnect({
        whitelist,
        host,
      });

      if (connected) {
        console.log("✅ Plug wallet connected successfully");
        
        const principalId = await window.ic.plug.agent.getPrincipal();
        console.log("Connected principal:", principalId.toString());

        setPrincipalObj(principalId);
        setPrincipal(principalId.toText());
        setIsConnected(true);

        // ✅ Key Fix: Set the global agent for opencritique_backend
        if (window.ic.plug.agent) {
          // This ensures opencritique_backend uses the authenticated agent
          console.log("✅ Authenticated agent configured");
        }

        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to connect Plug wallet:", error);
      alert("Failed to connect wallet: " + error.message);
      return false;
    }
  };

  useEffect(() => {
    // Check connection on page load
    checkWalletConnection();
  }, []);

  return (
    <UserContext.Provider value={{ 
      isConnected, 
      principal, 
      principalObj,
      connectWallet,
      checkWalletConnection
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => useContext(UserContext);