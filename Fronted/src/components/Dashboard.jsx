import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getContract, connectWallet } from "../connectWallet";
import { ethers } from "ethers";
import "../css/Dashboard.css";

// 1. IMPORT CONFETTI
import confetti from "canvas-confetti";

function Dashboard({ showToast }) {
  const { id } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [fundAmount, setFundAmount] = useState("");
  const [userAddress, setUserAddress] = useState("");
  const [isFunding, setIsFunding] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [transactionLog, setTransactionLog] = useState([]);
  const [activeTab, setActiveTab] = useState("story");

  // Helper for safe notification
  const notify = (msg, type) => {
    if (showToast) {
      showToast(msg, type);
    } else {
      alert(msg);
    }
  };

  // --- 2. CONFETTI FUNCTION ---
  const triggerConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#6366f1', '#22d3ee', '#ef4444', '#22c55e'] // Matches your theme colors
    });
  };

  const fetchData = async () => {
    try {
      const contract = await getContract();
      if (!contract) return;

      const campaignsData = await contract.getAllCampaigns();
      const data = campaignsData[id];
      if (!data) return;

      const goal = ethers.utils.formatEther(data.goal);
      const fundsRaised = ethers.utils.formatEther(data.fundsRaised);
      
      setCampaign({
        id,
        owner: data.owner.toLowerCase(),
        title: data.title,
        description: data.description,
        goal,
        fundsRaised,
        completed: data.completed,
        imageUrl: data.imageUrl,
        progressPercentage: Math.min((parseFloat(fundsRaised) / parseFloat(goal)) * 100, 100),
        createdAt: new Date(data.createdAt.toNumber() * 1000).toLocaleDateString()
      });

      const log = await contract.getTransactionLog(id);
      const formattedLog = log.map((tx, index) => ({
        id: index,
        sender: tx.sender.toLowerCase(),
        amount: ethers.utils.formatEther(tx.amount),
        txType: tx.txType.toString() === "0" ? "Donation" : "Withdrawal",
        timestamp: new Date(Number(tx.timestamp) * 1000).toLocaleDateString(),
      })).reverse();
      setTransactionLog(formattedLog);

      const signer = await connectWallet();
      if (signer) {
        const address = await signer.getAddress();
        setUserAddress(address.toLowerCase());
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const fundCampaign = async () => {
    if (!fundAmount) {
       notify("Please enter an amount!", "error");
       return;
    }

    if (campaign.owner === userAddress) {
      notify("You cannot fund your own campaign!", "error");
      return;
    }

    try {
      setIsFunding(true);
      const contract = await getContract();
      
      notify("Please confirm in Wallet...", "success");

      const tx = await contract.fundCampaign(id, { value: ethers.utils.parseEther(fundAmount) });
      
      notify("Transaction sent! Waiting...", "success");
      
      await tx.wait();

      // --- 3. TRIGGER CONFETTI ON SUCCESS! ---
      triggerConfetti();
      notify("🎉 Donation Successful!", "success");
      
      setFundAmount("");
      fetchData(); 
    } catch (error) {
      console.error(error);
      notify("Transaction failed.", "error");
    } finally {
      setIsFunding(false);
    }
  };

  const withdrawFunds = async () => {
    try {
      setIsWithdrawing(true);
      const contract = await getContract();
      
      notify("Processing Withdrawal...", "success");
      
      const tx = await contract.withdrawFunds(id);
      await tx.wait();

      triggerConfetti(); // Celebration for withdrawal too!
      notify("Funds withdrawn to your wallet!", "success");
      fetchData();
    } catch (error) {
      console.error(error);
      notify("Withdrawal failed.", "error");
    } finally {
      setIsWithdrawing(false);
    }
  };

  if (!campaign) return <div className="loading-screen">Loading...</div>;

  const isOwner = campaign.owner === userAddress;
  const goalReached = parseFloat(campaign.fundsRaised) >= parseFloat(campaign.goal);

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-container">
        
        {/* LEFT COLUMN */}
        <div className="main-content">
          <div className="hero-image-container">
            <img src={campaign.imageUrl} alt={campaign.title} className="hero-image" />
            <div className="category-tag">Project</div>
          </div>

          <div className="tabs-header">
            <button 
              className={`tab-btn ${activeTab === 'story' ? 'active' : ''}`} 
              onClick={() => setActiveTab('story')}
            >
              Our Story
            </button>
            <button 
              className={`tab-btn ${activeTab === 'donors' ? 'active' : ''}`} 
              onClick={() => setActiveTab('donors')}
            >
              Donors ({transactionLog.filter(t => t.txType === "Donation").length})
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'story' ? (
              <div className="story-text">
                <h3 className="story-heading">About this Project</h3>
                <p>{campaign.description}</p>
                <div className="creator-badge">
                  <div className="creator-avatar" />
                  <div>
                    <span className="creator-label">Campaign Organizer</span>
                    <span className="creator-name">
                      {campaign.owner.slice(0, 6)}...{campaign.owner.slice(-4)}
                      {isOwner && " (You)"}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="donors-list">
                {transactionLog.length === 0 && <p style={{color: 'var(--text-muted)'}}>No donors yet. Be the first!</p>}
                {transactionLog.map((tx) => (
                  <div key={tx.id} className="donor-row">
                    <div className="donor-avatar-placeholder">
                      {tx.txType === "Donation" ? "❤️" : "💸"}
                    </div>
                    <div className="donor-info">
                      <span className="donor-address">
                        {tx.txType === "Donation" ? "Supporter" : "Owner Withdrawal"} 
                        <span className="address-sub"> ({tx.sender.slice(0,6)}...{tx.sender.slice(-4)})</span>
                      </span>
                      <span className="donor-date">{tx.timestamp}</span>
                    </div>
                    <div className="donor-amount">
                      {tx.txType === "Donation" ? "+" : "-"}{tx.amount} ETH
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="sidebar-content">
          <div className="funding-card">
            
            <div className="funding-header">
              <span className={`funding-status ${campaign.completed ? "closed" : "open"}`}>
                {campaign.completed ? "Ended" : "Live"}
              </span>
              <span className="funding-date">Created: {campaign.createdAt}</span>
            </div>

            <h1 className="campaign-title">{campaign.title}</h1>

            <div className="progress-section">
              <div className="progress-bar-bg">
                <div 
                  className="progress-bar-fill" 
                  style={{ width: `${campaign.progressPercentage}%` }}
                ></div>
              </div>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-value">{campaign.fundsRaised} <small>ETH</small></span>
                  <span className="stat-label">Raised</span>
                </div>
                <div className="stat-item right">
                  <span className="stat-value">{campaign.goal} <small>ETH</small></span>
                  <span className="stat-label">Goal</span>
                </div>
              </div>
            </div>

            {!campaign.completed && !goalReached && !isOwner && (
              <div className="action-box">
                <label className="input-label">Pledge without reward</label>
                <div className="input-wrapper">
                  <input
                    type="number"
                    placeholder="0.1"
                    className="amount-input"
                    value={fundAmount}
                    onChange={(e) => setFundAmount(e.target.value)}
                  />
                  <span className="eth-suffix">ETH</span>
                </div>
                <button 
                  className="donate-btn" 
                  onClick={fundCampaign} 
                  disabled={isFunding}
                >
                  {isFunding ? "Processing..." : "Back this Project"}
                </button>
              </div>
            )}

            {goalReached && !campaign.completed && (
              <div className="success-banner">
                🎉 Goal Reached! Funding is complete.
              </div>
            )}
            
            {isOwner && (
              <div className="owner-panel">
                <h4>Owner Dashboard</h4>
                <p style={{marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem'}}>
                  You cannot fund your own campaign. Share it to get backers!
                </p>
                {goalReached ? (
                  <button onClick={withdrawFunds} disabled={isWithdrawing} className="withdraw-btn">
                    {isWithdrawing ? "Processing..." : "Withdraw Funds"}
                  </button>
                ) : (
                  <div style={{padding: '10px', background: 'var(--input-bg)', borderRadius: '8px', fontSize: '0.85rem', color: 'var(--text-muted)'}}>
                    <strong>Status:</strong> Fundraising in progress.<br/>
                    Withdrawal available once goal is reached.
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;