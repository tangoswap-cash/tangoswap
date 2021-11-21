// SPDX-License-Identifier: GPL-3.0

pragma solidity =0.6.12;

import "./uniswapv2/UniswapV2Pair.sol";

contract CalHash {
    function getInitHash() public pure returns(bytes32){
        bytes memory bytecode = type(UniswapV2Pair).creationCode;
        return keccak256(abi.encodePacked(bytecode));
    }
}