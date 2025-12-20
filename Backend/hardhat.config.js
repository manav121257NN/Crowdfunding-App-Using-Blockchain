require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.28",
  networks: {
    ganache: {
      url: "HTTP://127.0.0.1:7545",
      accounts: [
        "0xdf934f1824d2d07445e0d2370af0bb8bb59fc276d126003172048d24dae4a608"
      ]
    },
    sepolia: {
      url: "https://eth-sepolia.g.alchemy.com/v2/ZWC_ii_ipsuAsjXgC2qQj",
      accounts: ["eaa2e69ace4e6a0831b1f61c622a2c6b4d5009f7918d4c73fe7455d66ceb0ef8"],
    },
  }
};
