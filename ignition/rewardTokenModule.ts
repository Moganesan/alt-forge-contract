import {
  NamedArtifactContractDeploymentFuture,
  buildModule,
} from "@nomicfoundation/ignition-core";
import { parseEther } from "viem";

export default buildModule("TestTokens", (m) => {
  const rewardToken: NamedArtifactContractDeploymentFuture<"Reward"> =
    m.contract("Reward", [m.getParameter("initialSupply")]);

  return {
    rewardToken,
  };
});
