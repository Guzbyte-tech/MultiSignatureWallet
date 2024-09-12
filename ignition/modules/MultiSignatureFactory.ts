import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const MultiSignatureFactoryModule = buildModule("MultiSignatureFactoryModule", (m) => {
  
  const multiSigWallet = m.contract("MultiSignatureFactory");

  return { multiSigWallet };
});

export default MultiSignatureFactoryModule;