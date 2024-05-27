// SPDX-License-Identifier : MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

import "hardhat/console.sol";

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
    VestingDetails public vestingDetails;

    uint256 public pricePerToken;
    uint256 public constant DAY_IN_SECONDS = 1 days;

    struct VestingDetails {
        uint256 tgeTimeStamp;
        uint256 tgeReleasePercentage;
        uint256 cliffTime;
        VestingScheduleDetails linearVestingDetails;
        uint256 rewardReleasePeriod;
        VestingScheduleDetails vestingPeriod;
        uint256 withdrawPeriod;
        uint256 totalReleaseIterations;
        bool isLinearVesting;
    }

    struct VestingScheduleDetails {
        uint256 startsAt;
        uint256 endsAt;
    }

    mapping(address => uint256) public investors;
    mapping(address => bool) public isTGEReleased;
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
        uint256 _tgeTimeStamp,
        uint256 _tgeReleasePercentage,
        uint256 _cliffTime,
        uint256 _linearVestingStartsAt,
        uint256 _linearVestingEndsAt,
        uint256 _rewardReleasePeriod,
        uint256 _vestingPeriodStartsAt,
        uint256 _vestingPeriodEndsAt,
        uint256 _withdrawPeriod,
        uint256 _pricePerToken
    ) public initializer {
        require(_startsAt < _endsAt, "Invalid campaign time");
        require(_targetRaise > 0, "Invalid target raise");
        require(_investToken != address(0), "404: Invest token");
        require(_token != address(0), "404: Project token");
        require(
            _tgeTimeStamp > _startsAt,
            "TGE will only happen after campaign start choose correct tge timestamp"
        );
        require(_withdrawPeriod != 0, "404: Withdraw period");
        require(_pricePerToken != 0, "404: Price per token");
        startsAt = _startsAt;
        endsAt = _endsAt;
        targetRaise = _targetRaise;
        vestingDetails.tgeTimeStamp = _tgeTimeStamp;
        vestingDetails.tgeReleasePercentage = _tgeReleasePercentage;
        vestingDetails.withdrawPeriod =
            (_withdrawPeriod * DAY_IN_SECONDS) +
            _startsAt;
        if (_linearVestingStartsAt != 0 && _linearVestingEndsAt != 0) {
            require(
                _linearVestingStartsAt > _tgeTimeStamp,
                "Invalid vesting period"
            );
            require(
                _linearVestingEndsAt > _linearVestingStartsAt,
                "Invalid vesting period"
            );
            vestingDetails.linearVestingDetails = VestingScheduleDetails(
                _linearVestingStartsAt,
                _linearVestingEndsAt
            );
            if (_cliffTime > 0) {
                vestingDetails.cliffTime =
                    (_cliffTime * DAY_IN_SECONDS) +
                    _startsAt;
            }
            vestingDetails.isLinearVesting = true;
        } else {
            if (
                _vestingPeriodStartsAt == 0 ||
                _vestingPeriodEndsAt == 0 ||
                _rewardReleasePeriod == 0
            ) {
                revert("Invalid vesting period");
            }

            if (_cliffTime > 0) {
                vestingDetails.cliffTime =
                    (_cliffTime * DAY_IN_SECONDS) +
                    _tgeTimeStamp;
            }
            vestingDetails.vestingPeriod = VestingScheduleDetails(
                _vestingPeriodStartsAt,
                _vestingPeriodEndsAt
            );
            vestingDetails.rewardReleasePeriod = (_rewardReleasePeriod *
                DAY_IN_SECONDS);
            vestingDetails.totalReleaseIterations =
                vestingDetails.vestingPeriod.endsAt -
                vestingDetails.vestingPeriod.startsAt /
                vestingDetails.rewardReleasePeriod;
        }
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
        require(
            investToken.allowance(msg.sender, address(this)) != 0,
            "Insufficient Allowance"
        );
        bool transfer = investToken.transferFrom(
            msg.sender,
            address(this),
            _amount
        );
        require(transfer, "Transfer Failed");
        investors[msg.sender] = _amount;
        investedTime[msg.sender] = block.timestamp;
        if (vestingDetails.isLinearVesting == false) {
            tokenToReleaseIterations[msg.sender] = vestingDetails
                .totalReleaseIterations;
        }
        tokensToRelease[msg.sender] = _amount / pricePerToken;
        totalRaise += _amount;

        emit _invest(msg.sender, _amount, block.timestamp);
    }

    /**
    @dev function for withdraw the investment
     */
    function withdraw() public {
        require(investors[msg.sender] > 0, "Not Invested");
        require(
            block.timestamp <= vestingDetails.withdrawPeriod,
            "Withdraw Period Ends."
        );
        console.log("Token Balance", token.balanceOf(address(this)));
        console.log("Invested Amount", investors[msg.sender]);

        bool transfer = token.transfer(msg.sender, investors[msg.sender]);
        require(transfer, "Transfer Failed");
        totalRaise -= investors[msg.sender];
        investors[msg.sender] = 0;
        tokensToRelease[msg.sender] = 0;

        emit _withdraw(msg.sender, block.timestamp);
    }

    /**
     * @dev function for claiming reward
     */
    function claimToken() public {
        require(investors[msg.sender] > 0, "Not Invested");
        require(tokensToRelease[msg.sender] > 0, "Their is no tokens to claim");
        require(
            vestingDetails.tgeTimeStamp < block.timestamp,
            "Token not generated"
        );
        require(
            vestingDetails.cliffTime < block.timestamp,
            "Cliff period you can't claim."
        );
        uint256 currentTimeDiff = block.timestamp - vestingDetails.tgeTimeStamp;

        if (vestingDetails.isLinearVesting) {
            require(
                block.timestamp > vestingDetails.linearVestingDetails.startsAt,
                "Vesting not started"
            );
            require(
                block.timestamp < vestingDetails.linearVestingDetails.endsAt,
                "Vesting end"
            );
            if (isTGEReleased[msg.sender] == false) {
                uint256 tgeTokens = (tokensToRelease[msg.sender] *
                    vestingDetails.tgeReleasePercentage) / 100;
                uint256 vestedTokens = calculateVestedAmount(
                    block.timestamp,
                    msg.sender
                );
                tokensToRelease[msg.sender] -= vestedTokens;
                isTGEReleased[msg.sender] = true;
                token.transfer(msg.sender, tgeTokens + vestedTokens);
                emit _claimToken(msg.sender, tgeTokens + vestedTokens);
            } else {
                uint256 vestedTokens = calculateVestedAmount(
                    block.timestamp,
                    msg.sender
                );
                tokensToRelease[msg.sender] -= vestedTokens;

                token.transfer(msg.sender, vestedTokens);
                emit _claimToken(msg.sender, vestedTokens);
            }
        } else {
            require(
                tokenToReleaseIterations[msg.sender] <=
                    vestingDetails.totalReleaseIterations,
                "All tokens claimed"
            );
            uint256 currentIteration = vestingDetails.totalReleaseIterations -
                tokenToReleaseIterations[msg.sender] +
                1;

            uint256 requiredTime = currentIteration *
                vestingDetails.rewardReleasePeriod;
            require(
                currentTimeDiff >= requiredTime,
                "Release period not yet reached"
            );
            uint256 TokensToRelease = tokensToRelease[msg.sender] /
                vestingDetails.vestingPeriod.startsAt +
                vestingDetails.vestingPeriod.endsAt;
            tokensToRelease[msg.sender] -= TokensToRelease;
            token.transfer(msg.sender, TokensToRelease);
            tokenToReleaseIterations[msg.sender] -= 1;

            emit _claimToken(msg.sender, TokensToRelease);
        }
    }

    /**
    @dev function for getting total tokens to claim
     */
    function getTotalTokensToClaim() public view returns (uint256) {
        return totalTokensToRelease[msg.sender];
    }

    /**
    @dev function for getting number of tokens to claim
     */
    function getTokensToClaim() public view returns (uint256) {
        return tokensToRelease[msg.sender];
    }

    /**
     * @dev function for getting vesting start time
     */
    function getVestingStartTime() public view returns (uint256) {
        return investedTime[msg.sender];
    }

    // /**
    // @dev function for getting vesting end time
    //  */
    // function getVestingEndTime() public view returns (uint256) {
    //     return investedTime[msg.sender] + vestingDetails.totalVestingPeriod;
    // }

    /**
     * @dev function for getting total claimed percentage
     */
    function getTotalClaimedPercentage() public view returns (uint256) {
        return
            100 -
            ((tokensToRelease[msg.sender] * 100) /
                totalTokensToRelease[msg.sender]);
    }

    /**
     * @dev function for getting token iteration stage
     */
    function getTokenIterationStage() public view returns (uint256) {
        return
            vestingDetails.totalReleaseIterations -
            tokenToReleaseIterations[msg.sender] +
            1;
    }

    /**
     * @dev function for getting total remaining amount to claim
     */
    function getAmountToClaim() public view returns (uint256) {
        return tokensToRelease[msg.sender];
    }

    /**
    @dev function getting vested amount to claim
     */
    function calculateVestedAmount(
        uint256 _currentTime,
        address _investor
    ) internal view returns (uint256) {
        if (_currentTime <= vestingDetails.linearVestingDetails.startsAt) {
            return 0;
        } else if (_currentTime >= vestingDetails.linearVestingDetails.endsAt) {
            return tokensToRelease[_investor];
        } else {
            uint256 vestingDuration = vestingDetails
                .linearVestingDetails
                .endsAt - vestingDetails.linearVestingDetails.startsAt;
            uint256 timeElapsed = _currentTime -
                vestingDetails.linearVestingDetails.startsAt;
            return (tokensToRelease[_investor] * timeElapsed) / vestingDuration;
        }
    }
    /**
    @dev function for getting raised percentage
    */
    function getTotalRaisePercentage() public view returns (uint256) {
        return (totalRaise * 100) / targetRaise;
    }

    /**
    @dev function for checking isLeap year
     */
    function isLeapYear(uint16 year) internal pure returns (bool) {
        if (year % 4 != 0) {
            return false;
        } else if (year % 100 != 0) {
            return true;
        } else if (year % 400 != 0) {
            return false;
        } else {
            return true;
        }
    }

    /**
    @dev function for getting month in days 
    */
    function getDaysInMonth(
        uint8 month,
        uint16 year
    ) internal pure returns (uint8) {
        if (
            month == 1 ||
            month == 3 ||
            month == 5 ||
            month == 7 ||
            month == 8 ||
            month == 10 ||
            month == 12
        ) {
            return 31;
        } else if (month == 4 || month == 6 || month == 9 || month == 11) {
            return 30;
        } else if (month == 2) {
            if (isLeapYear(year)) {
                return 29;
            } else {
                return 28;
            }
        } else {
            revert("Invalid month");
        }
    }
}
