import React, { useEffect, useState } from "react";
import { data, useNavigate } from "react-router-dom";
import { opencritique_backend } from "../../../declarations/opencritique_backend";
import DashboardArtCard from "./DashboardArtCard";
import { Bell } from "lucide-react";
import { Image } from "lucide-react";
import { ChartColumnBig } from "lucide-react";
import StatsCircle from "./StatsCircle";
import { useArtContext } from "./context/ArtContext";

const Dashboard = ({ principal }) => {
  const ipfsBase = "https://gateway.pinata.cloud/ipfs/";
  const navigate = useNavigate();
  
const [connect, updateConnect] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const { myArtworks, fetchMyArtworks, loadingMyArts } = useArtContext();

  useEffect(() => {
    const checkConnection = async () => {
      const isConnected = await window.ic?.plug?.isConnected?.();
      if (isConnected) {
        updateConnect(true);
      }
    };

    checkConnection();

    fetchMyArtworks();

    // Placeholder notifications (replace later with real on-chain notifications if added)
    setNotifications([
      { id: "n1", message: "Your critique on 'Cityscape' got 3 upvotes!" },
      { id: "n2", message: "New feedback on 'Portrait Study'" },
    ]);
  }, []);

  return (
    <div className="px-6 py-10 text-white min-h-[90vh] mt-[70px]">
      <h2 className="text-3xl font-bold mb-6">Welcome back</h2>

      {/* === Your Artworks Section === */}
      <div className="mb-10">
        <h3 className="text-xl font-semibold mb-3 flex flex-row">
          <ChartColumnBig className="w-7 h-7 text-orange-500" />
          Stats
        </h3>
        <div className="flex p-10">
          <StatsCircle uploads={12} critiques={2} upvotes={2} rank={1} />
        </div>

        <h3 className="text-xl font-semibold mb-3 flex flex-row">
          <Image className="w-7 h-7 text-blue-500 mr-2" />
          Recent Artworks
        </h3>
        {loadingMyArts ? (
          <div className="flex justify-center items-center h-40">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : myArtworks.length === 0 ? (
          <p className="text-gray-400">
            No artworks uploaded yet. Why not start now?
          </p>
        ) : (
          <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {myArtworks.slice(-2).map((art, index) => (
              <DashboardArtCard
                key={index}
                imageSrc={art.imageSrc}
                username={art.username}
                id={art.id}
                title={art.title}
                desc={art.description}
              />
            ))}
          </div>
        )}
      </div>

      {/* === Notifications Section === */}
      <div className="mb-10">
        <h3 className="text-xl font-semibold mb-3 flex flex-row">
          <Bell className="w-7 h-7 text-yellow-500 mr-2" /> Notifications
        </h3>
        {notifications.length === 0 ? (
          <p className="text-gray-400">You're all caught up!</p>
        ) : (
          <ul className="space-y-2">
            {notifications.map((note) => (
              <li key={note.id} className="bg-bg-panel text-sm p-3 rounded-lg">
                {note.message}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* === Call to Action Buttons === */}
      <div className="flex flex-wrap gap-4 mt-8">
        <button
          onClick={() => navigate("/upload")}
          className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-xl"
        >
          Upload New Artwork
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
