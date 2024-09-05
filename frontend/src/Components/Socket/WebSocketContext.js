import React, { createContext, useContext, useEffect, useState } from "react";
import socket from ".";

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const [blocks, setBlocks] = useState([]);

  useEffect(() => {
    // Listen for initial blocks from the server
    socket.on("initial", (data) => {
      setBlocks(data.blocks);
    });

    // Listen for new blocks being added
    socket.on("newBlock", (block) => {
      setBlocks((prevBlocks) => [...prevBlocks, block]);
    });

    // Cleanup on unmount
    return () => {
      socket.off("initial");
      socket.off("newBlock");
    };
  }, []);

  const addBlock = (block) => {
    // console.log(block);
    socket.emit("newBlock", block); // Send 'newBlock' event
  };

  return (
    <WebSocketContext.Provider value={{ blocks, addBlock }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  return useContext(WebSocketContext);
};
