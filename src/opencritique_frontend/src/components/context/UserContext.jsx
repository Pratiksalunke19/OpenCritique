import React, { createContext, useContext, useEffect, useState } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [principal, setPrincipal] = useState(null);
  const [principalObj, setPrincipalObj] = useState(null); // Add this

  const checkWalletConnection = async () => {
    try {
      const connected = await window.ic?.plug?.isConnected();
      setIsConnected(connected);

      if (connected) {
        const principalId = await window.ic.plug.agent.getPrincipal();
        setPrincipalObj(principalId); // Store the Principal object
        setPrincipal(principalId.toText()); // Store the string version
      }
    } catch (error) {
      console.error("Error checking Plug wallet connection:", error);
    }
  };

  const connectWallet = async () => {
    try {
      const whitelist = ["<your_canister_id_here>"]; // Replace with your canister ID
      const connected = await window.ic?.plug?.requestConnect({ whitelist });

      if (connected) {
        setIsConnected(true);
        const principalId = await window.ic.plug.agent.getPrincipal();
        setPrincipalObj(principalId); // Store the Principal object
        setPrincipal(principalId.toText()); // Store the string version
      }
    } catch (error) {
      console.error("Failed to connect Plug wallet:", error);
    }
  };

  useEffect(() => {
    checkWalletConnection();
  }, []);

  return (
    <UserContext.Provider value={{ 
      isConnected, 
      principal, 
      principalObj, // Expose the Principal object
      connectWallet 
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => useContext(UserContext);