import AltForgeModule from "../ignition/AltForgeModule";
import InvestTokenModule from "../ignition/InvestTokenModule";
import RewardTokenModule from "../ignition/rewardTokenModule";
import { ignition } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { parseEther, zeroAddress } from "viem";
import { expect } from "chai";

describe("Alt Forge", async function () {
  // setting startsAt current timestamp
  const startsAt = Math.round(new Date().getTime() / 1000);

  const currentTime = new Date();

  // setting endsAt for after one month
  // setting endsAt date for adding 31days with current date
  currentTime.setUTCDate(new Date().getDate() + 31);

  // setting endsAt
  const endsAt = Math.round(currentTime.getTime() / 1000);

  // target raise
  const targetRaise = parseEther("1000");

  // setting tokenGeneration timestamp
  const tgeTimeStampInstance = new Date();

  // setting tokenGeneration timestamp after five deys after campaign starts
  tgeTimeStampInstance.setDate(new Date().getDate() + 5);

  const tgeTimestamp = Math.round(tgeTimeStampInstance.getTime() / 1000);

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

  // localTime option
  const localTimeOption = {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true, // for 12-hour time format with AM/PM
  };

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
        BigInt(tgeTimestamp),
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
        BigInt(tgeTimestamp),
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
        BigInt(tgeTimestamp),
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

  it("Should throw an error when passing invalid campaign time.", async function () {
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
        BigInt(tgeTimestamp),
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

  it("Should throw an error when passing invalid target raise.", async function () {
    try {
      const altForge = await loadFixture(deployAltForgeFixer);
      const rewardToken = await loadFixture(deployRewardTokenFixer);
      const investToken = await loadFixture(deployInvestTokenFixer);

      await altForge.write.initialize([
        rewardToken.address,
        investToken.address,
        parseEther("0"),
        BigInt(startsAt),
        BigInt(endsAt),
        BigInt(tgeTimestamp),
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

      expect(revertMessage).to.equal("Invalid target raise");
    }
  });

  it("Should throw an error when passing invalid tgeTimestamp.", async function () {
    try {
      const altForge = await loadFixture(deployAltForgeFixer);
      const rewardToken = await loadFixture(deployRewardTokenFixer);
      const investToken = await loadFixture(deployInvestTokenFixer);

      await altForge.write.initialize([
        rewardToken.address,
        investToken.address,
        BigInt(targetRaise),
        BigInt(startsAt),
        BigInt(endsAt),
        BigInt(startsAt),
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

      expect(revertMessage).to.equal(
        "TGE will only happen after campaign start choose correct tge timestamp"
      );
    }
  });

  it("Should throw an error when passing invalid withdraw period.", async function () {
    try {
      const altForge = await loadFixture(deployAltForgeFixer);

      const rewardToken = await loadFixture(deployRewardTokenFixer);

      const investToken = await loadFixture(deployInvestTokenFixer);

      await altForge.write.initialize([
        rewardToken.address,
        investToken.address,
        BigInt(targetRaise),
        BigInt(startsAt),
        BigInt(endsAt),
        BigInt(tgeTimestamp),
        BigInt(tgeReleasePercentage),
        BigInt(cliffTime),
        BigInt(linearVestingPeriod),
        BigInt(rewardReleasePeriod),
        BigInt(totalVestingPeriod),
        BigInt(BigInt("0")),
        BigInt(pricePerToken),
      ]);
    } catch (err) {
      const revertMessage = extractRevertMessage(err);

      expect(revertMessage).to.equal("404: Withdraw period");
    }
  });

  it("Should throw an error when passing invalid price per token valued.", async function () {
    try {
      const altForge = await loadFixture(deployAltForgeFixer);
      const rewardToken = await loadFixture(deployRewardTokenFixer);
      const investToken = await loadFixture(deployInvestTokenFixer);

      await altForge.write.initialize([
        rewardToken.address,
        investToken.address,
        BigInt(targetRaise),
        BigInt(startsAt),
        BigInt(endsAt),
        BigInt(tgeTimestamp),
        BigInt(tgeReleasePercentage),
        BigInt(cliffTime),
        BigInt(linearVestingPeriod),
        BigInt(rewardReleasePeriod),
        BigInt(totalVestingPeriod),
        BigInt(withdrawPeriod),
        BigInt("0"),
      ]);
    } catch (err) {
      const revertMessage = extractRevertMessage(err);

      expect(revertMessage).to.equal("404: Price per token");
    }
  });

  it("Should throw an error when passing invalid vesting period.", async function () {
    try {
      const altForge = await loadFixture(deployAltForgeFixer);
      const rewardToken = await loadFixture(deployRewardTokenFixer);
      const investToken = await loadFixture(deployInvestTokenFixer);

      await altForge.write.initialize([
        rewardToken.address,
        investToken.address,
        BigInt(targetRaise),
        BigInt(startsAt),
        BigInt(endsAt),
        BigInt(tgeTimestamp),
        BigInt(tgeReleasePercentage),
        BigInt(cliffTime),
        BigInt("0"),
        BigInt(rewardReleasePeriod),
        BigInt("0"),
        BigInt(withdrawPeriod),
        BigInt(pricePerToken),
      ]);
    } catch (err) {
      const revertMessage = extractRevertMessage(err);

      expect(revertMessage).to.equal("Invalid vesting period");
    }
  });

  it("Should throw an error when passing empty reward release period with monthly vesting method.", async function () {
    try {
      const altForge = await loadFixture(deployAltForgeFixer);
      const rewardToken = await loadFixture(deployRewardTokenFixer);
      const investToken = await loadFixture(deployInvestTokenFixer);

      await altForge.write.initialize([
        rewardToken.address,
        investToken.address,
        BigInt(targetRaise),
        BigInt(startsAt),
        BigInt(endsAt),
        BigInt(tgeTimestamp),
        BigInt(tgeReleasePercentage),
        BigInt(cliffTime),
        BigInt("0"),
        BigInt("0"),
        BigInt(totalVestingPeriod),
        BigInt(withdrawPeriod),
        BigInt(pricePerToken),
      ]);
    } catch (err) {
      const revertMessage = extractRevertMessage(err);
      expect(revertMessage).to.equal("Invalid vesting period");
    }
  });

  it("Should throw an error when passing empty vesting details.", async function () {
    try {
      const altForge = await loadFixture(deployAltForgeFixer);
      const rewardToken = await loadFixture(deployRewardTokenFixer);
      const investToken = await loadFixture(deployInvestTokenFixer);

      await altForge.write.initialize([
        rewardToken.address,
        investToken.address,
        BigInt(targetRaise),
        BigInt(startsAt),
        BigInt(endsAt),
        BigInt(tgeTimestamp),
        BigInt(tgeReleasePercentage),
        BigInt(cliffTime),
        BigInt("0"),
        BigInt("0"),
        BigInt("0"),
        BigInt(withdrawPeriod),
        BigInt(pricePerToken),
      ]);
    } catch (err) {
      const revertMessage = extractRevertMessage(err);
      expect(revertMessage).to.equal("Invalid vesting period");
    }
  });

  it("Campaign should run for 1 month.", async function () {
    const altForge = await loadFixture(deployAltForgeFixer);
    const rewardToken = await loadFixture(deployRewardTokenFixer);
    const investToken = await loadFixture(deployInvestTokenFixer);
    await altForge.write.initialize([
      rewardToken.address,
      investToken.address,
      BigInt(targetRaise),
      BigInt(startsAt),
      BigInt(endsAt),
      BigInt(tgeTimestamp),
      BigInt(tgeReleasePercentage),
      BigInt(cliffTime),
      BigInt(linearVestingPeriod),
      BigInt(rewardReleasePeriod),
      BigInt(totalVestingPeriod),
      BigInt(withdrawPeriod),
      BigInt(pricePerToken),
    ]);

    const StartsAt = new Date(Number(await altForge.read.startsAt()) * 1000);
    const EndsAt = new Date(Number(await altForge.read.endsAt()) * 1000);

    const timeDifference = EndsAt.getTime() - StartsAt.getTime();
    const daysInDifference = timeDifference / (1000 * 60 * 60 * 24);

    expect(daysInDifference).to.equal(31);
  });

  it("TGE timestamp should be equal to the time 5 days after the startTime.", async function () {
    const altForge = await loadFixture(deployAltForgeFixer);
    const rewardToken = await loadFixture(deployRewardTokenFixer);
    const investToken = await loadFixture(deployInvestTokenFixer);

    await altForge.write.initialize([
      rewardToken.address,
      investToken.address,
      BigInt(targetRaise),
      BigInt(startsAt),
      BigInt(endsAt),
      BigInt(tgeTimestamp),
      BigInt(tgeReleasePercentage),
      BigInt(cliffTime),
      BigInt(linearVestingPeriod),
      BigInt(rewardReleasePeriod),
      BigInt(totalVestingPeriod),
      BigInt(withdrawPeriod),
      BigInt(pricePerToken),
    ]);

    const StartsAt = new Date(Number(await altForge.read.startsAt()) * 1000);
    const vestingDetails = await altForge.read.vestingDetails();
    const TgeTimeStamp = new Date(Number(vestingDetails[0]) * 1000);

    const timeDifference = TgeTimeStamp.getTime() - StartsAt.getTime();

    const daysInDifference = timeDifference / (1000 * 60 * 60 * 24);

    expect(daysInDifference).to.equal(5);
  });

  it("Withdraw period timestamp should be equal to the time 3 days after the startTime.", async function () {
    const altForge = await loadFixture(deployAltForgeFixer);
    const rewardToken = await loadFixture(deployRewardTokenFixer);
    const investToken = await loadFixture(deployInvestTokenFixer);

    await altForge.write.initialize([
      rewardToken.address,
      investToken.address,
      BigInt(targetRaise),
      BigInt(startsAt),
      BigInt(endsAt),
      BigInt(tgeTimestamp),
      BigInt(tgeReleasePercentage),
      BigInt(cliffTime),
      BigInt(linearVestingPeriod),
      BigInt(rewardReleasePeriod),
      BigInt(totalVestingPeriod),
      BigInt(withdrawPeriod),
      BigInt(pricePerToken),
    ]);

    const StartsAt = new Date(Number(await altForge.read.startsAt()) * 1000);
    const vestingDetails = await altForge.read.vestingDetails();
    const withdrawTimestamp = new Date(Number(vestingDetails[6]) * 1000);
    const timeDifference = withdrawTimestamp.getTime() - StartsAt.getTime();
    const daysDifference = timeDifference / (1000 * 60 * 60 * 24);

    expect(daysDifference).to.equal(3);
  });

  it("Linear vesting period timestamp should be equal to the time 10 months after the startTime.", async function () {});

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
