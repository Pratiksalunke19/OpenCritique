import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Aurora from "./Aurora/Aurora";

const Navbar = () => {
  const [connect, updateConnect] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkConnection = async () => {
      const isConnected = await window.ic?.plug?.isConnected?.();
      if (isConnected) {
        updateConnect(true);
      }
    };

    checkConnection();
  }, []);

  const handleConnect = async () => {
    const hasAllowed = await window.ic.plug.requestConnect();

    if (hasAllowed) {
      updateConnect(true);
      alert("Plug wallet is connected");
    } else {
      alert("Plug wallet connection was refused");
    }
  };

  const handleUploadClick = () => {
    navigate("/upload");
  };

  const navigateHome = () => {
    navigate("/");
  };

  return (
  <div className="relative">

    <nav className="fixed top-4 left-4 right-4 z-10 bg-bg-panel bg-opacity-70 backdrop-blur-md text-text-base flex items-center justify-between px-6 py-4 border-b border-border shadow-md rounded-xl ">
      {/* Logo */}
      <div className="flex items-center space-x-2 cursor-pointer" onClick={navigateHome}>
        <div className="w-6 h-6 bg-primary rounded-full"></div>
        <span className="text-lg font-semibold">OpenCritique</span>
      </div>

      {/* Center Nav Links */}
      <div className="space-x-8 hidden md:flex">
        <a href="/" className="hover:text-primary transition-colors">Home</a>
        <a href="/trending" className="hover:text-primary transition-colors">Trending</a>
        <a href="marketplace" className="hover:text-primary transition-colors">Marketplace</a>
        {connect && (
          <a href="/mystudio" className="hover:text-primary transition-colors">My Studio</a>
        )}
      </div>

      {/* Right Button */}
      <div>
        {connect ? (
          <button
            className="border border-primary text-primary hover:bg-primary hover:text-white transition-colors px-4 py-2 rounded-md"
            onClick={handleUploadClick}
          >
            Upload
          </button>
        ) : (
          <button
            className="border border-primary text-primary hover:bg-primary hover:text-white transition-colors px-4 py-2 rounded-md"
            onClick={handleConnect}
          >
            Connect with Wallet
          </button>
        )}
      </div>
    </nav>
  </div>
);
};

export default Navbar;
