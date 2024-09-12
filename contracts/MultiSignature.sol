// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MultiSignature {
    uint256 public quorum;
    uint8 public noOfValidSigners;
    uint256 public txCount;

    // error FewValidSigners();

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
        uint256 newQuorum;
    }

    mapping(address => bool) isValidSigner;
    mapping(uint => Transaction) transactions; // txId -> Transaction

    // signer -> transactionId -> bool (checking if an address has signed)
    mapping(address => mapping(uint256 => bool)) hasSigned;

    //Assuming the msg.sender is Just deploying the contract and not part of the signers of the transaction
    constructor(uint256 _quorum, address[] memory _validSigners) {
        require(_validSigners.length > 1, "few valid signers");
        require(_quorum > 1, "quorum is too small");

        for (uint i = 0; i < _validSigners.length; i++) {
            require(_validSigners[i] != address(0), "Invalid Signer Address");
            isValidSigner[_validSigners[i]] = true;
        }
        noOfValidSigners = uint8(_validSigners.length);

        if (!isValidSigner[msg.sender]) {
            isValidSigner[msg.sender] = true;
            noOfValidSigners += 1;
        }

        require(
            _quorum <= noOfValidSigners,
            "quorum greater than valid signers"
        );
        quorum = _quorum;
    }

    function transfer(
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
            _recipient,
            0
        );

        //The transfer will be done in the approve function.
    }

    //Approve all trasnsaction with this function.
    function approveTx(uint256 trxId) external {
        Transaction storage trx = transactions[trxId];
        require(!trx.isCompleted, "Transaction already completed.");
        require(trx.id != 0, "Invalid transaction Id");
        require(
            trx.amount <= IERC20(trx.tokenAddress).balanceOf(address(this)),
            "Insufficient funds."
        );
        require(trx.noOfApproval < quorum, "Approval already reached.");
        require(!hasSigned[msg.sender][trxId], "Can't sign twice.");

        require(isValidSigner[msg.sender], "Not a valid signer.");

        hasSigned[msg.sender][trxId] = true;
        trx.noOfApproval += 1;
        trx.transactionSigners.push(msg.sender);

        //Get the transaction type and then perform the transaction
        bytes32 trxTypeHash = keccak256(abi.encodePacked(trx.trxType));
        if (trxTypeHash == keccak256(abi.encodePacked("deposit"))) {
            IERC20(trx.tokenAddress).transfer(trx.recipient, trx.amount);
        } else if (
            trxTypeHash == keccak256(abi.encodePacked("quorum_update"))
        ) {
            quorum = trx.newQuorum;
        }
    }

    function updateQuorum(uint8 _quorum) external {
        require(_quorum > 0, "Quorum cannot be zero");
        require(_quorum <= noOfValidSigners, "New is greater than signers.");
        require(msg.sender != address(0), "Address zero detected.");
        require(isValidSigner[msg.sender], "Not a valid signer.");

        createTransaction(
            0,
            "quorum_update",
            address(0),
            msg.sender,
            msg.sender,
            _quorum
        );
    }

    function createTransaction(
        uint256 _amount,
        string memory _typeOfTx,
        address _tokenAddress,
        address sender,
        address _recipient,
        uint8 _newQuorum
    ) private {
        if (sender == address(0)) {
            sender = msg.sender;
        }

        if (_recipient == address(0)) {
            _recipient = msg.sender;
        }

        uint256 _trxId = txCount + 1;
        Transaction storage trx = transactions[_trxId];
        trx.id = _trxId;
        trx.amount = _amount;
        trx.sender = sender;
        trx.recipient = _recipient;
        trx.timestamp = block.timestamp;
        trx.tokenAddress = _tokenAddress;
        trx.transactionSigners.push(msg.sender);
        trx.trxType = _typeOfTx;
        trx.newQuorum = _newQuorum;

        hasSigned[msg.sender][_trxId] = true;

        txCount += 1;
    }
}
