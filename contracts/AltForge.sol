// SPDX-License-Identifier : MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract AltForge is
    Initializable,
    ERC20Upgradeable,
    ReentrancyGuardUpgradeable
{
    ERC20Upgradeable token;
    ERC20Upgradeable investToken;
    uint256 public targetRaise;
    uint256 public totalRaise;
    uint256 public startsAt;
    uint256 public endsAt;
    uint256 public rewardReleasePeriod;
    uint256 public rewardReleasePercentage;
    uint256 public totalVestingPeriod;
    uint256 public withdrawPeriod;
    uint256 public totalReleaseIterations;

    uint256 public pricePerToken;
    uint256 public constant DAY_IN_SECONDS = 1 days;
    uint256 public constant MONTH_IN_SECONDS = 30 days;

    mapping(address => uint256) public investors;
    mapping(address => uint256) public tokensToRelease;
    mapping(address => uint256) public totalTokensToRelease;
    mapping(address => uint256) public tokenToReleaseIterations;
    mapping(address => uint256) public investedTime;

    event _withdraw(address _investor, uint256 _timestamp);

    event _invest(address _investor, uint256 _amount, uint256 _timestamp);

    event _claimToken(address _investor, uint256 _releasedAmount);

    function initialize(
        address _token,
        address _investToken,
        uint256 _targetRaise,
        uint256 _startsAt,
        uint256 _endsAt,
        uint256 _rewardReleasePeriod,
        uint256 _withdrawPeriod,
        uint256 _rewardReleasePercentage,
        uint256 _totalVestingPeriod,
        uint256 _pricePerToken
    ) external initializer {
        startsAt = _startsAt;
        endsAt = _endsAt;
        targetRaise = _targetRaise;
        rewardReleasePeriod = _rewardReleasePeriod * DAY_IN_SECONDS;
        withdrawPeriod = _withdrawPeriod * DAY_IN_SECONDS;
        rewardReleasePercentage = _rewardReleasePercentage;
        totalVestingPeriod = _totalVestingPeriod * MONTH_IN_SECONDS;
        totalReleaseIterations = totalVestingPeriod / rewardReleasePeriod;
        pricePerToken = _pricePerToken;
        token = ERC20Upgradeable(_token);
        investToken = ERC20Upgradeable(_investToken);
    }

    /**
     * @dev function for investing into project
     */
    function invest(uint256 _amount) public {
        require(
            investToken.balanceOf(msg.sender) >= _amount,
            "Insufficient Balance"
        );
        require(investors[msg.sender] == 0, "Already Invested");
        require(endsAt >= block.timestamp, "Investment ends");
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
        tokensToRelease[msg.sender] = _amount / pricePerToken;
        totalTokensToRelease[msg.sender] = _amount / pricePerToken;
        totalRaise += _amount;

        emit _invest(msg.sender, _amount, block.timestamp);
    }

    /**
    @dev function for withdraw the investment
     */
    function withdraw() public {
        require(investors[msg.sender] > 0, "Not Invested");
        require(block.timestamp > investedTime[msg.sender]);
        uint256 currentTimeDiff = block.timestamp - investedTime[msg.sender];

        require(currentTimeDiff <= withdrawPeriod, "Withdraw Period Ends.");
        token.transferFrom(address(this), msg.sender, investors[msg.sender]);
        totalRaise -= investors[msg.sender];
        investors[msg.sender] = 0;
        tokensToRelease[msg.sender] = 0;
        totalTokensToRelease[msg.sender] = 0;

        emit _withdraw(msg.sender, block.timestamp);
    }

    /**
     * @dev function for claiming reward
     */
    function claimToken() public {
        require(investors[msg.sender] > 0, "Not Invested");
        require(tokensToRelease[msg.sender] > 0, "Their is no tokens to claim");
        require(investedTime[msg.sender] < block.timestamp);
        uint256 currentTimeDiff = block.timestamp - investedTime[msg.sender];

        uint256 currentIteration = totalReleaseIterations -
            tokenToReleaseIterations[msg.sender] +
            1;

        uint256 requiredTime = currentIteration * rewardReleasePeriod;

        require(
            currentTimeDiff >= requiredTime,
            "Release period not yet reached"
        );

        token.transfer(
            msg.sender,
            tokensToRelease[msg.sender] * (rewardReleasePercentage / 100)
        );
        tokensToRelease[msg.sender] =
            tokensToRelease[msg.sender] -
            tokensToRelease[msg.sender] *
            (rewardReleasePercentage / 100);
        tokenToReleaseIterations[msg.sender] -= 1;

        if (tokensToRelease[msg.sender] == 0) {
            totalTokensToRelease[msg.sender] = 0;
        }

        emit _claimToken(
            msg.sender,
            tokensToRelease[msg.sender] * (rewardReleasePercentage / 100)
        );
    }

    /**
    @dev function for getting total tokens to claim
     */
    function getTotalTokensToClaim() public view returns (uint256) {
        return totalTokensToRelease[msg.sender];
    }

    /**
     * @dev function for getting vesting start time
     */
    function getVestingStartTime() public view returns (uint256) {
        return investedTime[msg.sender];
    }

    /**
    @dev function for getting vesting end time
     */
    function getVestingEndTime() public view returns (uint256) {
        return investedTime[msg.sender] + totalVestingPeriod;
    }

    /**
     * @dev function for getting total claimed percentage
     */
    function getTotalClaimedPercentage() public view returns (uint256) {
        return tokensToRelease[msg.sender];
    }

    /**
     * @dev function for getting token iteration stage
     */
    function getTokenIterationStage() public view returns (uint256) {
        return
            totalReleaseIterations - tokenToReleaseIterations[msg.sender] + 1;
    }

    /**
     * @dev function for getting total remaining amount to claim
     */
    function getAmountToClaim() public view returns (uint256) {
        return tokensToRelease[msg.sender];
    }

    /**
    @dev function for getting raised percentage
    */
    function getTotalRaisePercentage() public view returns (uint256) {
        return (totalRaise * 100) / targetRaise;
    }
}
