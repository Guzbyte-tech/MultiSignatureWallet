import {
    time,
    loadFixture,
  } from "@nomicfoundation/hardhat-toolbox/network-helpers";
  import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
  import { expect } from "chai";
  import hre, { ethers } from "hardhat";


describe("Testing the multi signature factory contract.", function(){

    async function deployMultiSignatureContract(){

        const _quorum = 3;
        const [owner, addr1, addr2, addr3, addr4, addr5, addr6] = await hre.ethers.getSigners();
        const signers = [addr1, addr2, addr3, addr4];
        const walletFactory = await hre.ethers.getContractFactory("MultiSignatureFactory");
        const sigFactory = await walletFactory.deploy();
        return { sigFactory, _quorum, signers }

    }

    describe("Create Wallet",  function(){

        it("Should check if the new multisignature wallet was created successfully.", async function(){
            
            const {sigFactory, _quorum, signers} = await loadFixture(deployMultiSignatureContract);
            await sigFactory.createMultisigWallet(_quorum, signers)
            await expect((await sigFactory.getMultiSigClones()).length).to.be.gt(0);
        
        });

    });

});