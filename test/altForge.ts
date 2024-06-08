import AltForgeModule from "../ignition/AltForgeModule";
import InvestTokenModule from "../ignition/InvestTokenModule";
import RewardTokenModule from "../ignition/rewardTokenModule";
import { ignition, viem, userConfig, ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { parseEther, zeroAddress } from "viem";
import { expect } from "chai";
import {
  extractRevertMessage,
  setNextBlockTimestamp,
  resetBlockTimestamp,
  daysToSeconds,
} from "../utils/index";
import { TransactionTypes, formatEther } from "ethers/lib/utils";
import { reset, time } from "@nomicfoundation/hardhat-network-helpers";

// setting startsAt current timestamp
const startsAt = Math.round(new Date().getTime() / 1000);

const currentTime = new Date();

// setting endsAt for after one month
// setting endsAt date for adding 31days with current date

currentTime.setMonth(new Date().getMonth() + 1);

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

// linear vesting period startsAt
const linearVestingStartsAt =
  new Date(tgeTimestamp * 1000).getTime() / 1000 + 1;

// linear vesting period endsAt
let linearVestingEndsAt: any = new Date(linearVestingStartsAt * 1000);
linearVestingEndsAt.setDate(
  new Date(linearVestingStartsAt * 1000).getDate() + 365
);
linearVestingEndsAt = linearVestingEndsAt.getTime() / 1000;

// reward release period in months
// note: if linear vesting period is set reward release period not needed
const rewardReleasePeriod = 30;

// total vesting period in start and end time
// note: if linear vesting period is set total vesting period not needed
const vestingPeriodStartsAt = new Date(tgeTimestamp * 1000).getTime() / 1000;
let vestingPeriodEndsAt: any = new Date(vestingPeriodStartsAt * 1000);
vestingPeriodEndsAt.setDate(vestingPeriodEndsAt.getDate() + 365);
vestingPeriodEndsAt = vestingPeriodEndsAt.getTime() / 1000;

// withdraw period in days
const withdrawPeriod = 3;

// price per token
const pricePerToken = parseEther("0.1");

const deployAltForgeFixer = async () => {
  const [owner, account2] = await ethers.getSigners();
  const { altForge } = await ignition.deploy(AltForgeModule, {
    defaultSender: owner.address,
  });
  return altForge;
};

const deployAltForgeFixerAcc2 = async () => {
  const [owner, account2] = await ethers.getSigners();
  const { altForge } = await ignition.deploy(AltForgeModule, {
    defaultSender: account2.address,
  });
  return altForge;
};

const deployRewardTokenFixer = async () => {
  const [owner] = await ethers.getSigners();
  const { rewardToken } = await ignition.deploy(RewardTokenModule, {
    defaultSender: owner.address,
    parameters: {
      RewardToken: {
        initialSupply: parseEther("1000000"),
      },
    },
  });

  return rewardToken;
};

const deployRewardTokenFixerAcc2 = async () => {
  const [owner, account2] = await ethers.getSigners();
  const { rewardToken } = await ignition.deploy(RewardTokenModule, {
    defaultSender: account2.address,
    parameters: {
      RewardToken: {
        initialSupply: parseEther("1000000"),
      },
    },
  });
  return rewardToken;
};

const deployInvestTokenFixer = async () => {
  const [owner, account2] = await ethers.getSigners();
  const { investToken } = await ignition.deploy(InvestTokenModule, {
    defaultSender: owner.address,
    parameters: {
      InvestToken: {
        initialSupply: parseEther("1000000"),
      },
    },
  });

  return investToken;
};

const deployInvestTokenFixerAcc2 = async () => {
  const [owner, account2] = await ethers.getSigners();
  const { investToken } = await ignition.deploy(InvestTokenModule, {
    defaultSender: account2.address,
    parameters: {
      InvestToken: {
        initialSupply: parseEther("1000000"),
      },
    },
  });
  return investToken;
};

describe("Initialize", async function () {
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
        BigInt(linearVestingStartsAt),
        BigInt(linearVestingEndsAt),
        BigInt(rewardReleasePeriod),
        BigInt(vestingPeriodStartsAt),
        BigInt(vestingPeriodEndsAt),
        BigInt(withdrawPeriod),
        BigInt(pricePerToken),
      ]);
      throw new Error("Expected error was not thrown");
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
        BigInt(linearVestingStartsAt),
        BigInt(linearVestingEndsAt),
        BigInt(rewardReleasePeriod),
        BigInt(vestingPeriodStartsAt),
        BigInt(vestingPeriodEndsAt),
        BigInt(withdrawPeriod),
        BigInt(pricePerToken),
      ]);

      throw new Error("Expected error was not thrown");
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
        BigInt(endsAt),
        BigInt(endsAt),
        BigInt(tgeTimestamp),
        BigInt(tgeReleasePercentage),
        BigInt(cliffTime),
        BigInt(linearVestingStartsAt),
        BigInt(linearVestingEndsAt),
        BigInt(rewardReleasePeriod),
        BigInt(vestingPeriodStartsAt),
        BigInt(vestingPeriodEndsAt),
        BigInt(withdrawPeriod),
        BigInt(pricePerToken),
      ]);
      throw new Error("Expected error was not thrown");
    } catch (err) {
      const revertMessage = extractRevertMessage(err);

      expect(revertMessage).to.equal("Invalid campaign time");
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
        BigInt(linearVestingStartsAt),
        BigInt(linearVestingEndsAt),
        BigInt(rewardReleasePeriod),
        BigInt(vestingPeriodStartsAt),
        BigInt(vestingPeriodEndsAt),
        BigInt(withdrawPeriod),
        BigInt(pricePerToken),
      ]);
      throw new Error("Expected error was not thrown");
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
        BigInt(linearVestingStartsAt),
        BigInt(linearVestingEndsAt),
        BigInt(rewardReleasePeriod),
        BigInt(vestingPeriodStartsAt),
        BigInt(vestingPeriodEndsAt),
        BigInt(withdrawPeriod),
        BigInt(pricePerToken),
      ]);
      throw new Error("Expected error was not thrown");
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
        BigInt(linearVestingStartsAt),
        BigInt(linearVestingEndsAt),
        BigInt(rewardReleasePeriod),
        BigInt(vestingPeriodStartsAt),
        BigInt(vestingPeriodEndsAt),
        BigInt(withdrawPeriod),
        BigInt(pricePerToken),
      ]);
      throw new Error("Expected error was not thrown");
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
        BigInt(linearVestingStartsAt),
        BigInt(linearVestingEndsAt),
        BigInt(rewardReleasePeriod),
        BigInt(vestingPeriodStartsAt),
        BigInt(vestingPeriodEndsAt),
        BigInt(BigInt("0")),
        BigInt(pricePerToken),
      ]);
      throw new Error("Expected error was not thrown");
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
        BigInt(linearVestingStartsAt),
        BigInt(linearVestingEndsAt),
        BigInt(rewardReleasePeriod),
        BigInt(vestingPeriodStartsAt),
        BigInt(vestingPeriodEndsAt),
        BigInt(withdrawPeriod),
        BigInt("0"),
      ]);
      throw new Error("Expected error was not thrown");
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
        BigInt(linearVestingEndsAt),
        BigInt(rewardReleasePeriod),
        BigInt("0"),
        BigInt(vestingPeriodEndsAt),
        BigInt(withdrawPeriod),
        BigInt(pricePerToken),
      ]);
      throw new Error("Expected error was not thrown");
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
        BigInt("0"),
        BigInt(vestingPeriodStartsAt),
        BigInt(vestingPeriodEndsAt),
        BigInt(withdrawPeriod),
        BigInt(pricePerToken),
      ]);
      throw new Error("Expected error was not thrown");
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
        BigInt("0"),
        BigInt("0"),
        BigInt(withdrawPeriod),
        BigInt(pricePerToken),
      ]);

      throw new Error("Expected error was not thrown");
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
      BigInt(linearVestingStartsAt),
      BigInt(linearVestingEndsAt),
      BigInt(rewardReleasePeriod),
      BigInt("0"),
      BigInt("0"),
      BigInt(withdrawPeriod),
      BigInt(pricePerToken),
    ]);

    const StartsAt = new Date(Number(await altForge.read.startsAt()) * 1000);
    const EndsAt = new Date(Number(await altForge.read.endsAt()) * 1000);

    const timeDifference = EndsAt.getTime() - StartsAt.getTime();
    const daysInDifference = timeDifference / (1000 * 60 * 60 * 24);

    expect(daysInDifference == 30 || daysInDifference == 31).to.be.true;
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
      BigInt(linearVestingStartsAt),
      BigInt(linearVestingEndsAt),
      BigInt(rewardReleasePeriod),
      BigInt(vestingPeriodStartsAt),
      BigInt(vestingPeriodEndsAt),
      BigInt(withdrawPeriod),
      BigInt(pricePerToken),
    ]);

    const StartsAt = new Date(Number(await altForge.read.startsAt()) * 1000);
    const vestingDetails = await altForge.read.vestingDetails();
    const TgeTimeStamp = new Date(Number(vestingDetails[0]) * 1000);

    const timeDifference = TgeTimeStamp.getTime() - StartsAt.getTime();

    const daysInDifference = timeDifference / (1000 * 60 * 60 * 24);

    expect(daysInDifference).equal(5);
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
      BigInt(linearVestingStartsAt),
      BigInt(linearVestingEndsAt),
      BigInt(rewardReleasePeriod),
      BigInt(vestingPeriodStartsAt),
      BigInt(vestingPeriodEndsAt),
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

  it("Linear vesting period timestamp should be equal to the time 365 after the startTime.", async function () {
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
      BigInt(linearVestingStartsAt),
      BigInt(linearVestingEndsAt),
      BigInt(rewardReleasePeriod),
      BigInt(vestingPeriodStartsAt),
      BigInt(vestingPeriodEndsAt),
      BigInt(withdrawPeriod),
      BigInt(pricePerToken),
    ]);

    const vestingDetails = await altForge.read.vestingDetails();
    const linearVestingStartTime =
      new Date(Number(vestingDetails[3].startsAt)).getTime() * 1000;
    const linearVestingEndTime =
      new Date(Number(vestingDetails[3].endsAt)).getTime() * 1000;

    const timeDifference = linearVestingEndTime - linearVestingStartTime;
    const daysDifference = timeDifference / (1000 * 60 * 60 * 24);
    expect(daysDifference).to.equal(365);
  });
});

describe("Invest", async function () {
  it("Should be able to invest only having enough balance to invest.", async function () {
    const altForge = await loadFixture(deployAltForgeFixer);
    const rewardToken = await loadFixture(deployRewardTokenFixer);
    const investToken = await loadFixture(deployInvestTokenFixer);
    const [owner] = await ethers.getSigners();
    const signerAddress = (await owner.getAddress()) as `0x${string}`;
    const investAmount = parseEther("1000");

    await altForge.write.initialize([
      rewardToken.address,
      investToken.address,
      BigInt(targetRaise),
      BigInt(startsAt),
      BigInt(endsAt),
      BigInt(tgeTimestamp),
      BigInt(tgeReleasePercentage),
      BigInt(cliffTime),
      BigInt(linearVestingStartsAt),
      BigInt(linearVestingEndsAt),
      BigInt(rewardReleasePeriod),
      BigInt(vestingPeriodStartsAt),
      BigInt(vestingPeriodEndsAt),
      BigInt(withdrawPeriod),
      BigInt(pricePerToken),
    ]);

    // check allowance
    const allowance = await investToken.read.allowance([
      signerAddress,
      altForge.address,
    ]);

    if (Number(allowance) == 0) {
      await investToken.write.approve([altForge.address, investAmount]);
    }

    await altForge.write.invest([investAmount]);

    const investedAmount = await altForge.read.investors([signerAddress]);

    expect(formatEther(investedAmount)).equals(formatEther(investAmount));
  });

  it("Should throw an error when trying to invest with 0 token balance.", async function () {
    const altForge = await loadFixture(deployAltForgeFixer);
    const rewardToken = await loadFixture(deployRewardTokenFixerAcc2);
    const investToken = await loadFixture(deployInvestTokenFixerAcc2);
    const [owner, account2] = await ethers.getSigners();
    const signerAddress = (await owner.getAddress()) as `0x${string}`;
    const investAmount = parseEther("1000");
    try {
      await altForge.write.initialize([
        rewardToken.address,
        investToken.address,
        BigInt(targetRaise),
        BigInt(startsAt),
        BigInt(endsAt),
        BigInt(tgeTimestamp),
        BigInt(tgeReleasePercentage),
        BigInt(cliffTime),
        BigInt(linearVestingStartsAt),
        BigInt(linearVestingEndsAt),
        BigInt(rewardReleasePeriod),
        BigInt(vestingPeriodStartsAt),
        BigInt(vestingPeriodEndsAt),
        BigInt(withdrawPeriod),
        BigInt(pricePerToken),
      ]);

      // check allowance
      const allowance = await investToken.read.allowance([
        signerAddress,
        altForge.address,
      ]);

      if (Number(allowance) == 0) {
        await investToken.write.approve([altForge.address, investAmount]);
      }
      await altForge.write.invest([investAmount]);
      throw new Error("Expected error was not thrown");
    } catch (err) {
      const revertMessage = extractRevertMessage(err);
      expect(revertMessage).to.equal("Insufficient Balance");
    }
  });

  it("Should throw an error when trying to invest with an insufficient balance, which is passed as _amount parameter.", async function () {
    const altForgeContract = await loadFixture(deployAltForgeFixer);
    const rewardTokenContract = await loadFixture(deployRewardTokenFixerAcc2);
    const investTokenContract = await loadFixture(deployInvestTokenFixerAcc2);
    const [owner, account2] = await ethers.getSigners();
    const signerAddress = (await owner.getAddress()) as `0x${string}`;
    const account2Address = (await account2.getAddress()) as `0x${string}`;
    const investAmount = parseEther("100");

    try {
      await altForgeContract.write.initialize([
        rewardTokenContract.address,
        investTokenContract.address,
        BigInt(targetRaise),
        BigInt(startsAt),
        BigInt(endsAt),
        BigInt(tgeTimestamp),
        BigInt(tgeReleasePercentage),
        BigInt(cliffTime),
        BigInt(linearVestingStartsAt),
        BigInt(linearVestingEndsAt),
        BigInt(rewardReleasePeriod),
        BigInt(vestingPeriodStartsAt),
        BigInt(vestingPeriodEndsAt),
        BigInt(withdrawPeriod),
        BigInt(pricePerToken),
      ]);

      // check allowance
      const allowance = await investTokenContract.read.allowance([
        signerAddress,
        altForgeContract.address,
      ]);

      if (Number(allowance) == 0) {
        await investTokenContract.write.approve(
          [altForgeContract.address, investAmount],
          { account: signerAddress }
        );
      }

      // transferring insufficient tokens
      await investTokenContract.write.transfer(
        [signerAddress, parseEther("10")],
        {
          account: account2Address,
        }
      );

      // call invest function
      await altForgeContract.write.invest([investAmount], {
        account: signerAddress,
      });

      throw new Error("Expected error was not thrown");
    } catch (err) {
      const revertMessage = extractRevertMessage(err);
      expect(revertMessage).to.equal("Insufficient Balance");
    }
  });

  it("Should throw an error when attempt to invest in a project that has already been invested.", async function () {
    const altForge = await loadFixture(deployAltForgeFixer);
    const rewardToken = await loadFixture(deployRewardTokenFixer);
    const investToken = await loadFixture(deployInvestTokenFixer);
    const [owner, account2] = await await ethers.getSigners();
    const signerAddress = (await owner.getAddress()) as `0x${string}`;
    const account2Address = (await account2.getAddress()) as `0x${string}`;
    const investAmount = parseEther("100");

    try {
      await altForge.write.initialize([
        rewardToken.address,
        investToken.address,
        BigInt(targetRaise),
        BigInt(startsAt),
        BigInt(endsAt),
        BigInt(tgeTimestamp),
        BigInt(tgeReleasePercentage),
        BigInt(cliffTime),
        BigInt(linearVestingStartsAt),
        BigInt(linearVestingEndsAt),
        BigInt(rewardReleasePeriod),
        BigInt(vestingPeriodStartsAt),
        BigInt(vestingPeriodEndsAt),
        BigInt(withdrawPeriod),
        BigInt(pricePerToken),
      ]);

      // check allowance
      const allowance = await investToken.read.allowance([
        signerAddress,
        altForge.address,
      ]);

      if (Number(allowance) == 0) {
        await investToken.write.approve(
          [altForge.address, parseEther("1000")],
          {
            account: signerAddress,
          }
        );
      }

      // call invest function
      await altForge.write.invest([investAmount], {
        account: signerAddress,
      });

      // call invest function again
      await altForge.write.invest([investAmount], { account: signerAddress });

      throw new Error("Expected error was not thrown");
    } catch (err) {
      const revertMessage = extractRevertMessage(err);
      expect(revertMessage).to.equals("Already Invested");
    }
  });
});

describe("Withdraw", async function () {
  it("Should throw an error when trying to withdraw without investing.", async function () {
    const altForge = await loadFixture(deployAltForgeFixer);
    const rewardToken = await loadFixture(deployRewardTokenFixer);
    const investToken = await loadFixture(deployInvestTokenFixer);

    try {
      await altForge.write.initialize([
        rewardToken.address,
        investToken.address,
        BigInt(targetRaise),
        BigInt(startsAt),
        BigInt(endsAt),
        BigInt(tgeTimestamp),
        BigInt(tgeReleasePercentage),
        BigInt(cliffTime),
        BigInt(linearVestingStartsAt),
        BigInt(linearVestingEndsAt),
        BigInt(rewardReleasePeriod),
        BigInt(vestingPeriodStartsAt),
        BigInt(vestingPeriodEndsAt),
        BigInt(withdrawPeriod),
        BigInt(pricePerToken),
      ]);
      await altForge.write.withdraw();
      throw new Error("Expected error was not thrown");
    } catch (err) {
      const revertMessage = extractRevertMessage(err);
      expect(revertMessage).to.equals("Not Invested");
    }
  });

  // it("Should throw an error when attempt to call withdraw function without tge happened.", async function () {
  //   const altForge = await loadFixture(deployAltForgeFixer);
  //   const rewardToken = await loadFixture(deployRewardTokenFixer);
  //   const investToken = await loadFixture(deployInvestTokenFixer);
  //   const investAmount = parseEther("1000");
  //   const [owner, account2] = await ethers.getSigners();
  //   const signerAddress = (await owner.getAddress()) as `0x${string}`;

  //   try {
  //     await altForge.write.initialize([
  //       rewardToken.address,
  //       investToken.address,
  //       BigInt(targetRaise),
  //       BigInt(startsAt),
  //       BigInt(endsAt),
  //       BigInt(tgeTimestamp),
  //       BigInt(tgeReleasePercentage),
  //       BigInt(cliffTime),
  //       BigInt(linearVestingStartsAt),
  //       BigInt(linearVestingEndsAt),
  //       BigInt(rewardReleasePeriod),
  //       BigInt(vestingPeriodStartsAt),
  //       BigInt(vestingPeriodEndsAt),
  //       BigInt(withdrawPeriod),
  //       BigInt(pricePerToken),
  //     ]);

  //     // transfering some reward tokens to contract
  //     rewardToken.write.transfer([altForge.address, parseEther("100000")]);

  //     // check allowance
  //     const allowance = await investToken.read.allowance([
  //       signerAddress,
  //       altForge.address,
  //     ]);

  //     if (Number(allowance) == 0) {
  //       await investToken.write.approve([altForge.address, investAmount]);
  //     }
  //     await altForge.write.invest([investAmount]);
  //     await altForge.write.withdraw();
  //     throw new Error("Expected error was not thrown");
  //   } catch (err) {
  //     const revertMessage = extractRevertMessage(err);
  //     expect(revertMessage).to.equals("Token not generated");
  //   }
  // });

  it("Should throw an error when attempt to call withdraw function after withdraw period ends.", async function () {
    const altForge = await loadFixture(deployAltForgeFixer);
    const rewardToken = await loadFixture(deployRewardTokenFixer);
    const investToken = await loadFixture(deployInvestTokenFixer);
    const investAmount = parseEther("1000");
    const [owner, account2] = await ethers.getSigners();
    const signerAddress = (await owner.getAddress()) as `0x${string}`;

    try {
      await altForge.write.initialize([
        rewardToken.address,
        investToken.address,
        BigInt(targetRaise),
        BigInt(startsAt),
        BigInt(endsAt),
        BigInt(tgeTimestamp),
        BigInt(tgeReleasePercentage),
        BigInt(cliffTime),
        BigInt(linearVestingStartsAt),
        BigInt(linearVestingEndsAt),
        BigInt(rewardReleasePeriod),
        BigInt(vestingPeriodStartsAt),
        BigInt(vestingPeriodEndsAt),
        BigInt(withdrawPeriod),
        BigInt(pricePerToken),
      ]);

      // transfering some reward tokens to contract
      rewardToken.write.transfer([altForge.address, parseEther("100000")]);

      // check allowance
      const allowance = await investToken.read.allowance([
        signerAddress,
        altForge.address,
      ]);

      if (Number(allowance) == 0) {
        await investToken.write.approve([altForge.address, investAmount]);
      }
      await altForge.write.invest([investAmount]);

      // increase blocktime by adding withdraw period with startTime
      const afterWithdrawPeriodEnds =
        (await ethers.provider.getBlock("latest")).timestamp + 9 * 24 * 60 * 60;

      await setNextBlockTimestamp(afterWithdrawPeriodEnds);

      await rewardToken.write.approve([altForge.address, investAmount]);

      await altForge.write.withdraw();

      await resetBlockTimestamp();

      throw new Error("Expected error was not thrown");
    } catch (err) {
      const revertMessage = extractRevertMessage(err);
      expect(revertMessage).to.equals("Withdraw Period Ends.");
    }
  });

  it("The investor should be able to get their invested token back to their wallet address.", async function () {
    const altForge = await loadFixture(deployAltForgeFixer);
    const rewardToken = await loadFixture(deployRewardTokenFixer);
    const investToken = await loadFixture(deployInvestTokenFixer);
    const investAmount = parseEther("1000");
    const [owner, account2] = await ethers.getSigners();
    const signerAddress = (await owner.getAddress()) as `0x${string}`;

    await altForge.write.initialize([
      rewardToken.address,
      investToken.address,
      BigInt(targetRaise),
      BigInt(startsAt),
      BigInt(endsAt),
      BigInt(tgeTimestamp),
      BigInt(tgeReleasePercentage),
      BigInt(cliffTime),
      BigInt(linearVestingStartsAt),
      BigInt(linearVestingEndsAt),
      BigInt(rewardReleasePeriod),
      BigInt(vestingPeriodStartsAt),
      BigInt(vestingPeriodEndsAt),
      BigInt(withdrawPeriod),
      BigInt(pricePerToken),
    ]);

    // check allowance
    const allowance = await investToken.read.allowance([
      signerAddress,
      altForge.address,
    ]);

    if (Number(allowance) == 0) {
      await investToken.write.approve([altForge.address, investAmount]);
    }
    await altForge.write.invest([investAmount], { account: signerAddress });

    await rewardToken.write.approve([altForge.address, investAmount]);

    await altForge.write.withdraw();

    const balance = await investToken.read.balanceOf([signerAddress]);
    expect(formatEther(balance)).to.equal(formatEther(parseEther("1000000")));
  });
});

describe("Claim Token", async function () {
  it("It should throw an error when attempt to call claim token function without invested.", async function () {
    const altForge = await loadFixture(deployAltForgeFixer);
    const rewardToken = await loadFixture(deployRewardTokenFixer);
    const investToken = await loadFixture(deployInvestTokenFixer);
    const [owner, account2] = await ethers.getSigners();
    const signerAddress = (await owner.getAddress()) as `0x${string}`;

    try {
      await altForge.write.initialize([
        rewardToken.address,
        investToken.address,
        BigInt(targetRaise),
        BigInt(startsAt),
        BigInt(endsAt),
        BigInt(tgeTimestamp),
        BigInt(tgeReleasePercentage),
        BigInt(cliffTime),
        BigInt(linearVestingStartsAt),
        BigInt(linearVestingEndsAt),
        BigInt(rewardReleasePeriod),
        BigInt(vestingPeriodStartsAt),
        BigInt(vestingPeriodEndsAt),
        BigInt(withdrawPeriod),
        BigInt(pricePerToken),
      ]);

      await altForge.write.claimToken();
      throw new Error("Expected error was not thrown");
    } catch (err) {
      const revertMessage = extractRevertMessage(err);
      expect(revertMessage).to.equals("Not Invested");
    }
  });
  it("It should throw an error when attemp to call claim token function without tge occured.", async function () {
    const altForge = await loadFixture(deployAltForgeFixer);
    const rewardToken = await loadFixture(deployRewardTokenFixer);
    const investToken = await loadFixture(deployInvestTokenFixer);
    const investAmount = parseEther("1000");
    const [owner, account2] = await ethers.getSigners();
    const signerAddress = (await owner.getAddress()) as `0x${string}`;

    try {
      await altForge.write.initialize([
        rewardToken.address,
        investToken.address,
        BigInt(targetRaise),
        BigInt(startsAt),
        BigInt(endsAt),
        BigInt(tgeTimestamp),
        BigInt(tgeReleasePercentage),
        BigInt(cliffTime),
        BigInt(linearVestingStartsAt),
        BigInt(linearVestingEndsAt),
        BigInt(rewardReleasePeriod),
        BigInt(vestingPeriodStartsAt),
        BigInt(vestingPeriodEndsAt),
        BigInt(withdrawPeriod),
        BigInt(pricePerToken),
      ]);

      // check allowance
      const allowance = await investToken.read.allowance([
        signerAddress,
        altForge.address,
      ]);

      if (Number(allowance) == 0) {
        await investToken.write.approve([altForge.address, investAmount]);
      }

      await altForge.write.invest([investAmount]);

      await altForge.write.claimToken();
      throw new Error("Expected error was not thrown");
    } catch (err) {
      const revertMessage = extractRevertMessage(err);
      expect(revertMessage).to.equals("Token not generated");
    }
  });
  it("It should throw an error when attempt to call claim token function without claim period occured.", async function () {
    const altForge = await loadFixture(deployAltForgeFixer);
    const rewardToken = await loadFixture(deployRewardTokenFixer);
    const investToken = await loadFixture(deployInvestTokenFixer);
    const investAmount = parseEther("1000");
    const [owner, account2] = await ethers.getSigners();
    const signerAddress = (await owner.getAddress()) as `0x${string}`;

    try {
      await altForge.write.initialize([
        rewardToken.address,
        investToken.address,
        BigInt(targetRaise),
        BigInt(startsAt),
        BigInt(endsAt),
        BigInt(tgeTimestamp),
        BigInt(tgeReleasePercentage),
        BigInt(cliffTime),
        BigInt(linearVestingStartsAt),
        BigInt(linearVestingEndsAt),
        BigInt(rewardReleasePeriod),
        BigInt(vestingPeriodStartsAt),
        BigInt(vestingPeriodEndsAt),
        BigInt(withdrawPeriod),
        BigInt(pricePerToken),
      ]);

      // check allowance
      const allowance = await investToken.read.allowance([
        signerAddress,
        altForge.address,
      ]);

      if (Number(allowance) == 0) {
        await investToken.write.approve([altForge.address, investAmount]);
      }

      await altForge.write.invest([investAmount]);

      await altForge.write.claimToken();
      throw new Error("Expected error was not thrown");
    } catch (err) {
      const revertMessage = extractRevertMessage(err);
      expect(revertMessage).to.equals("Token not generated");
    }
  });

  it("It should throw an error when attempt to claim tokens without cliff period occured.", async function () {
    const altForge = await loadFixture(deployAltForgeFixer);
    const rewardToken = await loadFixture(deployRewardTokenFixer);
    const investToken = await loadFixture(deployInvestTokenFixer);
    const investAmount = parseEther("1000");
    const [owner, account2] = await ethers.getSigners();
    const signerAddress = (await owner.getAddress()) as `0x${string}`;

    try {
      await altForge.write.initialize([
        rewardToken.address,
        investToken.address,
        BigInt(targetRaise),
        BigInt(startsAt),
        BigInt(endsAt),
        BigInt(tgeTimestamp),
        BigInt(tgeReleasePercentage),
        BigInt(cliffTime),
        BigInt(linearVestingStartsAt),
        BigInt(linearVestingEndsAt),
        BigInt(rewardReleasePeriod),
        BigInt(vestingPeriodStartsAt),
        BigInt(vestingPeriodEndsAt),
        BigInt(withdrawPeriod),
        BigInt(pricePerToken),
      ]);

      // check allowance
      const allowance = await investToken.read.allowance([
        signerAddress,
        altForge.address,
      ]);

      if (Number(allowance) == 0) {
        await investToken.write.approve([altForge.address, investAmount]);
      }
      await altForge.write.invest([investAmount]);

      const timestampAfterTokenGenerated =
        (await ethers.provider.getBlock("latest")).timestamp + 6 * 24 * 60 * 60;

      await setNextBlockTimestamp(timestampAfterTokenGenerated);

      await altForge.write.claimToken();

      await resetBlockTimestamp();
      throw new Error("Expected error was not thrown");
    } catch (err) {
      const revertMessage = extractRevertMessage(err);
      expect(revertMessage).to.equals("Cliff period not allowed to claim");
    }
  });
  it("It should throw an error when attemp to withdraw  after all the tokens are claimed.", async function () {
    const altForge = await loadFixture(deployAltForgeFixer);
    const rewardToken = await loadFixture(deployRewardTokenFixer);
    const investToken = await loadFixture(deployInvestTokenFixer);
    const investAmount = parseEther("1000");
    const [owner, account2] = await ethers.getSigners();
    const signerAddress = (await owner.getAddress()) as `0x${string}`;

    try {
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
        BigInt(rewardReleasePeriod),
        BigInt(vestingPeriodStartsAt),
        BigInt(vestingPeriodEndsAt),
        BigInt(withdrawPeriod),
        BigInt(pricePerToken),
      ]);

      // transfering some reward tokens to contract
      rewardToken.write.transfer([altForge.address, parseEther("100000")]);

      // check allowance
      const allowance = await investToken.read.allowance([
        signerAddress,
        altForge.address,
      ]);

      if (Number(allowance) == 0) {
        await investToken.write.approve([altForge.address, investAmount]);
      }

      await altForge.write.invest([investAmount]);

      const totalReleaseIterations = await altForge.read.vestingDetails();

      const timeAfterCliffTime = daysToSeconds(cliffTime + 5) + startsAt;

      await setNextBlockTimestamp(timeAfterCliffTime);
      for (let i = 1; i <= Number(totalReleaseIterations[7]) + 1; i++) {
        const vestingDetails = await altForge.read.vestingDetails();
        const rewardReleasePeriod = Number(vestingDetails[0]);

        await setNextBlockTimestamp(
          Number(rewardReleasePeriod) * i +
            (
              await ethers.provider.getBlock("latest")
            ).timestamp
        );
        await altForge.write.claimToken();
      }
      await resetBlockTimestamp();
    } catch (err) {
      const revertMessage = extractRevertMessage(err);
      expect(revertMessage).to.equals("Their is no tokens to claim");
    }
  });

  it("It should throw an error when trying to claim without the release period is not reached.", async function () {
    const altForge = await loadFixture(deployAltForgeFixer);
    const rewardToken = await loadFixture(deployRewardTokenFixer);
    const investToken = await loadFixture(deployInvestTokenFixer);
    const investAmount = parseEther("1000");
    const [owner, account2] = await ethers.getSigners();
    const signerAddress = (await owner.getAddress()) as `0x${string}`;

    try {
      await setNextBlockTimestamp(daysToSeconds(1) + startsAt);
      console.log(
        "Current Time Stamp",
        (await ethers.provider.getBlock("latest")).timestamp
      );

      console.log("Ends At", endsAt);
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
        BigInt(rewardReleasePeriod + 10),
        BigInt(vestingPeriodStartsAt),
        BigInt(vestingPeriodEndsAt),
        BigInt(withdrawPeriod),
        BigInt(pricePerToken),
      ]);

      // transfering some reward tokens to contract
      rewardToken.write.transfer([altForge.address, parseEther("100000")]);

      // check allowance
      const allowance = await investToken.read.allowance([
        signerAddress,
        altForge.address,
      ]);

      if (Number(allowance) == 0) {
        await investToken.write.approve([altForge.address, investAmount]);
      }

      await altForge.write.invest([investAmount]);

      const timeAfterCliffTime = daysToSeconds(cliffTime + 5) + startsAt;

      await setNextBlockTimestamp(timeAfterCliffTime);

      await altForge.write.claimToken();
    } catch (err) {
      const revertMessage = extractRevertMessage(err);
      expect(revertMessage).to.equals("Release period not yet reached");
    }
  });
});
