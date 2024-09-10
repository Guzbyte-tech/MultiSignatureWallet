import {
    time,
    loadFixture,
  } from "@nomicfoundation/hardhat-toolbox/network-helpers";
  import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
  import { expect } from "chai";
  import hre, { ethers } from "hardhat";



describe("MultiSignature Wallet Contract Test.", function(){

    async function deployMultiSync() {
        const _quorum = 4;
        const [owner, addr1, addr2, addr3, addr4, addr5, addr6] = await hre.ethers.getSigners();
        const multiSync = await hre.ethers.getContractFactory("MultiSignature");
        const signers = [addr1, addr2, addr3, addr4];
        const receipents = [addr5, addr6];
        const wallet = await multiSync.deploy(_quorum, signers);

        return { wallet, _quorum, signers, receipents};
    }

    async function deployGtkToken() {
        const [tokenAddress] = await hre.ethers.getSigners();
        const GtkToken = await hre.ethers.getContractFactory("GTK");
        const gtkToken = await GtkToken.deploy();
        return { tokenAddress, gtkToken }

    }

    describe("Deployment", function(){
        it("Should check if valid signers is greater than one", async function(){
            const { wallet, _quorum, signers } = await loadFixture(deployMultiSync);
            expect(await signers.length).to.be.gt(1);
        });

        it("Should check if quorum is greater than one", async function(){
            const { wallet, _quorum, signers } = await loadFixture(deployMultiSync);
            expect(await _quorum).to.be.gt(1);
        });

        it("Should check if addresses are valid signer addresses", async function(){
            const { wallet, _quorum, signers } = await loadFixture(deployMultiSync);
            expect (await wallet).to.not.revertedWith("Invalid Signer Address"); 
        });

        it("Should check if quorum value is less than or equal to valid signers", async function(){
            const { wallet, _quorum, signers } = await loadFixture(deployMultiSync);
            expect (await _quorum).to.be.lessThanOrEqual(signers.length);
        });

        // it("Should check if token deployed successfully", async function(){

        // });
    });

    describe("Transfer", function(){
        it("Should check if addresses given are not zero addresses", async function(){

            const { wallet, _quorum, signers, receipents} = await loadFixture(deployMultiSync);

            const { tokenAddress, gtkToken } = await loadFixture(deployGtkToken);

            const amountToTransfer = ethers.parseUnits("10", 18);
            gtkToken.transfer(wallet.getAddress(),amountToTransfer);

            const _amount = ethers.parseUnits("1", 18);
            expect(await wallet.connect(signers[0]).transfer(_amount, signers[1], gtkToken.getAddress())).to.not.be.revertedWith("address zero found")
        });

        it("Should check if address calling the function is a valid signer", async function(){

            const { wallet, _quorum, signers, receipents} = await loadFixture(deployMultiSync);

            const { tokenAddress, gtkToken } = await loadFixture(deployGtkToken);

            const amountToTransfer = ethers.parseUnits("10", 18);
            gtkToken.transfer(wallet.getAddress(),amountToTransfer);

            const _amount = ethers.parseUnits("1", 18);
            expect(await wallet.connect(signers[0]).transfer(_amount, signers[1], gtkToken.getAddress())).to.not.be.revertedWith("invalid signer")

        });

        it("Should check if amount is greater than zero", async function(){

            const { wallet, _quorum, signers, receipents} = await loadFixture(deployMultiSync);

            const { tokenAddress, gtkToken } = await loadFixture(deployGtkToken);

            const amountToTransfer = ethers.parseUnits("10", 18);
            gtkToken.transfer(wallet.getAddress(),amountToTransfer);

            const _amount = ethers.parseUnits("1", 18);
            expect(await wallet.connect(signers[0]).transfer(_amount, receipents[1], gtkToken.getAddress())).to.not.be.revertedWith("can't send zero amount")

        });

        it("Should check wallet has enough funds", async function(){

            const { wallet, _quorum, signers, receipents} = await loadFixture(deployMultiSync);

            const { tokenAddress, gtkToken } = await loadFixture(deployGtkToken);

            const amountToTransfer = ethers.parseUnits("10", 18);
            gtkToken.transfer(wallet.getAddress(),amountToTransfer);

            const _amount = ethers.parseUnits("1", 18);
            await expect( wallet.connect(signers[0]).transfer(_amount, signers[1], gtkToken.getAddress())).to.not.be.revertedWith("insufficient funds")

        });

        it("Should check if transfer transaction was created successfully", async function(){

            const { wallet, _quorum, signers, receipents} = await loadFixture(deployMultiSync);

            const { tokenAddress, gtkToken } = await loadFixture(deployGtkToken);

            const amountToTransfer = ethers.parseUnits("10", 18);
            gtkToken.transfer(wallet.getAddress(),amountToTransfer);

            const _amount = ethers.parseUnits("1", 18);
            expect(await wallet.connect(signers[0]).transfer(_amount, signers[1], gtkToken.getAddress())).to.not.reverted
        });
    });


    describe("updateQuorum", function(){
        it("Should check if quorom given is not zero", async function(){

            const { wallet, _quorum, signers, receipents} = await loadFixture(deployMultiSync);

            const { tokenAddress, gtkToken } = await loadFixture(deployGtkToken);

            const amountToTransfer = ethers.parseUnits("10", 18);
            gtkToken.transfer(wallet.getAddress(),amountToTransfer);

            const _amount = ethers.parseUnits("1", 18);

            expect(await wallet.connect(signers[0]).updateQuorum(1)).to.not.be.revertedWith("Quorum cannot be zero")
        });

        it("Should check if new quorom is less than or equal to number of valid signers", async function(){

            const { wallet, _quorum, signers, receipents} = await loadFixture(deployMultiSync);

            const { tokenAddress, gtkToken } = await loadFixture(deployGtkToken);

            const amountToTransfer = ethers.parseUnits("10", 18);
            gtkToken.transfer(wallet.getAddress(),amountToTransfer);

            const _amount = ethers.parseUnits("1", 18);

            expect(await wallet.connect(signers[0]).updateQuorum(4)).to.not.be.revertedWith("New is greater than signers.")
        });

        it("Should check if sender is not address zero", async function(){

            const { wallet, _quorum, signers, receipents} = await loadFixture(deployMultiSync);

            const { tokenAddress, gtkToken } = await loadFixture(deployGtkToken);

            const amountToTransfer = ethers.parseUnits("10", 18);
            gtkToken.transfer(wallet.getAddress(),amountToTransfer);

            const _amount = ethers.parseUnits("1", 18);

            expect(await wallet.connect(signers[0]).updateQuorum(1)).to.not.be.revertedWith("Address zero detected.")
        });

        it("Should check if sender is a valid sender", async function(){

            const { wallet, _quorum, signers, receipents} = await loadFixture(deployMultiSync);

            const { tokenAddress, gtkToken } = await loadFixture(deployGtkToken);

            const amountToTransfer = ethers.parseUnits("10", 18);
            gtkToken.transfer(wallet.getAddress(),amountToTransfer);

            const _amount = ethers.parseUnits("1", 18);

            expect(await wallet.connect(signers[0]).updateQuorum(1)).to.not.be.revertedWith("Not a valid signer.")
        });

        it("Should check if updateQuorom executed successfully", async function(){

            const { wallet, _quorum, signers, receipents} = await loadFixture(deployMultiSync);

            const { tokenAddress, gtkToken } = await loadFixture(deployGtkToken);

            const amountToTransfer = ethers.parseUnits("10", 18);
            gtkToken.transfer(wallet.getAddress(),amountToTransfer);

            const _amount = ethers.parseUnits("1", 18);
            expect(await wallet.connect(signers[0]).updateQuorum(3)).to.not.reverted
        });

    
    });

    describe("approveTx", function(){
        it("Should check if transaction already completed", async function(){

            const { wallet, _quorum, signers, receipents} = await loadFixture(deployMultiSync);

            const { tokenAddress, gtkToken } = await loadFixture(deployGtkToken);

            const amountToTransfer = ethers.parseUnits("10", 18);
            gtkToken.transfer(wallet.getAddress(),amountToTransfer);

            const _amount = ethers.parseUnits("1", 18);
            await wallet.connect(signers[0]).transfer(_amount, signers[1], gtkToken.getAddress());
            await wallet.connect(signers[0]).transfer(_amount, signers[1], gtkToken.getAddress());

            expect(await wallet.connect(signers[1]).approveTx(2)).to.not.be.revertedWith("Transaction already completed.")
        });


        it("Should check if transaction ID is a valid", async function(){

            const { wallet, _quorum, signers, receipents} = await loadFixture(deployMultiSync);

            const { tokenAddress, gtkToken } = await loadFixture(deployGtkToken);

            const amountToTransfer = ethers.parseUnits("10", 18);
            gtkToken.transfer(wallet.getAddress(),amountToTransfer);

            const _amount = ethers.parseUnits("1", 18);
            await wallet.connect(signers[0]).transfer(_amount, signers[1], gtkToken.getAddress());
            await wallet.connect(signers[0]).transfer(_amount, signers[1], gtkToken.getAddress());

        
            expect(await wallet.connect(signers[1]).approveTx(2)).to.not.be.revertedWith("Invalid transaction Id.")
        });

        it("Should check wallet has enough funds", async function(){

            const { wallet, _quorum, signers, receipents} = await loadFixture(deployMultiSync);

            const { tokenAddress, gtkToken } = await loadFixture(deployGtkToken);

            const amountToTransfer = ethers.parseUnits("10", 18);
            gtkToken.transfer(wallet.getAddress(),amountToTransfer);
            const _amount = ethers.parseUnits("1", 18);
            await wallet.connect(signers[0]).transfer(_amount, signers[1], gtkToken.getAddress());
            await wallet.connect(signers[0]).transfer(_amount, signers[1], gtkToken.getAddress());

            await expect(wallet.connect(signers[1]).approveTx(2)).to.not.be.revertedWith("insufficient funds.")

        });

        it("Should check if total approval has been reached.", async function(){
            const { wallet, _quorum, signers, receipents} = await loadFixture(deployMultiSync);

            const { tokenAddress, gtkToken } = await loadFixture(deployGtkToken);

            const amountToTransfer = ethers.parseUnits("10", 18);
            gtkToken.transfer(wallet.getAddress(),amountToTransfer);
            const _amount = ethers.parseUnits("1", 18);
            await wallet.connect(signers[0]).transfer(_amount, signers[1], gtkToken.getAddress());
            await wallet.connect(signers[0]).transfer(_amount, signers[1], gtkToken.getAddress());
            
            // await wallet.connect(signers[0]).approveTx(2);
            await wallet.connect(signers[1]).approveTx(2);
            await wallet.connect(signers[2]).approveTx(2);
            await wallet.connect(signers[3]).approveTx(2);
        });

        it("Should check if transaction has already been signed by a signer.", async function(){
            const { wallet, _quorum, signers, receipents} = await loadFixture(deployMultiSync);

            const { tokenAddress, gtkToken } = await loadFixture(deployGtkToken);

            const amountToTransfer = ethers.parseUnits("10", 18);
            gtkToken.transfer(wallet.getAddress(),amountToTransfer);
            const _amount = ethers.parseUnits("1", 18);
            await wallet.connect(signers[0]).transfer(_amount, signers[1], gtkToken.getAddress());
            await wallet.connect(signers[0]).transfer(_amount, signers[1], gtkToken.getAddress());
            
            // await wallet.connect(signers[0]).approveTx(2);
            await expect(wallet.connect(signers[0]).approveTx(2)).to.be.revertedWith("Can't sign twice.");
            
        });

        it("Should check if signer is a valid signer.", async function(){
            const { wallet, _quorum, signers, receipents} = await loadFixture(deployMultiSync);

            const { tokenAddress, gtkToken } = await loadFixture(deployGtkToken);

            const amountToTransfer = ethers.parseUnits("10", 18);
            gtkToken.transfer(wallet.getAddress(),amountToTransfer);
            const _amount = ethers.parseUnits("1", 18);
            await wallet.connect(signers[0]).transfer(_amount, signers[1], gtkToken.getAddress());
            await wallet.connect(signers[0]).transfer(_amount, signers[1], gtkToken.getAddress());
            
            // await wallet.connect(signers[0]).approveTx(2);
            await expect(wallet.connect(signers[0]).approveTx(2)).to.not.be.revertedWith("Not a valid signer.");
            
        });

        it("Should check if approve function is working perfectly.", async function(){
            const { wallet, _quorum, signers, receipents} = await loadFixture(deployMultiSync);

            const { tokenAddress, gtkToken } = await loadFixture(deployGtkToken);

            const amountToTransfer = ethers.parseUnits("10", 18);
            gtkToken.transfer(wallet.getAddress(),amountToTransfer);
            const _amount = ethers.parseUnits("1", 18);
            await wallet.connect(signers[0]).transfer(_amount, signers[1], gtkToken.getAddress());
            await wallet.connect(signers[0]).transfer(_amount, signers[1], gtkToken.getAddress());
            
            
            // await wallet.connect(signers[0]).approveTx(2);
            await expect(wallet.connect(signers[1]).approveTx(2)).to.not.reverted;
            
        });




    
    });

   
});

// 0x0000000000000000000000000000000000000000