import { useState, useEffect } from "react";
import { uploadArt, getArtworks } from "./services/opencritique";
import Navbar from "./components/Navbar";
import Welcome from "./components/Welcome";
import Footer from "./components/Footer";
import UploadForm from "./components/UploadForm";
import { PinataSDK } from "pinata";
import { Routes, Route } from "react-router-dom";
import ArtCardDetail from "./components/ArtCardDetail";
import LandingPage from "./pages/LandingPage";
import Aurora from "./components/Aurora/Aurora";
import MyStudio from "./components/MyStudio";
import MarketPlace from "./components/MarketPlace";
import Dashboard from "./components/Dashboard";
import { useUserContext } from "./components/context/UserContext";
import Profile from "./components/user/Profile";
import CheckProfileCompletion from "./components/user/CheckProfileCompletion";
import NFTArtCard from "./components/NFT/NFTArtCard";

function App() {
  const { isConnected } = useUserContext();
  // Scroll to top button state
  const [showScroll, setShowScroll] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScroll(window.scrollY > 200);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() =>{
    const disableRightClick = (e) => {
      if (e.target.tagName === "IMG") {
        e.preventDefault();
      }
    };
    document.addEventListener("contextmenu", disableRightClick);
    return () => {
      document.removeEventListener("contextmenu", disableRightClick);
    };
  },[])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    // Configure agent for local development
    if (process.env.NODE_ENV === "development") {
      // This is crucial for local development
      import("../../declarations/opencritique_backend").then(async (backend) => {
        if (backend.opencritique_backend.agent) {
          await backend.opencritique_backend.agent.fetchRootKey();
          console.log("✅ Root key fetched for local development");
        }
      });
    }
  }, []);

  return (
    <div className="bg-bg-base min-h-screen text-text-base overflow-x-hidden relative flex flex-col min-h-screen">
      {/* Aurora is now rendered only in the LandingPage hero section */}
      {/* Navbar always above Aurora and hero */}
      <div className="relative z-20">
        <Navbar />
      </div>
      <div className="flex-grow">
        <Routes>
          {/* <Route path="/" element={ <Dashboard/>}/> */}
          <Route
            path="/"
            element={
              isConnected ? (
                <CheckProfileCompletion>
                  <Welcome />
                </CheckProfileCompletion>
              ) : (
                <div>
                  <LandingPage />
                  <Footer />
                </div>
              )
            }
          />
          <Route path="/trending" element={<Welcome />} />
          <Route path="/upload" element={<UploadForm />} />
          <Route path="/art/:id" element={<ArtCardDetail />} />
          <Route path="/mystudio" element={<MyStudio />} />
          <Route path="/marketplace" element={<MarketPlaceWithPadding />} />
          <Route path="/nft/:id" element={<NFTArtCard />} />
          <Route path="/artwork/:id" element={<ArtCardDetail />} />
        </Routes>
      </div>

      {/* Scroll to Top Button */}
      {showScroll && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 bg-primary hover:bg-primary-hover text-white p-3 rounded-full shadow-lg transition-all flex items-center justify-center"
          aria-label="Scroll to top"
        >
          {/* Upward arrow SVG icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 15l7-7 7 7"
            />
          </svg>
        </button>
      )}
    </div>
  );
}

// Wrapper for Marketplace to add top padding for navbar
function MarketPlaceWithPadding() {
  return (
    <div className="pt-24 md:pt-28">
      <MarketPlace />
    </div>
  );
}

export default App;
