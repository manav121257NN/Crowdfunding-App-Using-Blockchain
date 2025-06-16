import { Link } from "react-router-dom";
import { connectWallet } from "../connectWallet";
import "../css/Navbar.css";

function Navbar({ walletAddress, setWalletAddress }) {
  const handleConnect = async () => {
    const signer = await connectWallet();
    if (signer) {
      const addr = await signer.getAddress();
      setWalletAddress(addr);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-links">
        <Link to="/">All Campaigns</Link>
        <Link to="/create">Create Campaign</Link>
        <Link to="/mycampaigns">My Campaigns</Link>
      </div>
      <button className="connect-btn" onClick={handleConnect}>
        {walletAddress
          ? `Connected: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
          : "Connect Wallet"}
      </button>
    </nav>
  );
}

export default Navbar;