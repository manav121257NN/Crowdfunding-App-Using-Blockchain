import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import AllCampaigns from "./components/AllCampaigns";
import CreateCampaign from "./components/CreateCampaign";
import MyCampaigns from "./components/MyCampaigns";
import Dashboard from "./components/Dashboard";
import { useState, useEffect } from "react";

function App() {
  const [walletAddress, setWalletAddress] = useState("");
  const [hasMetaMask, setHasMetaMask] = useState(true);

  // THEME STATE
  const [theme, setTheme] = useState("dark");

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark";
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  // METAMASK CHECK
  useEffect(() => {
    if (typeof window.ethereum === "undefined") {
      setHasMetaMask(false);
    }
  }, []);

  // TOAST SYSTEM
  const [toast, setToast] = useState({ show: false, msg: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, msg: message, type });
    setTimeout(() => setToast({ show: false, msg: "", type: "" }), 3500);
  };

  // SHOW METAMASK INSTALL SCREEN
  if (!hasMetaMask) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg-main)",
        color: "var(--text-main)",
        textAlign: "center",
        padding: "40px"
      }}>
        <h1>MetaMask Required 🦊</h1>
        <p>This app needs MetaMask to interact with blockchain.</p>
        <a
          href="https://metamask.io/download/"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            marginTop: "25px",
            padding: "14px 30px",
            borderRadius: "40px",
            background: "#f6851b",
            color: "#000",
            fontWeight: "700",
            textDecoration: "none"
          }}
        >
          Install MetaMask
        </a>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        {toast.show && (
          <div style={{
            position: "fixed",
            bottom: "30px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "var(--bg-card)",
            color: "var(--text-main)",
            border: "1px solid var(--border-soft)",
            padding: "14px 28px",
            borderRadius: "50px",
            zIndex: 9999
          }}>
            {toast.type === "error" ? "⚠️" : "✅"} {toast.msg}
          </div>
        )}

        <Navbar
          walletAddress={walletAddress}
          setWalletAddress={setWalletAddress}
          theme={theme}
          toggleTheme={toggleTheme}
        />

        <Routes>
          <Route path="/" element={<AllCampaigns />} />
          <Route path="/create" element={<CreateCampaign showToast={showToast} />} />
          <Route path="/mycampaigns" element={<MyCampaigns />} />
          <Route path="/campaign/:id" element={<Dashboard showToast={showToast} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
