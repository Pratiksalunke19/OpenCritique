import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";


import Aurora from "./Aurora/Aurora";
import openCritiqueIcon from "../open_critique_icon.svg";
import GooeyNav from "./GooeyNav";

const Navbar = () => {
  const [connect, updateConnect] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
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
      {/* Blur overlay for navbar, covers the nav area and blurs content underneath */}
      <div className="pointer-events-none fixed top-4 left-4 right-4 z-10 h-[76px] rounded-xl backdrop-blur-md" style={{}}></div>
      <nav className="fixed top-4 left-4 right-4 z-20 bg-bg-panel bg-opacity-70 text-text-base flex flex-row-reverse md:flex-row items-center justify-between px-6 py-4 border-b border-border shadow-md rounded-xl ">
        {/* Logo */}
        <div
          className="flex items-center space-x-2 cursor-pointer"
          onClick={navigateHome}
        >
          {console.log('opencritique_icon: ',openCritiqueIcon)}
          <img
            src={openCritiqueIcon}
            alt="OpenCritique Icon"
            className="w-8 h-8 object-contain"
            style={{ minWidth: 24, minHeight: 24 }}
          />
          <span className="text-lg font-semibold">OpenCritique</span>
        </div>

        {/* Hamburger for mobile, right-aligned */}
        <div className="md:hidden flex items-center ml-auto">
          <button
            className="focus:outline-none"
            aria-label="Open menu"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <svg
              className="w-8 h-8 text-primary drop-shadow"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect x="4" y="7" width="16" height="2" rx="1" fill="currentColor" />
              <rect x="4" y="11" width="16" height="2" rx="1" fill="currentColor" />
              <rect x="4" y="15" width="16" height="2" rx="1" fill="currentColor" />
            </svg>
          </button>
        </div>

        {/* Right Nav Links and Button */}
        <div className="flex items-center gap-6 w-full md:w-auto justify-end">
          {/* GooeyNav replaces nav links on desktop */}
          <div className="hidden md:flex">
            <GooeyNav
              items={[
                { label: "Home", href: "/" },
                { label: "Trending", href: "/trending" },
                { label: "Marketplace", href: "/marketplace" },
                ...(connect ? [{ label: "My Studio", href: "/mystudio" }] : []),
              ]}
            />
          </div>
          {connect && (
            <button
              className="border border-primary text-primary hover:bg-primary hover:text-white transition-colors px-4 py-2 rounded-md md:inline-block hidden"
              onClick={handleUploadClick}
            >
              Upload
            </button>
          )}
          {/* Show Connect with Wallet only on desktop */}
          {!connect && (
            <button
              className="border border-primary text-primary hover:bg-primary hover:text-white transition-colors px-4 py-2 rounded-md md:inline-block hidden"
              onClick={handleConnect}
            >
              Connect with Wallet
            </button>
          )}
        </div>

        {/* Mobile Dropdown */}
        {menuOpen && (
          <div className="absolute top-full right-0 mt-2 w-48 bg-bg-panel bg-opacity-95 rounded-xl shadow-lg border border-border flex flex-col animate-fadeIn z-50 overflow-hidden">
            <Link
              to="/"
              className="px-6 py-3 text-base font-medium text-white hover:bg-primary/30 hover:text-primary focus:bg-primary/40 focus:text-primary transition-all duration-200 outline-none glow-nav"
              onClick={() => setMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/trending"
              className="px-6 py-3 text-base font-medium text-white hover:bg-primary/30 hover:text-primary focus:bg-primary/40 focus:text-primary transition-all duration-200 outline-none glow-nav"
              onClick={() => setMenuOpen(false)}
            >
              Trending
            </Link>
            <Link
              to="/marketplace"
              className="px-6 py-3 text-base font-medium text-white hover:bg-primary/30 hover:text-primary focus:bg-primary/40 focus:text-primary transition-all duration-200 outline-none glow-nav"
              onClick={() => setMenuOpen(false)}
            >
              Marketplace
            </Link>
            {connect && (
              <Link
                to="/mystudio"
                className="px-6 py-3 text-base font-medium text-white hover:bg-primary/30 hover:text-primary focus:bg-primary/40 focus:text-primary transition-all duration-200 outline-none glow-nav"
                onClick={() => setMenuOpen(false)}
              >
                My Studio
              </Link>
            )}
            {connect ? (
              <button
                className="m-3 border border-primary text-primary hover:bg-primary hover:text-white transition-colors px-4 py-2 rounded-md"
                onClick={() => { setMenuOpen(false); handleUploadClick(); }}
              >
                Upload
              </button>
            ) : (
              <button
                className="m-3 border border-primary text-primary hover:bg-primary hover:text-white transition-colors px-4 py-2 rounded-md"
                onClick={() => { setMenuOpen(false); handleConnect(); }}
              >
                Connect with Wallet
              </button>
            )}
          </div>
        )}
      </nav>
      {/* Dropdown animation keyframes and glow effect */}
      <style>{`
        @keyframes fadeIn {
          0% { opacity: 0; transform: translateY(-10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.25s cubic-bezier(.4,0,.2,1); }
        .glow-nav:hover, .glow-nav:focus {
          box-shadow: 0 0 8px 2px #ff9100, 0 0 16px 4px #ff9100;
        }
      `}</style>
    </div>
  );
};

export default Navbar;
