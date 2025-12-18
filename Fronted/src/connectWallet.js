import { ethers } from "ethers";
import { contractAddress, contractABIArray } from "./contractConfig";

export async function connectWallet() {
  // 🔒 SAFETY CHECK
  if (typeof window.ethereum === "undefined") {
    throw new Error("MetaMask not installed");
  }

  // Ask user to connect
  await window.ethereum.request({ method: "eth_requestAccounts" });

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  return provider.getSigner();
}

export async function getContract() {
  if (typeof window.ethereum === "undefined") {
    throw new Error("MetaMask not installed");
  }

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();

  return new ethers.Contract(
    contractAddress,
    contractABIArray,
    signer
  );
}
