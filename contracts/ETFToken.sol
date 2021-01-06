// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

contract ETFToken is ERC20 {
    using SafeMath for uint256;

    address[] public tokens;
    uint256[] public quantities;

    event Create(uint256 amount);
    event Redeem(uint256 amount);

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
            bool result = ERC20(tokens[i]).transferFrom(msg.sender, address(this), quantities[i].mul(amount));
            require(result, 'transfer failed');
        }

        // Mint new ETF tokens to sender
        _mint(msg.sender, amount);
        emit Create(amount);
    }

    function redeem(uint256 amount) external {
        // Burn ETF tokens
        _burn(msg.sender, amount);

        // Send ETF Tokens to this Contract
        for (uint256 i = 0; i < tokens.length; i++) {
            // Note: we must use 'transfer' function here and not 'transferFrom'
            bool result = ERC20(tokens[i]).transfer(msg.sender, quantities[i].mul(amount));
            require(result, 'transfer back failed');
        }

        emit Redeem(amount);
    }
}
