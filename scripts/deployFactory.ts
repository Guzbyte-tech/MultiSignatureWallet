
import { ethers } from "hardhat";
const hre = require("hardhat");

async function main() {

  const factoryAddr = "0x545B2619DeD5A084F505a86BD2d4CeCDe62224ea";
  const GTKtokenAddr = "0x804383944275A1Fa7B460286b5e1C4dbF1cE3921";

  // const walletFactory = await ethers.getContractAt("MultiSignatureFactory", factoryAddr);
  const [owner ] = await hre.ethers.getSigners();
  // const signers = [addr1, addr2, addr3];

  // const signers = [
  //   "0x37A7610c8A62F1CB7d3b80fF5ADD8953d106E6a0",
  //   "0x51816a1b29569fbB1a56825C375C254742a9c5e1",
  //   "0x06D97198756295A96C2158a23963306f507b2f69",
  //   "0x59351e2B3F85534A2e1BF92a2424F37E180919D9"
  // ]

  //Create MultiSignature Wallet
  // const createWallet = await walletFactory.createMultisigWallet(3, signers);
  // const wallet = await createWallet.wait();
  // console.log("Create MultiSig Clone:", wallet)
  // const walletClone = await walletFactory.getMultiSigClones();
  // console.log("New Wallet clone addresses: ", walletClone);

  //Interact with One Multisig Wallet.
  // const walletClone1 = walletClone[0];
  const walletClone1 = "0xc56345c0E430B949F21165B33E1a7970fe0EBa58";
  const sigWallet = await ethers.getContractAt("MultiSignature", walletClone1);

  //Transfer funds from GTK ERC20 token to clone contract first
  // const gtkToken = await ethers.getContractAt("GTK", GTKtokenAddr);
  // const amountToTransfer_ = ethers.parseUnits("5", 18);
  // const trToken = await gtkToken.transfer(walletClone1, amountToTransfer_);
  // trToken.wait();
  // console.log("Transfer some GTK ERC Token to wallet:", trToken);

  //Interact with transfer function.
  const amountToTransfer = ethers.parseUnits("1", 18);
  const trf = await sigWallet.transfer(amountToTransfer, "0x06D97198756295A96C2158a23963306f507b2f69", GTKtokenAddr);
  console.log("Transfer from multisig wallet initiated: ", trf);

  //Interact with the approveTx in multi-signature wallet



}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
