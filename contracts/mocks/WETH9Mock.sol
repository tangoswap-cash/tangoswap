// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

// import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./ERC20Public.sol";
import '../uniswapv2/interfaces/IWETH.sol';

// import "hardhat/console.sol";   //TODO(BiC) remove

contract WETH9Mock is ERC20Public { //, IWETH
	string public k_name = "Wrapped Ether";
	string public k_symbol = "WETH";

	event Deposit(address indexed dst, uint256 wad);

    constructor(
        uint256 supply
    ) public ERC20Public(k_name, k_symbol) {
        _mint(msg.sender, supply);
    }

	function deposit() public payable {
		// console.log("contract WETH9Mock.deposit() 1");
		_balances[msg.sender] += msg.value;
		// console.log("contract WETH9Mock.deposit() 2");
		emit Deposit(msg.sender, msg.value);
		// console.log("contract WETH9Mock.deposit() 3");
	}
}