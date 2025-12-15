import { ethers } from "ethers";
import { contractAddress, contractABIArray } from "./contractConfig";

// Use Web3Provider for ethers v5
const provider = new ethers.providers.Web3Provider(window.ethereum);

export async function connectWallet() {
  try {
    if (!window.ethereum) {
      alert("MetaMask is not installed!");
      return null;
    }
    await window.ethereum.request({ method: "eth_requestAccounts" });
    const signer = provider.getSigner();
    return signer;
  } catch (error) {
    console.error("Wallet connection error:", error);
    return null;
  }
}

export async function getContract() {
  try {
    const signer = await connectWallet();
    if (!signer) return null;
    const contract = new ethers.Contract(contractAddress, contractABIArray, signer);
    return contract;
  } catch (error) {
    console.error("Error getting contract:", error);
    return null;
  }
}
