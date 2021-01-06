const { expectEvent, expectRevert } = require('@openzeppelin/test-helpers')
const ERC20Token = artifacts.require('ERC20Token')
const ETFToken = artifacts.require('ETFToken')

const tokens = (value) => {
  return web3.utils.toBN(
    web3.utils.toWei(value.toString(), 'ether')
  )
}

const totalSupply = tokens(21000000)  // 21 Million

contract('ETFToken', async ([deployer, alice, bob]) => {
  let UNI
  let SNX
  let MKR
  let ETF

  beforeEach('Load Contracts', async () => {
    UNI = await ERC20Token.new('Mock UniSwap Token', 'UNI', totalSupply)
    SNX = await ERC20Token.new('Mock Synthetix Token', 'SNX', totalSupply)
    MKR = await ERC20Token.new('Mock MakerDao Token', 'MKR', totalSupply)
    ETF = await ETFToken.new(
      'DeFi Protocol ETF',
      'ETF',
      [UNI.address, SNX.address, MKR.address],
      [1, 4, 2]
    )
  })

  beforeEach(`Send Tokens to Alice and approve ETF contract as the spender
    for 2 UNI, 8 SNX, and 4 MKR tokens`, async () => {
    const UNIvalue = tokens(1 * 2)
    const SNXvalue = tokens(4 * 2)
    const MKRvalue = tokens(2 * 2)

    // Send enough tokens to create 2 ETF's
    await UNI.transfer(alice, UNIvalue, {from: deployer})
    await SNX.transfer(alice, SNXvalue, {from: deployer})
    await MKR.transfer(alice, MKRvalue, {from: deployer})

    // Approve ETFToken to spend Alice's UNI 
    const UNIreceipt = await UNI.approve(ETF.address, UNIvalue, {from: alice})
    await expectEvent(UNIreceipt, 'Approval', { owner: alice,
      spender: ETF.address,
      value: UNIvalue
    })

    // Approve ETFToken to Alice's SNX
    const SNXreceipt = await SNX.approve(ETF.address, SNXvalue, {from: alice})
    await expectEvent(SNXreceipt, 'Approval', {
      owner: alice,
      spender: ETF.address,
      value: SNXvalue
    })

    // Approve ETFToken to spend Alice's MKR
    const MKRreceipt = await MKR.approve(ETF.address, MKRvalue, {from: alice})
    await expectEvent(MKRreceipt, 'Approval', {
      owner: alice,
      spender: ETF.address,
      value: MKRvalue
    })
  })

  describe('Deployment', async () => {
    it('Mock UNI Token is successfully loaded', async () => {
      assert('Mock UniSwap Token' === await UNI.name(), 'Token name incorrect')
      assert('UNI' === await UNI.symbol(), 'Token symbol incorrect')
      assert(
        web3.utils.toBN(18).eq(
          web3.utils.toBN(await UNI.decimals())
        ),
        'decimals incorrect'
      )
    })

    it('Mock SNX Token is successfully loaded', async () => {
      assert('Mock Synthetix Token' === await SNX.name(), 'Token name incorrect')
      assert('SNX' === await SNX.symbol(), 'SNX Token symbol incorrect')
      assert(web3.utils.toBN(18).eq(web3.utils.toBN(await SNX.decimals())),
        'SNX decimals incorrect')
    })

    it('Mock MKR Token is successfully loaded', async () => {
      assert('Mock MakerDao Token' === await MKR.name(),
        'MKR Token name incorrect')
      assert('MKR' === await MKR.symbol(),
        'MKR Token symbol incorrect')
      assert(web3.utils.toBN(18).eq(web3.utils.toBN(await MKR.decimals())),
        'MKR decimals incorrect')
    })

    it('ETF Token is successfully loaded', async () => {
      console.log('UNI: ' + UNI.address)
      console.log('SNX: ' + SNX.address)
      console.log('MKR: ' + MKR.address)
      console.log('ETF: ' + ETF.address)

      assert('DeFi Protocol ETF' === await ETF.name(),
        'ETF Token name incorrect')
      assert('ETF' === await ETF.symbol(),
        'ETF Token symbol incorrect')
      assert.deepEqual(
        [UNI.address, SNX.address, MKR.address],
        await ETF.getTokens()
      )
      assert.deepEqual(
        [web3.utils.toBN(1), web3.utils.toBN(4), web3.utils.toBN(2)],
        await ETF.getQuantities()
      )
    })
  })

  describe('Create', async () => {
    it('Alice creates 2 ETF Token', async () => {
      const amount = tokens(2)
      const receipt = await ETF.create(amount, {from: alice})
      expectEvent(receipt, 'Create', {
        amount: amount
      })

      assert(tokens(2).eq(await ETF.balanceOf(alice)),
        'alices ETF balance did not increase ' +
        (await ETF.balanceOf(alice)).toString())
    })

    it('Alice does not have enough tokens to create 3 ETF Tokens', async () => {
      const amount = tokens(3)
      await expectRevert(
        ETF.create(amount, {from: alice}),
        'transfer amount exceeds balance'
      )
    })
  })

  describe('Redeem', async () => {
    beforeEach('Alice creates 2 ETF Tokens', async () => {
      const result = await ETF.create(tokens(2), {from: alice})
      expectEvent(result, 'Create', {
        amount: tokens(2)
      })
    })

    it('Alice redeems 2 ETF Tokens', async () => {
      ETFbalance = await ETF.balanceOf(alice)
      UNIbalance = await UNI.balanceOf(alice)
      SNXbalance = await SNX.balanceOf(alice)
      MKRbalance = await MKR.balanceOf(alice)

      const receipt = await ETF.redeem(tokens(2), {from: alice})
      expectEvent(receipt, 'Redeem', {
        amount: tokens(2)
      })

      assert(UNIbalance.add(tokens(2)).eq(await UNI.balanceOf(alice)),
            'alices UNI tokens not redeemed')
      assert(SNXbalance.add(tokens(8)).eq(await SNX.balanceOf(alice)),
            'alices SNX tokens not redeemed')
      assert(MKRbalance.add(tokens(4)).eq(await MKR.balanceOf(alice)),
            'alices MKR tokens not redeemed')
    })

    it('Alice cannot redeem more tokens then in her ETF', async () => {
      expectRevert(
        ETF.redeem(tokens(3), {from: alice}),
        'burn amount exceeds balance'
      )
    })
  })

})
