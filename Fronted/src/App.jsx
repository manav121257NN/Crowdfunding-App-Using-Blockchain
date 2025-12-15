// src/App.jsx
import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import AllCampaigns from "./components/AllCampaigns";
import CreateCampaign from "./components/CreateCampaign";
import MyCampaigns from "./components/MyCampaigns";
import "./App.css";
import "./index.css";

function App() {
  const [walletAddress, setWalletAddress] = useState("");

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#1a1a1a] text-white">
        <Navbar walletAddress={walletAddress} setWalletAddress={setWalletAddress} />
        <div className="p-4">
          <Routes>
            <Route path="/" element={<AllCampaigns />} />
            <Route path="/create" element={<CreateCampaign />} />
            <Route path="/mycampaigns" element={<MyCampaigns />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
