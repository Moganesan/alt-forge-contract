// SPDX-License-Identifier : MIT
pragma solidity ^0.8.19;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract AltForge {
    ERC20 token;
    ERC20 investToken;
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
    mapping(address => uint256) private tokenToReleaseIterations;
    mapping(address => uint256) private investedTime;

    constructor(
        address _token,
        address _investToken,
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
        rewardReleasePeriod = _rewardReleasePeriod * DAY_IN_SECONDS;
        rewardReleasePercentage = _rewardReleasePercentage;
        totalVestingPeriod = _totalVestingPeriod * MONTH_IN_SECONDS;
        totalReleaseIterations = totalVestingPeriod / rewardReleasePeriod;
        token = ERC20(_token);
        investToken = ERC20(_investToken);
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
    function invest(uint256 _amount) public {
        require(
            investToken.balanceOf(msg.sender) > _amount,
            "Insufficient Balance"
        );
        require(investors[msg.sender] <= 0, "Already Invested");
        require(endsAt <= block.timestamp, "Investment ends");
        bool approve = investToken.approve(address(this), _amount);
        require(approve, "Approve Failed");
        bool transfer = investToken.transferFrom(
            msg.sender,
            address(this),
            _amount
        );
        require(transfer, "Transfer Failed");
        investors[msg.sender] = _amount;
        investedTime[msg.sender] = block.timestamp;
        tokenToReleaseIterations[msg.sender] = totalReleaseIterations;
        tokensToRelease[msg.sender] =
            pricePerToken *
            (_amount * getEthUsdPrice());
    }

    /**
     * @dev function for claiming reward
     */
    function claimToken() public {
        require(investors[msg.sender] > 0, "Not Invested");
        require(
            tokensToRelease[msg.sender] != 0,
            "Their is no tokens to claim"
        );
        require(investedTime[msg.sender] < block.timestamp);
        uint256 currentTimeDiff = block.timestamp - investedTime[msg.sender];
        require(currentTimeDiff >= rewardReleasePeriod);
        token.transfer(
            msg.sender,
            tokensToRelease[msg.sender] * (rewardReleasePercentage / 100)
        );
        tokensToRelease[msg.sender] =
            tokensToRelease[msg.sender] -
            tokensToRelease[msg.sender] *
            (rewardReleasePercentage / 100);
        tokenToReleaseIterations[msg.sender] =
            tokenToReleaseIterations[msg.sender] -
            1;
    }
}
