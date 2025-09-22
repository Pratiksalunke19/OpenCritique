import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import openCritiqueIcon from "../open_critique_icon.png";
import GooeyNav from "./GooeyNav";
import { cn } from "../lib/utils";

const Navbar = () => {
  // Preserve existing state and effects
  const [connect, updateConnect] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkConnection = async () => {
      const isConnected = await window.ic?.plug?.isConnected?.();
      if (isConnected) {
        updateConnect(true);
      }
    };
    checkConnection();

    // Add scroll listener for header effect
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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

  // Check if a path is active
  const isActivePath = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
      "border-b border-border animate-fade-in",
      scrolled 
        ? "bg-background/95 backdrop-blur-xl shadow-lg" 
        : "bg-background/80 backdrop-blur-md"
    )}>
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-4 md:p-6 lg:px-8">
        {/* Logo with Animation */}
        <div 
          className={cn(
            "flex items-center gap-2 cursor-pointer",
            "transition-transform duration-300 hover:scale-105"
          )} 
          onClick={navigateHome}
        >
          <div className="relative">
            <img
              src={openCritiqueIcon}
              alt="OpenCritique Icon"
              className={cn(
                "w-8 h-8 object-contain transition-all duration-500"
              )}
              style={{ minWidth: 24, minHeight: 24 }}
            />
            {/* Animated glow effect */}
            <div className={cn(
              "absolute inset-0 rounded-full bg-primary/20 blur-md -z-10",
              "transition-opacity duration-500",
              scrolled ? "opacity-100 animate-pulse-glow" : "opacity-0"
            )} />
          </div>
          <span className={cn(
            "text-xl md:text-2xl font-heading font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent",
            "transition-all duration-300",
            scrolled ? "tracking-tight" : "tracking-normal"
          )}>
            OpenCritique
          </span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex md:gap-x-2">
          <GooeyNav
            items={[
              { label: "Home", href: "/" },
              ...(!connect ? [{ label: "Trending", href: "/trending" }] : []),
              { label: "Marketplace", href: "/marketplace" },
              ...(connect ? [{ label: "My Studio", href: "/mystudio" }] : []),
            ]}
          />
        </div>

        {/* Desktop Actions with Animation */}
        <div className="hidden md:flex items-center gap-3">
          {connect ? (
            <button
              className={cn(
                "px-4 py-2 rounded-lg border border-border text-foreground",
                "hover:bg-primary/10 hover:text-primary transition-all duration-300",
                "hover:border-primary/50 hover:shadow-md hover:shadow-primary/10",
                "interactive-button"
              )}
              onClick={handleUploadClick}
            >
              Upload
            </button>
          ) : (
            <button
              className={cn(
                "px-4 py-2 rounded-lg gradient-primary text-primary-foreground",
                "hover:opacity-90 transition-all duration-300",
                "shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30",
                "interactive-button"
              )}
              onClick={handleConnect}
            >
              <span className="relative z-10">Connect Wallet</span>
            </button>
          )}
        </div>

        {/* Mobile Menu Button with Animation */}
        <div className="md:hidden">
          <button
            className={cn(
              "-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-foreground",
              "hover:bg-primary/10 hover:text-primary transition-colors duration-300"
            )}
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
          >
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Drawer with Animation */}
      {menuOpen && (
        <div className="md:hidden fixed inset-y-0 right-0 z-50 w-full sm:max-w-sm bg-background/95 backdrop-blur-xl px-6 py-6 border-l border-border animate-slide-in-right">
          <div className="flex items-center justify-between">
            <div 
              className="flex items-center gap-2 cursor-pointer transition-transform duration-300 hover:scale-105" 
              onClick={() => { setMenuOpen(false); navigateHome(); }}
            >
              <img src={openCritiqueIcon} alt="OpenCritique" className="w-8 h-8" />
              <span className="text-xl font-heading font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                OpenCritique
              </span>
            </div>
            <button
              type="button"
              className={cn(
                "-m-2.5 rounded-md p-2.5 text-foreground",
                "hover:bg-primary/10 hover:text-primary transition-colors duration-300"
              )}
              onClick={() => setMenuOpen(false)}
            >
              <span className="sr-only">Close menu</span>
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mt-6 space-y-2">
            {[
              { label: "Home", path: "/" },
              { label: "Trending", path: "/trending" },
              { label: "Marketplace", path: "/marketplace" },
              ...(connect ? [{ label: "My Studio", path: "/mystudio" }] : []),
            ].map((item, index) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "block rounded-lg px-3 py-2 text-base font-medium transition-all duration-300",
                  "animate-fade-in",
                  isActivePath(item.path) 
                    ? "bg-primary/20 text-primary border border-primary/30 nav-active" 
                    : "text-foreground hover:bg-primary/10 hover:text-primary"
                )}
                style={{ animationDelay: `${index * 0.05}s` }}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            
            <div className="pt-4 animate-fade-in" style={{ animationDelay: '0.25s' }}>
              {connect ? (
                <button
                  className={cn(
                    "w-full px-4 py-2 rounded-lg border border-border text-foreground",
                    "hover:bg-primary/10 hover:text-primary transition-all duration-300",
                    "hover:border-primary/50 hover:shadow-md hover:shadow-primary/10"
                  )}
                  onClick={() => { setMenuOpen(false); handleUploadClick(); }}
                >
                  Upload
                </button>
              ) : (
                <button
                  className={cn(
                    "w-full px-4 py-2 rounded-lg gradient-primary text-primary-foreground",
                    "hover:opacity-90 transition-all duration-300",
                    "shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30"
                  )}
                  onClick={() => { setMenuOpen(false); handleConnect(); }}
                >
                  Connect Wallet
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
