// src/components/Dashboard.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getContract, connectWallet } from "../connectWallet";
import { ethers } from "ethers";
import "../css/Dashboard.css";

function Dashboard() {
  const { id } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [fundAmount, setFundAmount] = useState("");
  const [userAddress, setUserAddress] = useState("");
  const [isFunding, setIsFunding] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [transactionLog, setTransactionLog] = useState([]);

  // Fetch campaign details
  const fetchCampaign = async () => {
    try {
      const contract = await getContract();
      if (!contract) return;
      const campaignsData = await contract.getAllCampaigns();
      const data = campaignsData[id];
      if (!data) return;
      const goal = ethers.utils.formatEther(data.goal);
      const fundsRaised = ethers.utils.formatEther(data.fundsRaised);
      const formatted = {
        id,
        owner: data.owner.toLowerCase(),
        title: data.title,
        description: data.description,
        goal,
        fundsRaised,
        completed: data.completed,
        imageUrl: data.imageUrl,
        progressPercentage: Math.min((parseFloat(fundsRaised) / parseFloat(goal)) * 100, 100),
      };
      setCampaign(formatted);
    } catch (error) {
      console.error("Error fetching campaign:", error);
    }
  };

  // Fetch the transaction log from the contract
  const fetchTransactionLog = async () => {
    try {
      const contract = await getContract();
      if (!contract) return;
      const log = await contract.getTransactionLog(id);
      const formattedLog = log.map((tx, index) => ({
        id: index,
        sender: tx.sender,
        amount: ethers.utils.formatEther(tx.amount),
        txType: tx.txType.toString() === "0" ? "Fund" : "Withdraw",
        timestamp: new Date(Number(tx.timestamp) * 1000).toLocaleString(),
      }));
      setTransactionLog(formattedLog);
    } catch (error) {
      console.error("Error fetching transaction log:", error);
    }
  };

  // Fetch connected user's address
  const fetchUserAddress = async () => {
    try {
      const signer = await connectWallet();
      if (signer) {
        const addr = await signer.getAddress();
        setUserAddress(addr.toLowerCase());
      }
    } catch (error) {
      console.error("Error fetching user address:", error);
    }
  };

  // Handle funding the campaign
  const fundCampaign = async () => {
    if (!fundAmount) {
      alert("Please enter an amount to fund");
      return;
    }
    try {
      setIsFunding(true);
      const contract = await getContract();
      if (!contract) return;
      const tx = await contract.fundCampaign(id, { value: ethers.utils.parseEther(fundAmount) });
      await tx.wait();
      alert("Campaign Funded Successfully!");
      setFundAmount("");
      fetchCampaign();
      fetchTransactionLog();
    } catch (error) {
      console.error("Error funding campaign:", error);
      alert("Funding transaction failed!");
    } finally {
      setIsFunding(false);
    }
  };

  // Handle withdrawing funds
  const withdrawFunds = async () => {
    try {
      setIsWithdrawing(true);
      const contract = await getContract();
      if (!contract) return;
      const tx = await contract.withdrawFunds(id);
      await tx.wait();
      alert("Funds Withdrawn Successfully!");
      fetchCampaign();
      fetchTransactionLog();
    } catch (error) {
      console.error("Error withdrawing funds:", error);
      alert("Withdrawal transaction failed!");
    } finally {
      setIsWithdrawing(false);
    }
  };

  useEffect(() => {
    fetchCampaign();
    fetchUserAddress();
    fetchTransactionLog();
  }, [id]);

  if (!campaign) {
    return <div style={{ padding: "2rem", textAlign: "center" }}>Loading campaign details...</div>;
  }

  const isOwner = campaign.owner === userAddress;
  const goalReached = parseFloat(campaign.fundsRaised) >= parseFloat(campaign.goal);
  const canFund = !isOwner && !campaign.completed && !goalReached;
  const canWithdraw = isOwner && goalReached && !campaign.completed;

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <div className="dashboard-image">
          <img src={campaign.imageUrl} alt={campaign.title} />
          <p className="dashboard-description">{campaign.description}</p> {/* Moved description here */}
        </div>
        <div className="dashboard-details">
          <div className="dashboard-header">
            <h2 className="dashboard-title">{campaign.title}</h2>
            {canWithdraw && (
              <button onClick={withdrawFunds} disabled={isWithdrawing} className="withdraw-btn">
                {isWithdrawing ? "Withdrawing..." : "Withdraw Funds"}
              </button>
            )}
          </div>
          <p className="dashboard-info">Goal: {campaign.goal} ETH</p>
          <p className="dashboard-info">Raised: {campaign.fundsRaised} ETH</p>
          <p className="dashboard-info">
            Status: {campaign.completed ? "Closed" : goalReached ? "Goal Reached" : "Open"}
          </p>
          <div className="progress-bar">
            <div
              className="progress"
              style={{ width: `${campaign.progressPercentage}%` }}
            ></div>
          </div>
          <p className="progress-text">
            {campaign.progressPercentage.toFixed(1)}% Reached
          </p>
          <p className="backers">Backers: N/A</p>
          <p className="trend">Trend: Stable</p>

          {canFund && (
            <div className="fund-section">
              <input
                type="number"
                placeholder="Amount in ETH"
                value={fundAmount}
                onChange={(e) => setFundAmount(e.target.value)}
                className="fund-input"
                disabled={isFunding}
              />
              <button onClick={fundCampaign} disabled={isFunding} className="fund-btn">
                {isFunding ? "Funding..." : "Donate"}
              </button>
            </div>
          )}

          {!canFund && !isOwner && (
            <p className="dashboard-info">
              {campaign.completed ? "This campaign is closed" : "Funding goal has been reached"}
            </p>
          )}

          {/* Transaction Log */}
          <div className="transaction-log">
            <h3 className="log-heading">Transaction Log</h3>
            {transactionLog.length === 0 ? (
              <p>No transactions yet.</p>
            ) : (
              <ul className="log-list">
                {transactionLog.map((tx) => (
                  <li key={tx.id} className="log-item">
                    <span className="log-type">{tx.txType}</span>{" "}
                    by <span className="log-sender">{tx.sender.slice(0, 6)}...{tx.sender.slice(-4)}</span> of{" "}
                    <span className="log-amount">{tx.amount} ETH</span> at{" "}
                    <span className="log-timestamp">{tx.timestamp}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;