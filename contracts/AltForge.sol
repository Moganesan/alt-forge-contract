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
    uint256 totalReleaseIteration;
    uint256[] rewardReleasePercentages;
    uint256 pricePerToken;
    uint256 public constant DAY_IN_SECONDS = 1 days;
    AggregatorV3Interface internal priceFeed;

    mapping(address => uint256) private investors;
    mapping(address => uint256) private tokensToRelease;

    constructor(
        address _token,
        uint256 _targetRaise,
        uint256 _startsAt,
        uint256 _endsAt,
        uint256 _rewardReleasePeriod,
        uint256[] memory _rewardReleasePercentages,
        address _priceFeedContract,
        uint256 _pricePerToken
    ) {
        uint256 totalIterations = calculateTotalReleaseIterations(
            _startsAt,
            _endsAt,
            _rewardReleasePeriod
        );
        require(
            totalIterations == _rewardReleasePercentages.length,
            "Invalid Reward Release Percentages"
        );
        targetRaise = _targetRaise;
        rewardReleasePercentages = _rewardReleasePercentages;
        token = ERC20(_token);
        priceFeed = AggregatorV3Interface(_priceFeedContract);
    }

    /**
     * @dev function for calculating total release iterations
     */
    function calculateTotalReleaseIterations(
        uint256 startsAt,
        uint256 endsAt,
        uint256 rewardReleasePeriod
    ) internal pure returns (uint256) {
        require(startsAt <= endsAt, "Invalid time range");

        uint256 totalTimePeriod = endsAt - startsAt;
        uint256 rewardReleasePeriodInSeconds = rewardReleasePeriod *
            DAY_IN_SECONDS;

        require(
            rewardReleasePeriodInSeconds > 0,
            "Invalid reward release period"
        );

        uint256 totalReleaseIterations = totalTimePeriod /
            rewardReleasePeriodInSeconds;

        return totalReleaseIterations;
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
        uint256 ethToUSD = msg.value * getEthUsdPrice();
        investors[msg.sender] = msg.value;
        tokensToRelease[msg.sender] = pricePerToken * ethToUSD;
    }
}
