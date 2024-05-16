import {
  NamedArtifactContractDeploymentFuture,
  buildModule,
} from "@nomicfoundation/ignition-core";

export default buildModule("AltForge", (m) => {
  const altForge: NamedArtifactContractDeploymentFuture<"AltForge"> =
    m.contract("AltForge");

  return {
    altForge,
  };
});
