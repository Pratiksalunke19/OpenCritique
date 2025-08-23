import React, { createContext, useContext, useEffect, useState } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [principal, setPrincipal] = useState(null);

  const checkWalletConnection = async () => {
    try {
      const connected = await window.ic?.plug?.isConnected();
      setIsConnected(connected);

      if (connected) {
        const principalId = await window.ic.plug.agent.getPrincipal();
        setPrincipal(principalId.toText());
      }
    } catch (error) {
      console.error("Error checking Plug wallet connection:", error);
    }
  };

  const connectWallet = async () => {
    try {
      const whitelist = ["uxrrr-q7777-77774-qaaaq-cai"]; // Your backend canister ID
      const connected = await window.ic?.plug?.requestConnect({ whitelist });

      if (connected) {
        setIsConnected(true);
        const principalId = await window.ic.plug.agent.getPrincipal();
        setPrincipal(principalId.toText());
      }
    } catch (error) {
      console.error("Failed to connect Plug wallet:", error);
    }
  };

  useEffect(() => {
    checkWalletConnection();
  }, []);

  return (
    <UserContext.Provider value={{ isConnected, principal, connectWallet }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => useContext(UserContext);
