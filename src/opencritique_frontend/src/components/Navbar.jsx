import React from 'react';

const Navbar = () => {
  return (
    <nav className="bg-bg-panel text-text-base flex items-center justify-between px-6 py-4 border-b border-border shadow-md rounded-xl mx-4 mt-4">
      {/* Left Section: Logo + Brand */}
      <div className="flex items-center space-x-2">
        <div className="w-6 h-6 bg-primary rounded-full"></div>
        <span className="text-lg font-semibold">OpenCritique</span>
      </div>

      {/* Center Navigation Links */}
      <div className="space-x-8 hidden md:flex">
        <a href="#" className="hover:text-primary transition-colors">Home</a>
        <a href="#" className="hover:text-primary transition-colors">Trending</a>
        <a href="#" className="hover:text-primary transition-colors">Marketplace</a>
      </div>

      {/* Right Section: Connect Button */}
      <div>
        <button className="border border-primary text-primary hover:bg-primary hover:text-white transition-colors px-4 py-2 rounded-md">
          Connect with Wallet
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
