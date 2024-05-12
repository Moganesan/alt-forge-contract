import AltForgeModule from "../ignition/AltForgeModule";
import InvestTokenModule from "../ignition/InvestTokenModule";
import RewardTokenModule from "../ignition/rewardTokenModule";
import { ignition } from "hardhat";
import { parseEther } from "viem";

describe("Alt Forge", function () {
  it("Should throw an error when passing empty project token address.", async function () {
    const { altForge } = await ignition.deploy(AltForgeModule);
    const { investToken } = await ignition.deploy(InvestTokenModule);
    const { rewardToken } = await ignition.deploy(RewardTokenModule);

    // setting startsAt current timestamp
    const startsAt = Math.round(new Date().getTime());

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

    altForge.write.initialize(
      rewardToken.address,
      investToken.address,
      targetRaise,
      startsAt,
      endsAt,
      tgeTimestamp,
      tgeReleasePercentage,
      cliffTime,
      linearVestingPeriod,
      rewardReleasePeriod,
      totalVestingPeriod,
      withdrawPeriod,
      pricePerToken
    );
  });
});
