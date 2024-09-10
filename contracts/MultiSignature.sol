// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MultiSignature {
    uint8 public quorum;
    uint8 public noOfValidSigners;
    uint256 public txCount;

    struct Transaction {
        uint256 id;
        uint256 amount;
        address sender;
        address recipient;
        bool isCompleted;
        uint256 timestamp;
        uint256 timeApproved;
        uint256 noOfApproval;
        address tokenAddress;
        address[] transactionSigners;
        string trxType;
    }

    mapping(address => bool) isValidSigner;
    mapping(uint => Transaction) transactions; // txId -> Transaction

    // signer -> transactionId -> bool (checking if an address has signed)
    mapping(address => mapping(uint256 => bool)) hasSigned;

    //Assuming the msg.sender is Just deploying the contract and not part of the signers of the transaction
    constructor(uint8 _quorum, address[] memory _validSigners) {
        quorum = _quorum;
        for (uint i = 0; i < _validSigners.length; i++) {
            require(_validSigners[i] != address(0), "Invalid Signer Address");
            isValidSigner[_validSigners[i]] = true;
        }
        noOfValidSigners = uint8(_validSigners.length);
    }

    function deposit(
        uint256 _amount,
        address _recipient,
        address _tokenAddress
    ) external {
        require(msg.sender != address(0), "address zero found");
        require(isValidSigner[msg.sender], "invalid signer");

        require(_amount > 0, "can't send zero amount");
        require(_recipient != address(0), "address zero found");
        require(_tokenAddress != address(0), "address zero found");

        require(
            IERC20(_tokenAddress).balanceOf(address(this)) >= _amount,
            "insufficient funds"
        );

        //Create the transaction.
        createTransaction(
            _amount,
            "deposit",
            _tokenAddress,
            msg.sender,
            _recipient
        );

        //The transfer will be done in the approve function.
    }

    //One of the signers want to withdraw some money
    function withdraw(uint256 _amount, address _tokenAddress) external {
        require(msg.sender != address(0), "address zero found");
        require(isValidSigner[msg.sender], "invalid signer");
        require(_amount > 0, "can't send zero amount");
        require(_tokenAddress != address(0), "address zero found");
        require(
            IERC20(_tokenAddress).balanceOf(address(this)) >= _amount,
            "insufficient funds"
        );

        createTransaction(
            _amount,
            "withdraw",
            _tokenAddress,
            address(this),
            msg.sender
        );

        //The main withdrawal will be done in the approve function.
    }

    //Approve all trasnsaction with this function.
    function approveTx(uint256 trxId) external {
        Transaction storage trx = transactions[trxId];
        require(trx.id != 0, "Invalid transaction Id");
        require(!trx.isCompleted, "Transaction already completed.");
        require(trx.noOfApproval < quorum, "Approval already reached.");
        require(hasSigned[msg.sender][trxId], "Already signed transaction.");
        require(trx.amount < IERC20(trx.tokenAddress).balanceOf(address(this)), "Insufficient funds.");

        require(isValidSigner[msg.sender], "Not a valid signer.");



        hasSigned[msg.sender][trxId] = true;
        trx.noOfApproval += 1;
        trx.transactionSigners.push(msg.sender);

        //Get the transaction type and then perform the transaction
        if (trx.noOfApproval == quorum) {
            trx.isCompleted = true;
            if (keccak256(abi.encodePacked(trx.trxType)) == keccak256(abi.encodePacked("deposit"))) {
                IERC20(trx.tokenAddress).transfer(trx.recipient, trx.amount);
            }
            if(keccak256(abi.encodePacked(trx.trxType)) == keccak256(abi.encodePacked("withdraw"))){
                IERC20(address(this)).transfer(msg.sender, trx.amount);

            }
        }
        
    }



    function createTransaction(
        uint256 _amount,
        string memory _typeOfTx,
        address _tokenAddress,
        address sender,
        address _recipient
    ) private {
        uint256 _trxId = txCount + 1;
        Transaction storage trx = transactions[_trxId];
        trx.id = _trxId;
        trx.amount = _amount;
        trx.sender = sender;
        trx.recipient = _recipient;
        trx.timestamp = block.timestamp;
        trx.noOfApproval += 1;
        trx.tokenAddress = _tokenAddress;
        trx.transactionSigners.push(msg.sender);
        trx.trxType = _typeOfTx;

        hasSigned[msg.sender][_trxId] = true;
    }
}
