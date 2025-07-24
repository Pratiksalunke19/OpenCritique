import { useState, useEffect } from "react";
import { uploadArt, getArtworks } from "./services/opencritique";
import Navbar from "./components/Navbar";
import Welcome from "./components/Welcome";
import Footer from "./components/Footer";
import UploadForm  from "./components/UploadForm";
import { PinataSDK } from "pinata";
import { Routes,Route } from "react-router-dom";
import ArtCardDetail from "./components/ArtCardDetail";
import LandingPage from "./pages/LandingPage";
import Aurora from "./components/Aurora/Aurora";
import MyStudio from "./components/MyStudio";
import MarketPlace from "./components/MarketPlace";

// const pinata = new PinataSDK({
//   pinataJWTKey: import.meta.env.VITE_PINATA_JWT,
//   pinataGateway: import.meta.env.VITE_GATEWAY_URL,
// });

function App() {

  // Commented upload utility

  // const [file, setFile] = useState(null);
  // const [uploadStatus, setUploadStatus] = useState("");
  // const [link, setLink] = useState("");

  // const handleFileChange = (e) => {
  //   if (e.target.files && e.target.files.length > 0) {
  //     setFile(e.target.files[0]);
  //   }
  // };

  // const handleUpload = async () => {

  //   console.log("Pinata JWT", import.meta.env.VITE_PINATA_JWT);

  //   if (!file) return;

  //   setUploadStatus("Uploading to Pinata...");

  //   try {
  //     const uploadResult = await pinata.upload.public.file(file);

  //     console.log("Upload result:", uploadResult);

  //     if (uploadResult && uploadResult.cid) {
  //       const ipfsLink = `${import.meta.env.VITE_GATEWAY_URL}/ipfs/${
  //         uploadResult.cid
  //       }`;
  //       setLink(ipfsLink);
  //       setUploadStatus("Upload successful!");
  //     } else {
  //       setUploadStatus("Upload failed");
  //     }
  //   } catch (error) {
  //     console.error(error);
  //     setUploadStatus("Error uploading: " + (error.message || "Unknown error"));
  //   }
  // };

  // Scroll to top button state
  const [showScroll, setShowScroll] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScroll(window.scrollY > 200);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="bg-bg-base min-h-screen text-text-base overflow-x-hidden relative flex flex-col min-h-screen">
      {/* Aurora is now rendered only in the LandingPage hero section */}
      {/* Navbar always above Aurora and hero */}
      <div className="relative z-20">
        <Navbar/>
      </div>
      <div className="flex-grow">
        <Routes>
          <Route path="/" element={<LandingPage/>}/>
          <Route path="/trending" element={<Welcome/>}/>
          <Route path="/upload" element={<UploadForm/>}/>
          <Route path="/art/:id" element={<ArtCardDetail />} />
          <Route path="/mystudio" element={<MyStudio/>}/>
          <Route path="/marketplace" element={<MarketPlaceWithPadding/>}/>
        </Routes>
      </div>
      <Footer/>

      {/* Scroll to Top Button */}
      {showScroll && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-full shadow-lg transition-all flex items-center justify-center"
          aria-label="Scroll to top"
        >
          {/* Upward arrow SVG icon */}
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
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

