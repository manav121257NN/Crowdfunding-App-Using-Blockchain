import { useEffect, useState, useCallback } from "react";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";
import { getContract } from "../connectWallet";
import "../css/AllCampaigns.css";

function AllCampaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("open");
  const navigate = useNavigate();

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const contract = await getContract();
      if (!contract) return;

      const raw = await contract.getAllCampaigns();

      const parsed = raw
        .map((c, i) => {
          const goal = Number(ethers.utils.formatEther(c.goal));
          const raised = Number(ethers.utils.formatEther(c.fundsRaised));
          const closed = c.completed || raised >= goal;

          return {
            id: i,
            title: c.title,
            description: c.description,
            imageUrl: c.imageUrl,
            owner: c.owner,
            goal,
            raised,
            closed,
            progress: Math.min((raised / goal) * 100, 100),
            createdAt: new Date(c.createdAt.toNumber() * 1000).toLocaleDateString(),
          };
        })
        .reverse();

      setCampaigns(parsed);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const visibleCampaigns = campaigns.filter(c => {
    if (filter === "open") return !c.closed;
    if (filter === "closed") return c.closed;
    return true;
  });

  return (
    <div className="campaigns-page">
      {/* HEADER */}
      <div className="header-section">

        <div className="filter-container">
          <button
            className={`filter-btn ${filter === "open" ? "active" : ""}`}
            onClick={() => setFilter("open")}
          >
            Active
          </button>
          <button
            className={`filter-btn ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All
          </button>
          <button
            className={`filter-btn ${filter === "closed" ? "active" : ""}`}
            onClick={() => setFilter("closed")}
          >
            Completed
          </button>
        </div>
      </div>

      {/* GRID */}
      <div className="campaigns-grid">
        {loading && <div className="loading-state">Loading blockchain data…</div>}

        {!loading && visibleCampaigns.length === 0 && (
          <div className="loading-state">No campaigns found</div>
        )}

        {!loading &&
          visibleCampaigns.map(c => (
            <div
              key={c.id}
              className="campaign-card"
              onClick={() => navigate(`/campaign/${c.id}`)}
            >
              <div className="card-image-wrapper">
                <img src={c.imageUrl} alt={c.title} className="card-img" />
                <span className={`status-badge ${c.closed ? "closed" : "open"}`}>
                  {c.closed ? "Completed" : "Active"}
                </span>
              </div>

              <div className="card-content">
                <h3 className="card-title">{c.title}</h3>
                <p className="card-desc">{c.description}</p>

                <div className="progress-section">
                  <div className="progress-labels">
                    <span className="raised-val">{c.raised} ETH</span>
                    <span className="goal-val">of {c.goal} ETH</span>
                  </div>
                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{ width: `${c.progress}%` }}
                    />
                  </div>
                </div>

                <div className="card-footer">
                  <div className="creator-info">
                    <div className="avatar-placeholder" />
                    <span className="creator-address">
                      {c.owner.slice(0, 6)}…
                    </span>
                  </div>
                  <span className="date-tag">{c.createdAt}</span>
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* REFRESH */}
      <button className="refresh-fab" onClick={fetchCampaigns} title="Refresh">
        ↻
      </button>
    </div>
  );
}

export default AllCampaigns;
