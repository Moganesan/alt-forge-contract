import AltForgeModule from "../ignition/AltForgeModule";
import InvestTokenModule from "../ignition/InvestTokenModule";
import RewardTokenModule from "../ignition/rewardTokenModule";
import { ignition } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { parseEther, zeroAddress } from "viem";
import { expect } from "chai";

describe("Alt Forge", async function () {
  // setting startsAt current timestamp
  const startsAt = Math.round(new Date().getTime() / 1000) - 10;

  const currentTime = new Date();

  // setting endsAt for after one month
  currentTime.setUTCMonth(currentTime.getUTCMonth() + 1);

  // setting endsAt date for adding 30days with current date
  currentTime.setUTCDate(30 - new Date().getDate());

  // setting endsAt
  const endsAt = currentTime.getTime();

  // target raise
  const targetRaise = parseEther("1000");

  // setting tokenGeneration timestamp
  const tgeTimestamp = new Date(startsAt);

  // setting tokenGeneration timestamp after five deys after campaign starts
  tgeTimestamp.setDate(new Date(startsAt).getDate() + 5);

  // tge token release percentage
  const tgeReleasePercentage = 10;

  // cliff time in days
  const cliffTime = 30;

  // linear vesting period in months
  const linearVestingPeriod = 9;

  // reward release period in months
  // note: if linear vesting period is set reward release period not needed
  const rewardReleasePeriod = 0;

  // total vesting period in monts
  // note: if linear vesting period is set total vesting period not needed
  const totalVestingPeriod = 0;

  // withdraw period in days
  const withdrawPeriod = 3;

  // price per token
  const pricePerToken = parseEther("0.1");

  const deployAltForgeFixer = async () => {
    const { altForge } = await ignition.deploy(AltForgeModule);
    return altForge;
  };

  const deployRewardTokenFixer = async () => {
    const { rewardToken } = await ignition.deploy(RewardTokenModule, {
      parameters: {
        RewardToken: {
          initialSupply: parseEther("1000000"),
        },
      },
    });

    return rewardToken;
  };

  const deployInvestTokenFixer = async () => {
    const { investToken } = await ignition.deploy(InvestTokenModule, {
      parameters: {
        InvestToken: {
          initialSupply: parseEther("1000000"),
        },
      },
    });

    return investToken;
  };

  it("Should throw an error when passing empty project token address.", async function () {
    try {
      const altForge = await loadFixture(deployAltForgeFixer);
      const investToken = await loadFixture(deployInvestTokenFixer);

      await altForge.write.initialize([
        zeroAddress,
        investToken.address,
        BigInt(targetRaise),
        BigInt(startsAt + 2),
        BigInt(endsAt),
        BigInt(tgeTimestamp.getTime()),
        BigInt(tgeReleasePercentage),
        BigInt(cliffTime),
        BigInt(linearVestingPeriod),
        BigInt(rewardReleasePeriod),
        BigInt(totalVestingPeriod),
        BigInt(withdrawPeriod),
        BigInt(pricePerToken),
      ]);
    } catch (err) {
      const revertMessage = extractRevertMessage(err);
      expect(revertMessage).to.equal("404: Project token");
    }
  });

  it("Should throw an error when passing empty invest token address.", async function () {
    try {
      const altForge = await loadFixture(deployAltForgeFixer);
      const rewardToken = await loadFixture(deployRewardTokenFixer);

      await altForge.write.initialize([
        rewardToken.address,
        zeroAddress,
        BigInt(targetRaise),
        BigInt(startsAt + 2),
        BigInt(endsAt),
        BigInt(tgeTimestamp.getTime()),
        BigInt(tgeReleasePercentage),
        BigInt(cliffTime),
        BigInt(linearVestingPeriod),
        BigInt(rewardReleasePeriod),
        BigInt(totalVestingPeriod),
        BigInt(withdrawPeriod),
        BigInt(pricePerToken),
      ]);
    } catch (err) {
      const revertMessage = extractRevertMessage(err);

      expect(revertMessage).to.equal("404: Invest token");
    }
  });

  it("Should throw an error when passing invalid start time.", async function () {
    try {
      const altForge = await loadFixture(deployAltForgeFixer);

      const rewardToken = await loadFixture(deployRewardTokenFixer);

      const investToken = await loadFixture(deployInvestTokenFixer);

      await altForge.write.initialize([
        rewardToken.address,
        investToken.address,
        BigInt(targetRaise),
        BigInt(startsAt + 1000),
        BigInt(endsAt),
        BigInt(tgeTimestamp.getTime()),
        BigInt(tgeReleasePercentage),
        BigInt(cliffTime),
        BigInt(linearVestingPeriod),
        BigInt(rewardReleasePeriod),
        BigInt(totalVestingPeriod),
        BigInt(withdrawPeriod),
        BigInt(pricePerToken),
      ]);
    } catch (err) {
      const revertMessage = extractRevertMessage(err);

      expect(revertMessage).to.equal("Invalid start time");
    }
  });

  it("Should throw and error when passing invalid campaign time.", async function () {
    try {
      const altForge = await loadFixture(deployAltForgeFixer);
      const rewardToken = await loadFixture(deployRewardTokenFixer);
      const investToken = await loadFixture(deployInvestTokenFixer);
      await altForge.write.initialize([
        rewardToken.address,
        investToken.address,
        BigInt(targetRaise),
        BigInt(startsAt),
        BigInt(startsAt),
        BigInt(tgeTimestamp.getTime()),
        BigInt(tgeReleasePercentage),
        BigInt(cliffTime),
        BigInt(linearVestingPeriod),
        BigInt(rewardReleasePeriod),
        BigInt(totalVestingPeriod),
        BigInt(withdrawPeriod),
        BigInt(pricePerToken),
      ]);
    } catch (err) {
      const revertMessage = extractRevertMessage(err);

      expect(revertMessage).to.equal("Invalid campaign time");
    }
  });

  const extractRevertMessage = (err: any) => {
    const message = String(JSON.parse(JSON.stringify(err)).details || "");
    const revertReasonPattern = /reverted with reason string '([^']+)'/;
    try {
      const messageMatch: any = message.match(revertReasonPattern);
      return messageMatch[1];
    } catch (err) {
      console.log(err);
    }
  };
});
