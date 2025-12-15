// src/components/AllCampaigns.jsx
import { useEffect, useState } from "react";
import { getContract } from "../connectWallet";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";
import "../css/AllCampaigns.css";

function AllCampaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const navigate = useNavigate();

  const fetchCampaigns = async () => {
    try {
      const contract = await getContract();
      if (!contract) return;
      const campaignsData = await contract.getAllCampaigns();
      const formattedCampaigns = campaignsData.map((campaign, index) => {
        // Convert BigNumber values to strings using formatEther or toString()
        const goal = ethers.utils.formatEther(campaign.goal.toString());
        const fundsRaised = ethers.utils.formatEther(campaign.fundsRaised.toString());
        const progressPercentage = Math.min(
          (parseFloat(fundsRaised) / parseFloat(goal)) * 100,
          100
        );
        // Convert createdAt BigNumber to timestamp and format it
        const createdAtBigNumber = campaign.createdAt;
        const createdAt = new Date(createdAtBigNumber.toNumber() * 1000).toLocaleString();
        return {
          id: index,
          owner: campaign.owner.toLowerCase(),
          title: campaign.title,
          description: campaign.description,
          goal,
          fundsRaised,
          completed: campaign.completed,
          imageUrl: campaign.imageUrl,
          progressPercentage,
          createdAt,
        };
      }).sort((a, b) => {
        // Sort by createdAt in descending order (newest first)
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA; // Newest campaigns (higher timestamps) come first
      });
      setCampaigns(formattedCampaigns);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  return (
    <div className="campaigns-container">
      <h2 className="campaigns-heading">All Campaigns</h2>
      <div className="campaigns-wrapper">
        {campaigns.map((campaign) => {
          const isClosed =
            campaign.completed ||
            parseFloat(campaign.fundsRaised) >= parseFloat(campaign.goal);
          return (
            <div
              key={campaign.id}
              className="campaign-card"
              onClick={() => navigate(`/campaign/${campaign.id}`)}
            >
              <img src={campaign.imageUrl} alt={campaign.title} />
              <div className="info">
                <h3 className="title">{campaign.title}</h3>
                <p className="price">{campaign.fundsRaised} ETH Raised</p>
                <p className="goal">Goal: {campaign.goal} ETH</p>
                <p className="created-at">Created on: {campaign.createdAt}</p>
                <div className="progress-bar">
                  <div
                    className="progress"
                    style={{ width: `${campaign.progressPercentage}%` }}
                  ></div>
                </div>
                <p className="progress-text">
                  {campaign.progressPercentage.toFixed(1)}% Reached
                </p>
                <p className={`status ${isClosed ? "closed" : "open"}`}>
                  {isClosed ? "Closed" : "Open"}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      <button className="refresh-btn" onClick={fetchCampaigns}>
        Refresh Campaigns
      </button>
    </div>
  );
}

export default AllCampaigns;