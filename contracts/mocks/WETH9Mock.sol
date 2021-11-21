// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "./ERC20Public.sol";
import '../uniswapv2/interfaces/IWETH.sol';

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
		_balances[msg.sender] += msg.value;
		emit Deposit(msg.sender, msg.value);
	}
}