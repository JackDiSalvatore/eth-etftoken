// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ERC20Token is ERC20 {
    constructor(string memory name_, string memory symbol_, uint256 totalSupply_)
    ERC20(name_, symbol_)
    public {
        _mint(msg.sender, totalSupply_);
    }
}
