require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.28",
  networks: {
    ganache: {
      url: "HTTP://127.0.0.1:7545",
      accounts: [
        "0x16352c0c73ed72db140940b66e255dbc92101409049786b7ea9e72a771d84fe6"
      ]
    }
  }
};
