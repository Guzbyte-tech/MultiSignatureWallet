// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./MultiSignature.sol";

contract MultiSignatureFactory {
    MultiSignature[] multisigClones;

    function createMultisigWallet(
        uint256 _quorum,
        address[] memory _validSigners
    ) external returns (MultiSignature newMulsig_, uint256 length_) {
        newMulsig_ = new MultiSignature(_quorum, _validSigners);

        multisigClones.push(newMulsig_);

        length_ = multisigClones.length;
    }

    function getMultiSigClones()
        external
        view
        returns (MultiSignature[] memory)
    {
        return multisigClones;
    }
}
