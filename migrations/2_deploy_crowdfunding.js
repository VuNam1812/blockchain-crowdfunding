const Crowdfunding = artifacts.require("Crowdfunding");
const CBToken = artifacts.require("CBToken");
const CBTokenSale = artifacts.require("CBTokenSale");

module.exports = function (deployer) {
  deployer
    .deploy(CBToken, 10000000)
    .then(() => {
      //price: 0.001 Eth
      const price = 1000000000000000;

      return deployer.deploy(CBTokenSale, CBToken.address, price);
    })
    .then(() => {
      return deployer.deploy(Crowdfunding, CBToken.address);
    });
};
