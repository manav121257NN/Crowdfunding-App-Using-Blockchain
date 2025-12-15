import { useState } from "react";
import { ethers } from "ethers";
import { getContract } from "../connectWallet";
import "../css/CreateCampaign.css";
import { useNavigate } from "react-router-dom";

function CreateCampaign({ onCampaignCreated }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [goal, setGoal] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Normalize image URLs including ipfs://, http, https
  const normalizeImageUrl = (url) => {
    if (!url) return "";
    const trimmed = url.trim();

    // 1. If it's a base64 image
    if (trimmed.startsWith("data:image")) {
      return trimmed;
    }

    // 2. If it's an IPFS link
    if (trimmed.startsWith("ipfs://")) {
      return trimmed.replace("ipfs://", "https://ipfs.io/ipfs/");
    }

    // 3. If it's missing protocol
    if (!/^https?:\/\//i.test(trimmed)) {
      return "https://" + trimmed;
    }

    return trimmed;
  };

  const createCampaign = async () => {
    if (!title || !description || !goal || !imageUrl) {
      alert("Please fill in all fields!");
      return;
    }

    try {
      setIsLoading(true);
      const contract = await getContract();
      if (!contract) return;

      const goalInWei = ethers.utils.parseEther(goal);
      const finalImageUrl = normalizeImageUrl(imageUrl);

      const tx = await contract.createCampaign(
        title,
        description,
        goalInWei,
        finalImageUrl
      );

      await tx.wait();

      alert("Campaign Created Successfully!");
      setTitle("");
      setDescription("");
      setGoal("");
      setImageUrl("");
      if (onCampaignCreated) onCampaignCreated();
      navigate("/");
    } catch (error) {
      console.error("Error creating campaign:", error);
      alert("Transaction failed!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="create-container">
      <div className="create-form">
        <div className="form-group">
          <label className="create-campaign-label">Campaign Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter campaign title"
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="create-campaign-label">Campaign Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your campaign"
            rows="4"
            className="form-textarea"
          />
        </div>

        <div className="form-group">
          <label className="create-campaign-label">Funding Goal (ETH)</label>
          <div className="funding-input-container">
            <span className="funding-icon">♦</span>
            <input
              type="number"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="Enter funding goal in ETH"
              className="funding-input"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="create-campaign-label">Campaign Image URL</label>
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://example.com/image.jpg, ipfs://..., or data:image/..."
            className="form-input"
          />
          {imageUrl && (
            <img
              src={normalizeImageUrl(imageUrl)}
              alt="Preview"
              className="image-preview"
              onError={(e) => {
                e.target.src = "/fallback-image.png"; // Use your own fallback path
              }}
            />
          )}
        </div>

        <button
          onClick={createCampaign}
          disabled={isLoading}
          className="create-btn"
        >
          {isLoading ? <span className="spinner" /> : "Create Campaign"}
        </button>
      </div>
    </div>
  );
}

export default CreateCampaign;
