# Save the complete README content into a file named README.md

readme_content = """
# 💸 Crowdfunding DApp using Blockchain

A fully functional decentralized crowdfunding application that allows users to create, fund, and manage fundraising campaigns securely on the blockchain.

This project is divided into two parts:
- `crowdfunding-blockchain/`: Smart contracts built using Solidity and Hardhat
- `crowdfunding-frontend/`: Frontend interface using React and Ethers.js

---

## 📁 Project Structure

---

## 🚀 Features

- Deploy and interact with smart contracts
- Create new campaigns with target and deadline
- Fund other users' campaigns using MetaMask
- Withdraw funds by campaign creator once goal is reached
- View total raised, contributors, and campaign status

---

## 🛠 Tech Stack

| Layer         | Technology        |
|---------------|------------------|
| Blockchain    | Ethereum (Ganache/Hardhat) |
| Smart Contract| Solidity, Hardhat |
| Frontend      | React.js, Ethers.js |
| Wallet        | MetaMask          |

---

## 🧪 Requirements

- Node.js (v14 or higher)
- MetaMask extension
- Ganache (or Hardhat local node)
- Git

---

## ⚙️ How to Run the Full Application

### 🔁 1. Clone the Repository

```bash
git clone https://github.com/manav121257NN/Crowdfunding-App-Using-Blockchain.git
cd Crowdfunding-App-Using-Blockchain
```
for baackend 
```bash
cd Backend
npm install
npx hardhat compile
npx hardhat run scripts/deploy.js --network ganache
```
for frontend
```bash
cd ../Fronted
npm install
directory Fronted\src\contractConfig.js REACT_APP_CONTRACT_ADDRESS=YOUR_DEPLOYED_CONTRACT_ADDRESS
npm start
```


## ⚙️ Output

![image alt](https://github.com/manav121257NN/Crowdfunding-App-Using-Blockchain/blob/df05d5693af7852aa1c0f18051eea5340602eae9/Images/Screenshot%202025-08-03%20185315.png)
![image alt](https://github.com/manav121257NN/Crowdfunding-App-Using-Blockchain/blob/df05d5693af7852aa1c0f18051eea5340602eae9/Images/Screenshot%202025-08-03%20185327.png)
![image alt](https://github.com/manav121257NN/Crowdfunding-App-Using-Blockchain/blob/df05d5693af7852aa1c0f18051eea5340602eae9/Images/Screenshot%202025-08-03%20185338.png)

