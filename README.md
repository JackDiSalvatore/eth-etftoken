# eth-etftoken

This is a Smart Contract representing an ETF Token (That conforms to ERC20) and allows for bundling and unbundling of ERC20 tokens.

## How To Run

1. Install dependencies

OpenZeppelin Contract Libraries

`npm install @openzeppelin/contracts`

OpenZeppelin Test Libraries

`npm i --save-dev @openzeppelin/test-helpers`

2. Run Tests

`truffle test`

3. Deploy To Local Blockchain

```
truffle develop
migrate --reset
```

## constructor

* _name: name of the ETF
* _tokens: array of token addresses within the ETF
* _quantities: array of each token quantity in the ETF

ex:

UNI = 0x1f9840a85d5af5bf1d1762f925bdaddc4201f984
SNX = 0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f
MKR = 0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2

ETFToken.new([UNI, SNX, MKR], [1,4,2])

## create

User transfers correct amount of ERC20 tokens to the Smart Contract, and the Smart Contract will mint out the approperiate amount of ETF Tokens.

ex:

Create 5 ETF

*prerequisites*
* user owns 5 UNI, 20 SNX, and 10 MKR
* user address approves ETFToken SC as spender for UNI (allowance: 5)
* user address approves ETFToken SC as spender for SNX (allowance: 20)
* user address approves ETFToken SC as spender for MKR (allowance: 10)

create(5)
* A().transferFrom(msg.sender, address(this))
* B().transferFrom(msg.sender, address(this))
* _mint(msg.sender, 1)

Create 5 ETF Tokens with: 5 UNI, 20 SNX, and 10 MKR.  (Note: user must have 5 UNI, 20 SNX, and 10 MKR to successfully complete the transaction)

ETFToken.create(5, {from: user})

## redeem

User transfers ETF Tokens back to the Smart Contract, and the Smart Contract will burn the ETF Tokens and transfer back the backing ERC20 Tokens to the user.

ex:

ETFToken.redeem(5, {from: user})



### Example call:

// Given an ETFToken with tokens: [A, B], quantities: [1, 2]
create(5)
// Should result in caller having 5 ETFTokens, and the ETFToken contract collateralized by 5 A and 10 B

// constructor
tokens = ex : A_address, B_address
quantities: 1, 2

