import React, { createContext, useState, useContext } from "react";

const ArtContext = createContext();

export const ArtProvider = ({ children }) => {
  const [artData, setArtData] = useState([]);

  return (
    <ArtContext.Provider value={{ artData, setArtData }}>
      {children}
    </ArtContext.Provider>
  );
};

export const useArt = () => useContext(ArtContext);
