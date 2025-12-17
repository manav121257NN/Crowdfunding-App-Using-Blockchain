import { useEffect, useState } from "react";
import { getContract, connectWallet } from "../connectWallet";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";
import "../css/MyCampaigns.css";

function MyCampaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userAddress, setUserAddress] = useState("");
  const navigate = useNavigate();

  const fetchMyCampaigns = async () => {
    setIsLoading(true);
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
          createdAt: new Date(campaign.createdAt.toNumber() * 1000).toLocaleDateString(),
        };
      });

      // FILTER: Only keep campaigns where owner matches current wallet
      const myCampaigns = formattedCampaigns.filter(
        (campaign) => campaign.owner === addr
      ).sort((a, b) => b.id - a.id); // Newest first

      setCampaigns(myCampaigns);
    } catch (error) {
      console.error("Error fetching my campaigns:", error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchMyCampaigns();
  }, []);

  return (
    <div className="my-campaigns-page">
      <div className="header-section">
        
      </div>

      <div className="campaigns-grid">
        {isLoading ? (
          <div className="loading-state">Loading your campaigns...</div>
        ) : campaigns.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📂</div>
            <h3>No Campaigns Found</h3>
            <p>You haven't started any crowdfunding campaigns yet.</p>
            <button className="create-btn-empty" onClick={() => navigate("/create")}>
              Create Your First Campaign
            </button>
          </div>
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
                {/* Image Section */}
                <div className="card-image-wrapper">
                  <img src={campaign.imageUrl} alt={campaign.title} className="card-img" />
                  <span className={`status-badge ${isClosed ? "closed" : "open"}`}>
                    {isClosed ? "Completed" : "Active"}
                  </span>
                </div>

                {/* Content Section */}
                <div className="card-content">
                  <div className="card-header">
                    <h3 className="card-title">{campaign.title}</h3>
                    <p className="card-desc">
                      {campaign.description.length > 80 
                        ? campaign.description.substring(0, 80) + "..." 
                        : campaign.description}
                    </p>
                  </div>

                  {/* Progress Section */}
                  <div className="progress-section">
                    <div className="progress-labels">
                      <span className="raised-val">{campaign.fundsRaised} ETH</span>
                      <span className="goal-val">of {campaign.goal} ETH</span>
                    </div>
                    <div className="progress-track">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${campaign.progressPercentage}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="card-footer">
                    <span className="role-tag">Owner (You)</span>
                    <span className="date-tag">Created: {campaign.createdAt}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <button className="refresh-fab" onClick={fetchMyCampaigns} title="Refresh Data">
        ↻
      </button>
    </div>
  );
}

export default MyCampaigns;