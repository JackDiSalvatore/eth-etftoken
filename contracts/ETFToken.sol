// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ETFToken is ERC20 {
    address[] public tokens;
    uint256[] public quantities;

    event Create(uint256 amount);

    constructor(
        string memory name_,
        string memory symbol_,
        address[] memory _tokens,
        uint256[] memory _quantities
    )
    ERC20(name_, symbol_)
    public {
        tokens = _tokens;
        quantities = _quantities;
    }

    function getTokens() public view returns (address[] memory) {
        return tokens;
    }

    function getQuantities() public view returns (uint256[] memory) {
        return quantities;
    }

    function create(uint256 amount) external {
        // Send Tokens to this Contract
        for (uint256 i = 0; i < tokens.length; i++) {
            bool result = ERC20(tokens[i]).transferFrom(msg.sender, address(this), quantities[i] * amount);
            require(result, 'transfer failed');
        }

        // Mint new ETF tokens to sender
        _mint(msg.sender, amount);
        emit Create(amount);
    }

    function redeem(uint256 amount) external {
        // ...
    }

}
