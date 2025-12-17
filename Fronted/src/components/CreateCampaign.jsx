import { useState } from "react";
import { ethers } from "ethers";
import { getContract } from "../connectWallet";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../css/CreateCampaign.css";

/* ================= PINATA ================= */

const PINATA_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIxMGQ0ZDVjOS1mYWUxLTQyNDctYWViMi0wNzgxNzA5ZDY5ZjYiLCJlbWFpbCI6Im1hbmF2YmFsZGFuaXlhNzJAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6ImM4MTA0ZjYwYzI1OTBhYmRlZGQ4Iiwic2NvcGVkS2V5U2VjcmV0IjoiMzQ1MDI4ZjE1OTY5M2EyYWFiMmYyM2VkZTA0MzQxYzEwYjk4YzFjNzM4NzE4YWQ2OTdmMGU2ODA5NmU4MDk5NCIsImV4cCI6MTc5NzQyOTM5MH0.orWGmCCzrfyYGkB0WynSWPepgeDJ_ByuBE30YkrM3wQ";

/* ================= COMPONENT ================= */

function CreateCampaign() {
  const navigate = useNavigate();

  /* ---------- FORM STATE ---------- */
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [goal, setGoal] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  /* ---------- UI STATE ---------- */
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  /* ---------- NOTIFICATION STATE ---------- */
  const [toast, setToast] = useState({ show: false, msg: "", type: "success" });

  const notify = (message, type = "success") => {
    setToast({ show: true, msg: message, type: type });
    setTimeout(() => {
      setToast({ show: false, msg: "", type: "" });
    }, 3500);
  };

  /* ================= HELPERS ================= */

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const uploadToIPFS = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      formData,
      {
        headers: {
          Authorization: `Bearer ${PINATA_JWT}`,
        },
      }
    );

    return `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`;
  };

  /* ================= MAIN ACTION ================= */

  const handleCreateCampaign = async () => {
    /* ---------- VALIDATION ---------- */
    if (!title.trim() || !description.trim() || !goal || !imagePreview) {
      notify("All fields are required", "error");
      return;
    }

    if (Number(goal) <= 0) {
      notify("Goal must be greater than 0 ETH", "error");
      return;
    }

    try {
      setLoading(true);

      /* ---------- CONTRACT ---------- */
      const contract = await getContract();
      if (!contract) {
        notify("Wallet not connected", "error");
        return;
      }

      /* ---------- IMAGE UPLOAD ---------- */
      let finalImageUrl = imagePreview;

      if (imageFile) {
        setUploading(true);
        notify("Uploading image to IPFS…", "success");

        try {
          finalImageUrl = await uploadToIPFS(imageFile);
        } catch {
          notify("Image upload failed", "error");
          return;
        } finally {
          setUploading(false);
        }
      }

      /* ---------- TRANSACTION ---------- */
      notify("Confirm transaction in wallet", "success");

      const tx = await contract.createCampaign(
        title,
        description,
        ethers.utils.parseEther(goal),
        finalImageUrl
      );

      notify("Transaction sent. Waiting for confirmation…", "success");
      await tx.wait();

      notify("🎉 Campaign created successfully!", "success");

      /* ---------- RESET + REDIRECT ---------- */
      setTimeout(() => {
        navigate("/");
      }, 1500);

    } catch (err) {
      console.error(err);
      notify("Transaction failed", "error");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */

  return (
    <div className="create-container">
      
      {/* --- NOTIFICATION UI --- */}
      {toast.show && (
        <>
          <style>
            {`
              @keyframes slideUp {
                0% { transform: translate(-50%, 150%); opacity: 0; }
                50% { transform: translate(-50%, -15%); opacity: 1; }
                100% { transform: translate(-50%, 0); opacity: 1; }
              }
              .dynamic-island {
                animation: slideUp 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
              }
            `}
          </style>
          <div className="dynamic-island" style={{
            position: 'fixed', bottom: '30px', left: '50%', transform: 'translateX(-50%)',
            background: 'var(--bg-card)', color: 'var(--text-main)', border: '1px solid var(--border-soft)',
            padding: '14px 28px', borderRadius: '50px', display: 'flex', alignItems: 'center', gap: '15px',
            boxShadow: 'var(--shadow-card)', zIndex: 99999999, minWidth: '320px', justifyContent: 'center',
            backdropFilter: 'blur(12px)'
          }}>
            <span style={{ fontSize: '1.2rem' }}>{toast.type === 'error' ? '⚠️' : '✅'}</span>
            <span style={{ fontWeight: 600 }}>{toast.msg}</span>
          </div>
        </>
      )}

      <div className="create-form">

        <h2 className="form-title">Start Creating a Campaign</h2>

        {/* TITLE */}
        <div className="form-group">
          <label>Campaign Title</label>
          <input
            className="form-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Build something meaningful"
          />
        </div>

        {/* DESCRIPTION */}
        <div className="form-group">
          <label>Story</label>
          <textarea
            className="form-textarea"
            rows="5"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Explain your idea clearly and honestly"
          />
        </div>

        {/* GOAL */}
        <div className="form-group">
          <label>Goal Amount </label>
          <div className="funding-input-container">
            <input
              type="number"
              className="funding-input"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="0.5"
            />
            <span className="eth-badge">ETH</span>
          </div>
        </div>

        {/* IMAGE */}
        <div className="form-group">
          <label>Campaign Image</label>

          <div className="image-upload-wrapper">
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              className="hidden-file-input"
              onChange={handleImageSelect}
            />

            <label htmlFor="image-upload" className="file-upload-box">
              <span className="upload-icon">📁</span>
              <span>Upload from device</span>
            </label>

            <div className="or-divider">OR</div>

            <input
              className="form-input"
              placeholder="Paste image URL"
              value={imagePreview}
              onChange={(e) => {
                setImagePreview(e.target.value);
                setImageFile(null);
              }}
            />
          </div>

          {imagePreview && (
            <div className="image-preview-container">
              <img src={imagePreview} alt="Preview" className="image-preview" />
              <button
                className="clear-img-btn"
                onClick={() => {
                  setImagePreview("");
                  setImageFile(null);
                }}
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* SUBMIT */}
        <button
          className="create-btn"
          onClick={handleCreateCampaign}
          disabled={loading || uploading}
        >
          {uploading
            ? "Uploading Image…"
            : loading
            ? "Processing…"
            : "Launch Campaign"}
        </button>

      </div>
    </div>
  );
}

export default CreateCampaign;