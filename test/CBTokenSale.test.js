const { assert } = require("chai");
const web3 = require("web3");
const CBTokenSale = artifacts.require("./CBTokenSale.sol");
const CBToken = artifacts.require("./CBToken.sol");
require("chai").use(require("chai-as-promised")).should();

contract("CBTokenSale", ([admin, buyer]) => {
  let cbtokenSale, cbtoken, tokenPrice;
  let addressTokenContract;
  before(async () => {
    cbtoken = await CBToken.deployed();
    cbtokenSale = await CBTokenSale.deployed();
    tokenPrice = await cbtokenSale.tokenPrice();
  });

  describe("deployment", async () => {
    it("deploys successfully", async () => {
      addressTokenContract = await cbtokenSale.address;
      assert.notEqual(addressTokenContract, 0x0);
      assert.notEqual(addressTokenContract, "");
      assert.notEqual(addressTokenContract, null);
      assert.notEqual(addressTokenContract, undefined);
    });

    it("has a token contract", async () => {
      const address = await cbtokenSale.tokenContract();
      assert.notEqual(address, 0x0);
    });

    it("has price token", async () => {
      assert.equal(tokenPrice, 1000000000000000, "priceToken correct");
    });

    it("set token sale available", async () => {
      const result = (
        await cbtoken.transfer(addressTokenContract, 7500000, {
          from: admin,
        })
      ).logs[0].args;
      const balanceContract = +(await cbtoken.balanceOf(addressTokenContract));
      assert.equal(+result._value, balanceContract, "balance sale correct");
    });

    it("send token to buyer", async () => {
      const numberOfTokens = 250;
      const tokens = numberOfTokens * tokenPrice;
      const result = (
        await cbtokenSale.buyTokens(250, {
          from: buyer,
          value: tokens,
        })
      ).logs[0].args;
      assert.equal(+result.balanceOfBuyer, 250, "balance buyer correct");
      assert.equal(+result.tokenSold, 250, "token sold correct");
    });

    it("end sale", async () => {
      const result = (
        await cbtokenSale.endSale({
          from: admin,
          value: 0,
        })
      ).logs[0].args;

      assert.equal(+result.balanceContract, 0, "balance contract correct");
      assert.equal(
        +result.balanceSold,
        web3.utils.toWei("0.25", "Ether"),
        "balance sold correct"
      );
      assert.equal(+result.tokenContract, 0, "token contract correct");
    });
  });
});
