import { useState, useEffect } from "react";
import { uploadArt, getArtworks } from "./services/opencritique";
import Navbar from "./components/Navbar";
import Welcome from "./components/Welcome";
import Footer from "./components/Footer";
import Upload  from "./components/Upload";
import { PinataSDK } from "pinata";
import { Routes,Route } from "react-router-dom";
import ArtworkDetail from "./components/ArtworkDetail";

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

  return (
    <div className="bg-bg-base min-h-screen text-text-base">
      {/* <h1>Vite + React + Pinata</h1>
      <div className="card">
        <input type="file" onChange={handleFileChange} />
        <button onClick={handleUpload} disabled={!file}>
          Upload to Pinata
        </button>
        {uploadStatus && <p>{uploadStatus}</p>}
        {link && (
          <a href={link} target="_blank">
            View File
          </a>
        )}
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p> */}
      <Navbar/>
      <Routes>
        <Route path="/" element={<Welcome/>}/>
        <Route path="/upload" element={<Upload/>}/>
        <Route path="/art/:id" element={<ArtworkDetail />} />
      </Routes>
    <Footer/>
    </div>
  );
}

export default App;

