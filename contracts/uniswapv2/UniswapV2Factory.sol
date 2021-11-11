// SPDX-License-Identifier: GPL-3.0

pragma solidity =0.6.12;

import './interfaces/IUniswapV2Factory.sol';
import './UniswapV2Pair.sol';

import "hardhat/console.sol";   //TODO(BiC) remove

contract UniswapV2Factory is IUniswapV2Factory {
    address public override feeTo;
    address public override feeToSetter;
    address public override migrator;

    mapping(address => mapping(address => address)) public override getPair;
    address[] public override allPairs;

    event PairCreated(address indexed token0, address indexed token1, address pair, uint);

    constructor(address _feeToSetter) public {
        feeToSetter = _feeToSetter;
    }

    function allPairsLength() external override view returns (uint) {
        return allPairs.length;
    }

    function pairCodeHash() external pure returns (bytes32) {
        return keccak256(type(UniswapV2Pair).creationCode);
    }

    function createPair(address tokenA, address tokenB) external override returns (address pair) {
        console.log("createPair 1");

        require(tokenA != tokenB, 'UniswapV2: IDENTICAL_ADDRESSES');

        console.log("createPair 2");

        (address token0, address token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);

        console.log("createPair 3");

        require(token0 != address(0), 'UniswapV2: ZERO_ADDRESS');

        console.log("createPair 4");

        require(getPair[token0][token1] == address(0), 'UniswapV2: PAIR_EXISTS'); // single check is sufficient

        console.log("createPair 5");

        bytes memory bytecode = type(UniswapV2Pair).creationCode;

        console.log("createPair 6");

        bytes32 salt = keccak256(abi.encodePacked(token0, token1));

        console.log("createPair 7");

        assembly {
            pair := create2(0, add(bytecode, 32), mload(bytecode), salt)
        }

        console.log("createPair 8");

        UniswapV2Pair(pair).initialize(token0, token1);

        console.log("createPair 9");

        getPair[token0][token1] = pair;
        getPair[token1][token0] = pair; // populate mapping in the reverse direction
        allPairs.push(pair);

        console.log("createPair 10");

        emit PairCreated(token0, token1, pair, allPairs.length);
    }

    function setFeeTo(address _feeTo) external override {
        require(msg.sender == feeToSetter, 'UniswapV2: FORBIDDEN');
        feeTo = _feeTo;
    }

    function setMigrator(address _migrator) external override {
        require(msg.sender == feeToSetter, 'UniswapV2: FORBIDDEN');
        migrator = _migrator;
    }

    function setFeeToSetter(address _feeToSetter) external override {
        require(msg.sender == feeToSetter, 'UniswapV2: FORBIDDEN');
        feeToSetter = _feeToSetter;
    }

}
