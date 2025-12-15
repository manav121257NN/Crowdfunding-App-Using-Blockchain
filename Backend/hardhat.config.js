require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.28",
  networks: {
    ganache: {
      url: "HTTP://127.0.0.1:7545",
      accounts: [
        "0x84f56b32b0e71a543afaa96b1ce18cd2e5f6c3f55ef135f7d75e29d7461ded15"
      ]
    }
  }
};
