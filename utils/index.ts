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

async function resetBlockTimestamp() {
  const date = new Date().getTime();
  await ethers.provider.send("evm_setNextBlockTimestamp", [date]);
  await ethers.provider.send("evm_mine", []);
}

function daysInCurrentMonth() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // getMonth() returns month index starting from 0 for January

  // Create a new date for the first day of the next month
  const nextMonth: any = new Date(currentYear, currentMonth + 1, 1);

  // Set the day to 0, which gives the last day of the current month
  const lastDayOfCurrentMonth = new Date(nextMonth - 1).getDate();

  return lastDayOfCurrentMonth;
}

function daysToSeconds(days: number) {
  return days * 24 * 60 * 60;
}

export {
  extractRevertMessage,
  increaseBlockTimeStamp,
  setNextBlockTimestamp,
  daysInCurrentMonth,
  resetBlockTimestamp,
  daysToSeconds,
};
