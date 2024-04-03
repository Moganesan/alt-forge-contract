// SPDX-License-Identifier : MIT
pragma solidity ^0.8.19;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract AltForge {
    ERC20 token;
    uint256 targetRaise;
    uint256 totalRaise;
    uint256 startsAt;
    uint256 endsAt;
    uint256 rewardReleasePeriod;
    uint256 rewardReleasePercentage;
    uint256 totalVestingPeriod;
    uint256 totalReleaseIterations;

    uint256 pricePerToken;
    uint256 public constant DAY_IN_SECONDS = 1 days;
    uint256 public constant MONTH_IN_SECONDS = 30 days;
    AggregatorV3Interface internal priceFeed;

    mapping(address => uint256) private investors;
    mapping(address => uint256) private tokensToRelease;
    mapping(address => uint256) private investedTime;

    constructor(
        address _token,
        uint256 _targetRaise,
        uint256 _startsAt,
        uint256 _endsAt,
        uint256 _rewardReleasePeriod,
        uint256 _rewardReleasePercentage,
        uint256 _totalVestingPeriod,
        address _priceFeedContract,
        uint256 _pricePerToken
    ) {
        startsAt = _startsAt;
        endsAt = _endsAt;
        targetRaise = _targetRaise;
        rewardReleasePeriod = _rewardReleasePeriod;
        rewardReleasePercentage = _rewardReleasePercentage;
        totalVestingPeriod = _totalVestingPeriod;
        token = ERC20(_token);
        priceFeed = AggregatorV3Interface(_priceFeedContract);
    }

    function getEthUsdPrice() public view returns (int) {
        (
            uint80 roundID,
            int price,
            uint startedAt,
            uint timeStamp,
            uint80 answeredInRound
        ) = priceFeed.latestRoundData();
        return price;
    }

    /**
     * @dev function for investing into project
     */
    function invest() public payable {
        require(msg.value > 0, "Investment Required");
        require(msg.sender != investors[msg.sender], "Already Invested");
        require(endsAt <= block.timestamp, "Investment ends");
        investors[msg.sender] = msg.value;
        investedTime[msg.sender] = block.timestamp;
        tokensToRelease[msg.sender] =
            pricePerToken *
            (msg.value * getEthUsdPrice());
    }

    /**
     * @dev function for claiming reward
     */
    function claimToken() public {
        require(investors[msg.sender] != address(0), "Not Invested");
        require(
            tokensToRelease[msg.sender] != 0,
            "Their is no tokens to claim"
        );
    }
}
