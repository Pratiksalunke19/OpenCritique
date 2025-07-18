import { useState, useEffect } from "react";
import { uploadArt, getArtworks } from "./services/opencritique";
import Navbar from "./components/Navbar";
import Welcome from "./components/Welcome";
import Footer from "./components/Footer";

function App() {
  // const [title, setTitle] = useState("");
  // const [desc, setDesc] = useState("");
  // const [url, setUrl] = useState("");
  // const [artworks, setArtworks] = useState([]);
  
  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   await uploadArt(title, desc, url);
  //   setTitle("");
  //   setDesc("");
  //   setUrl("");
  //   fetchArtworks();
  // };

  // const fetchArtworks = async () => {
  //   const data = await getArtworks();
  //   setArtworks(data);
  // };

  // useEffect(() => {
  //   fetchArtworks();
  // }, []);

  return (
    <div className="bg-bg-base min-h-screen text-text-base">
      <Navbar />
      <Welcome />
      <Footer />
    </div>
  );
}

export default App;
