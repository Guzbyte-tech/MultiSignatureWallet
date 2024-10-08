
import { ethers } from "hardhat";
import { token } from "../typechain-types/@openzeppelin/contracts";
const hre = require("hardhat");

async function main() {

  const factoryAddr = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  const GTKtokenAddr = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  const walletFactory = await ethers.getContractAt("MultiSignatureFactory", factoryAddr);
  const [owner, addr1, addr2, addr3, addr4, addr5, addr6] = await hre.ethers.getSigners();
  const signers = [addr1.address, addr2.address, addr3.address, addr4.address, addr5.address];
  const recipient = addr6.address;
  // console.log(signers);


  // console.log(signers);

  //Create MultiSignature Wallet
  const createWallet = await walletFactory.createMultisigWallet(3, signers);
  const wallet = await createWallet.wait();
  // console.log("Create MultiSig Clones:", wallet)
  const walletClone = await walletFactory.getMultiSigClones();
  console.log("New Wallet clone addresses: ", walletClone);

  //Interact with One Multisig Wallet.
  const walletClone1 = walletClone[0];
  const sigWallet = await ethers.getContractAt("MultiSignature", walletClone1);

  //Transfer funds from GTK ERC20 token to clone contract first
  const gtkToken = await ethers.getContractAt("GTK", GTKtokenAddr);
  const amountToTransfer_ = ethers.parseUnits("5", 18);
  const trToken = await gtkToken.transfer(walletClone1, amountToTransfer_);
  trToken.wait();
  console.log("Transfer some GTK ERC Token to wallet");
  const cloneBal = await gtkToken.balanceOf(walletClone1);
  console.log(`Clone One ${walletClone1} GTK Contract Balance:  ${cloneBal}` )

  //Interact with transfer function.
  const amountToTransfer = ethers.parseUnits("1", 18);
  const trf = await sigWallet.connect(addr1).transfer(amountToTransfer, recipient, GTKtokenAddr);
  console.log("Transfer from multisig wallet initiated with block hash", trf.hash);
  const recieverBalBefore = await gtkToken.balanceOf(recipient);
  console.log(`Recipient Balance Before approval" ${recieverBalBefore}`)

  //Interact with the approveTx in multi-signature wallet
  await sigWallet.connect(addr2).approveTx(1);
  await sigWallet.connect(addr3).approveTx(1);
  
  const recieverBalAfter = await gtkToken.balanceOf(recipient);
  console.log(`Recipient Balance Before approval" ${recieverBalAfter}`)

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
