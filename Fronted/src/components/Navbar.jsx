import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { connectWallet } from "../connectWallet";
import "../css/Navbar.css";

function Navbar({ walletAddress, setWalletAddress }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleConnect = async () => {
    const signer = await connectWallet();
    if (signer) {
      const addr = await signer.getAddress();
      setWalletAddress(addr);
    }
  };

  useEffect(() => {
    if (!window.ethereum) return;

    window.ethereum.request({ method: "eth_accounts" }).then(accounts => {
      if (accounts.length) setWalletAddress(accounts[0]);
    });

    window.ethereum.on("accountsChanged", accounts => {
      setWalletAddress(accounts[0] || "");
    });
  }, [setWalletAddress]);

  const shortAddr = walletAddress
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : "Connect Wallet";

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* LOGO */}
        <div className="navbar-logo">CrowdFund <br></br>Decentralize Platfrom 👌</div>
        

        {/* LINKS */}
        <div className={`navbar-links ${menuOpen ? "active" : ""}`}>
          <NavLink to="/" className="nav-link" onClick={() => setMenuOpen(false)}>
            All Campaigns
          </NavLink>
          <NavLink to="/create" className="nav-link" onClick={() => setMenuOpen(false)}>
           Create Campaign
          </NavLink>
          <NavLink to="/mycampaigns" className="nav-link" onClick={() => setMenuOpen(false)}>
            My Campaigns
          </NavLink>

          <button className="connect-btn mobile-only" onClick={handleConnect}>
            {shortAddr}
          </button>
        </div>

        {/* ACTIONS */}
        <div className="navbar-actions">
          <button className="connect-btn desktop-only" onClick={handleConnect}>
            {shortAddr}
          </button>

          <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            ☰
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
