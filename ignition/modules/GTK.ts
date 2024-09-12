import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const GTKModule = buildModule("MultiSignatureFactoryModule", (m) => {
  
  const gtkToken = m.contract("GTK");

  return { gtkToken };
});

export default GTKModule;