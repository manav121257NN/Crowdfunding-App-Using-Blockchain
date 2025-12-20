// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Crowdfunding {
    // Enum to differentiate between funding and withdrawal transactions.
    enum TxType { Fund, Withdraw }

    // Struct to record a transaction (either a fund or a withdrawal).
    struct Transaction {
        address sender;
        uint256 amount;
        TxType txType;
        uint256 timestamp;
    }

    // Updated Campaign struct to include an imageUrl and createdAt.
    struct Campaign {
        address owner;
        string title;
        string description;
        uint256 goal;
        uint256 fundsRaised;
        bool completed;
        string imageUrl;
        uint256 createdAt; // New field for creation timestamp
    }

    // Array to store all campaigns.
    Campaign[] public campaigns;
    // Mapping from campaign ID to an array of transactions (funding/withdrawals).
    mapping(uint256 => Transaction[]) public transactionLogs;

    // Events for front-end notifications.
    event CampaignCreated(uint256 campaignId, string title, uint256 goal, uint256 createdAt);
    event Funded(uint256 campaignId, address funder, uint256 amount);
    event Withdrawn(uint256 campaignId, address owner, uint256 amount);

    /// @notice Create a new campaign with a title, description, funding goal, and image URL.
    function createCampaign(
        string memory _title,
        string memory _description,
        uint256 _goal,
        string memory _imageUrl
    ) public {
        campaigns.push(Campaign({
            owner: msg.sender,
            title: _title,
            description: _description,
            goal: _goal,
            fundsRaised: 0,
            completed: false,
            imageUrl: _imageUrl,
            createdAt: block.timestamp // Set the creation timestamp
        }));
        emit CampaignCreated(campaigns.length - 1, _title, _goal, block.timestamp);
    }

    /// @notice Fund a campaign by sending ETH. Records the funding transaction.
    function fundCampaign(uint256 _campaignId) public payable {
        require(_campaignId < campaigns.length, "Campaign does not exist");
        Campaign storage campaign = campaigns[_campaignId];
        
        // --- SECURITY CHECK: Prevent Owner from Funding ---
        require(msg.sender != campaign.owner, "Owner cannot fund own campaign");
        // -------------------------------------------------

        require(msg.value > 0, "Must send ETH");

        campaign.fundsRaised += msg.value;
        // Log this funding transaction.
        transactionLogs[_campaignId].push(Transaction({
            sender: msg.sender,
            amount: msg.value,
            txType: TxType.Fund,
            timestamp: block.timestamp
        }));
        emit Funded(_campaignId, msg.sender, msg.value);
    }

    /// @notice Withdraw funds from a campaign once the funding goal is reached.
    /// Only the campaign owner can call this function.
    function withdrawFunds(uint256 _campaignId) public {
        require(_campaignId < campaigns.length, "Campaign does not exist");
        Campaign storage campaign = campaigns[_campaignId];
        require(msg.sender == campaign.owner, "Only owner can withdraw");
        require(campaign.fundsRaised >= campaign.goal, "Funding goal not reached");
        require(!campaign.completed, "Campaign already completed");

        uint256 amount = campaign.fundsRaised;
        campaign.completed = true;
        payable(campaign.owner).transfer(amount);
        // Log this withdrawal transaction.
        transactionLogs[_campaignId].push(Transaction({
            sender: campaign.owner,
            amount: amount,
            txType: TxType.Withdraw,
            timestamp: block.timestamp
        }));
        emit Withdrawn(_campaignId, campaign.owner, amount);
    }

    /// @notice Returns all campaigns.
    function getAllCampaigns() public view returns (Campaign[] memory) {
        return campaigns;
    }

    /// @notice Returns the transaction log for a given campaign.
    function getTransactionLog(uint256 _campaignId) public view returns (Transaction[] memory) {
        require(_campaignId < campaigns.length, "Campaign does not exist");
        return transactionLogs[_campaignId];
    }
}