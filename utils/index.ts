import { ethers } from "hardhat";

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

async function increaseBlockTimeStamp(seconds: number) {
  await ethers.provider.send("evm_increaseTime", [seconds]);
  await ethers.provider.send("evm_mine", []);
}

async function setNextBlockTimestamp(timestamp: number) {
  await ethers.provider.send("evm_setNextBlockTimestamp", [timestamp]);
  await ethers.provider.send("evm_mine", []);
}

export { extractRevertMessage, increaseBlockTimeStamp, setNextBlockTimestamp };
