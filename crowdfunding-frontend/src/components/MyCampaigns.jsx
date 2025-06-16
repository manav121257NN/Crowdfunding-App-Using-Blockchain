import { useEffect, useState } from "react";
import { getContract, connectWallet } from "../connectWallet";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";
import "../css/Campaigns.css";

function MyCampaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [userAddress, setUserAddress] = useState("");
  const navigate = useNavigate();

  const fetchMyCampaigns = async () => {
    try {
      const contract = await getContract();
      if (!contract) return;
      const signer = await connectWallet();
      const addr = signer ? (await signer.getAddress()).toLowerCase() : "";
      setUserAddress(addr);
      const campaignsData = await contract.getAllCampaigns();
      const formattedCampaigns = campaignsData.map((campaign, index) => {
        const goal = ethers.utils.formatEther(campaign.goal);
        const fundsRaised = ethers.utils.formatEther(campaign.fundsRaised);
        const progressPercentage = Math.min(
          (parseFloat(fundsRaised) / parseFloat(goal)) * 100,
          100
        );
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
          // Convert the createdAt timestamp to a readable format
          createdAt: new Date(campaign.createdAt.toNumber() * 1000).toLocaleString(),
        };
      });
      const myCampaigns = formattedCampaigns.filter(
        (campaign) => campaign.owner === addr
      );
      setCampaigns(myCampaigns);
    } catch (error) {
      console.error("Error fetching my campaigns:", error);
    }
  };

  useEffect(() => {
    fetchMyCampaigns();
  }, []);

  return (
    <div className="campaigns-container">
      <h2 className="campaigns-heading">My Campaigns</h2>
      <div className="campaigns-wrapper">
        {campaigns.length === 0 ? (
          <p style={{ textAlign: "center" }}>
            You haven't created any campaigns yet.
          </p>
        ) : (
          campaigns.map((campaign) => {
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
          })
        )}
      </div>
      <button className="refresh-btn" onClick={fetchMyCampaigns}>
        Refresh My Campaigns
      </button>
    </div>
  );
}

export default MyCampaigns;