import {
  NamedArtifactContractDeploymentFuture,
  buildModule,
} from "@nomicfoundation/ignition-core";

export default buildModule("RewardToken", (m) => {
  const rewardToken: NamedArtifactContractDeploymentFuture<"Reward"> =
    m.contract("Reward", [m.getParameter("initialSupply")]);

  return {
    rewardToken,
  };
});
