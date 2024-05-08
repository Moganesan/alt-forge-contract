import AltForgeModule from "../ignition/AltForgeModule";
import { ignition } from "hardhat";

describe("Alt Forge", function () {
  it("Should deploy with empty vesting details", async function () {
    const { altForge } = await ignition.deploy(AltForgeModule);

    console.log(altForge);
  });
});
