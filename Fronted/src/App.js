import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import AllCampaigns from "./components/AllCampaigns";
import CreateCampaign from "./components/CreateCampaign";
import MyCampaigns from "./components/MyCampaigns";
import Dashboard from "./components/Dashboard";
import { useState, useEffect } from "react";

function App() {
  const [walletAddress, setWalletAddress] = useState("");
  
  // 1. THEME STATE
  const [theme, setTheme] = useState("dark"); // Default to Dark Mode

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  // Load saved theme on start
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark";
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  // 2. NOTIFICATION SYSTEM
  const [toast, setToast] = useState({ show: false, msg: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, msg: message, type: type });
    setTimeout(() => { setToast({ show: false, msg: "", type: "" }); }, 3500);
  };

  return (
    <Router>
      <div className="App">
        {/* Dynamic Island Notification */}
        {toast.show && (
          <div style={{
            position: 'fixed', bottom: '30px', left: '50%', transform: 'translateX(-50%)',
            background: 'var(--bg-card)', color: 'var(--text-main)', border: '1px solid var(--border-soft)',
            padding: '14px 28px', borderRadius: '50px', display: 'flex', alignItems: 'center', gap: '15px',
            boxShadow: 'var(--shadow-card)', zIndex: 99999999, minWidth: '320px', justifyContent: 'center',
            backdropFilter: 'blur(12px)'
          }}>
            <span>{toast.type === 'error' ? '⚠️' : '✅'}</span>
            <span style={{ fontWeight: 600 }}>{toast.msg}</span>
          </div>
        )}

        {/* Pass Theme Props to Navbar */}
        <Navbar 
          walletAddress={walletAddress} 
          setWalletAddress={setWalletAddress} 
          theme={theme} 
          toggleTheme={toggleTheme} 
        />
        
        <Routes>
          <Route path="/" element={<AllCampaigns />} />
          
          <Route 
            path="/create" 
            element={<CreateCampaign showToast={showToast} />} 
          />
          
          <Route path="/mycampaigns" element={<MyCampaigns />} />
          
          {/* Pass showToast to Dashboard for the Confetti Message */}
          <Route 
            path="/campaign/:id" 
            element={<Dashboard showToast={showToast} />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;