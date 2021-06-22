const { assert } = require("chai");
const web3 = require("web3");
const CBToken = artifacts.require("./CBToken.sol");

require("chai").use(require("chai-as-promised")).should();

contract("CBToken", ([admin, fromAccount, toAccount, spendAccount]) => {
  let cbtoken;

  before(async () => {
    cbtoken = await CBToken.deployed();
  });

  describe("deployment", async () => {
    it("deploys successfully", async () => {
      const address = await cbtoken.address;
      assert.notEqual(address, 0x0);
      assert.notEqual(address, "");
      assert.notEqual(address, null);
      assert.notEqual(address, undefined);
    });

    it("has a name", async () => {
      const name = await cbtoken.name();
      const totalSupply = await cbtoken.totalSupply();
      assert.equal(name, "Crowdfunding by Blockchain Token", "name correct");
      assert.equal(+totalSupply, 10000000, "total correct");
    });
  });

  describe("method", async () => {
    it("balance of admin", async () => {
      const balanceOfAddmin = await cbtoken.balanceOf(admin);
      assert.equal(+balanceOfAddmin, 10000000, "balance admin correct");
    });

    it("send token to buy address", async () => {
      const result = (await cbtoken.transfer(fromAccount, 100, { from: admin }))
        .logs[0].args;

      const balanceOfAdmin = await cbtoken.balanceOf(admin);
      const balanceOfToAddress = await cbtoken.balanceOf(fromAccount);
      assert.equal(+balanceOfAdmin, 10000000 - 100, "balance admin correct");
      assert.equal(+balanceOfToAddress, 100, "balance buy address correct");
    });

    it("approve limit token _spender", async () => {
      const result = (
        await cbtoken.approve(spendAccount, 50, { from: fromAccount })
      ).logs[0].args;

      const allowance = await cbtoken.allowance(fromAccount, spendAccount);

      assert.equal(+result._value, allowance, "limit correct");
    });

    it("transfer by _spender (fromAccount -> toAccount)", async () => {
      const result = (
        await cbtoken.transferFrom(fromAccount, toAccount, 30, {
          from: spendAccount,
        })
      ).logs[0].args;
      const balanceOfFromAccount = await cbtoken.balanceOf(fromAccount);
        const balanceOfToAccount = await cbtoken.balanceOf(toAccount);
        const allowanceFromAccount = await cbtoken.allowance(fromAccount, spendAccount);

        assert.equal(balanceOfFromAccount, 70, 'balance from account correct');
        assert.equal(balanceOfToAccount, 30, "balance to account correct");
        assert.equal(allowanceFromAccount, 20, "allowance from account correct");        
    });
  });
});

