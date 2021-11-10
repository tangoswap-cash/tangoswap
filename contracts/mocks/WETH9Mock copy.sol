// SPDX-License-Identifier: MIT

// // SPDX-License-Identifier: MIT

// pragma solidity 0.6.12;

// import "hardhat/console.sol";   //TODO(BiC) remove

// contract WETH9Mock {
// 	string public name = "Wrapped Ether";
// 	string public symbol = "WETH";
// 	uint8 public decimals = 18;

// 	event Approval(address indexed src, address indexed guy, uint256 wad);
// 	event Transfer(address indexed src, address indexed dst, uint256 wad);
// 	event Deposit(address indexed dst, uint256 wad);
// 	event Withdrawal(address indexed src, uint256 wad);

// 	mapping(address => uint256) public balanceOf;
// 	mapping(address => mapping(address => uint256)) public allowance;

//     function _mint(address account, uint256 amount) internal virtual {
//         require(account != address(0), "ERC20: mint to the zero address");

//         _beforeTokenTransfer(address(0), account, amount);

//         _totalSupply = _totalSupply.add(amount);
//         _balances[account] = _balances[account].add(amount);
//         emit Transfer(address(0), account, amount);
//     }

//     constructor(uint256 supply) public {
//         _mint(msg.sender, supply);
//     }

//     // constructor (string memory name_, string memory symbol_) public {
//     //     _name = name_;
//     //     _symbol = symbol_;
//     //     _decimals = 18;
//     // }	

// 	function deposit() public payable {
// 		console.log("contract WETH9Mock.deposit() 1");
// 		balanceOf[msg.sender] += msg.value;
// 		console.log("contract WETH9Mock.deposit() 2");
// 		emit Deposit(msg.sender, msg.value);
// 		console.log("contract WETH9Mock.deposit() 3");
// 	}

// 	function withdraw(uint256 wad) public {
// 		require(balanceOf[msg.sender] >= wad, "WETH9: Error");
// 		balanceOf[msg.sender] -= wad;
// 		msg.sender.transfer(wad);
// 		emit Withdrawal(msg.sender, wad);
// 	}

// 	function totalSupply() public view returns (uint256) {
// 		return address(this).balance;
// 	}

// 	function approve(address guy, uint256 wad) public returns (bool) {
// 		allowance[msg.sender][guy] = wad;
// 		emit Approval(msg.sender, guy, wad);
// 		return true;
// 	}

// 	function transfer(address dst, uint256 wad) public returns (bool) {
// 		return transferFrom(msg.sender, dst, wad);
// 	}

// 	function transferFrom(
// 		address src,
// 		address dst,
// 		uint256 wad
// 	) public returns (bool) {
// 		require(balanceOf[src] >= wad, "WETH9: Error");

// 		if (src != msg.sender && allowance[src][msg.sender] != uint256(-1)) {
// 			require(allowance[src][msg.sender] >= wad, "WETH9: Error");
// 			allowance[src][msg.sender] -= wad;
// 		}

// 		balanceOf[src] -= wad;
// 		balanceOf[dst] += wad;

// 		emit Transfer(src, dst, wad);

// 		return true;
// 	}
// }