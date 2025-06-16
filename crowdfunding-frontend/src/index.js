// src/index.js
import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import AllCampaigns from "./components/AllCampaigns";
import CreateCampaign from "./components/CreateCampaign";
import Dashboard from "./components/Dashboard";
import MyCampaigns from "./components/MyCampaigns";
import "./css/Campaigns.css";
import "./css/CreateCampaign.css";
import "./css/MyCampaigns.css";
import "./css/Navbar.css";

function App() {
  const [walletAddress, setWalletAddress] = useState("");

  return (
    <BrowserRouter>
      <Navbar walletAddress={walletAddress} setWalletAddress={setWalletAddress} />
      <Routes>
        <Route path="/" element={<AllCampaigns />} />
        <Route path="/create" element={<CreateCampaign />} />
        <Route path="/campaign/:id" element={<Dashboard />} />
        <Route path="/mycampaigns" element={<MyCampaigns />} />
      </Routes>
    </BrowserRouter>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
