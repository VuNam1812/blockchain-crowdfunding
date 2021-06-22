const { assert } = require("chai");
const web3 = require("web3");
const Crowdfunding = artifacts.require("./Crowdfunding.sol");
const CBToken = artifacts.require("./CBToken.sol");
require("chai").use(require("chai-as-promised")).should();

contract("Crowdfunding", ([admin, startup, investor, investor2]) => {
  let crowdfunding, cbtoken;
  let address;
  let tokenPrice;

  before(async () => {
    cbtoken = await CBToken.deployed();
    crowdfunding = await Crowdfunding.deployed();
    tokenPrice = await cbtoken.tokenPrice();
  });

  describe("deployment", async () => {
    it("deploys successfully", async () => {
      address = await crowdfunding.address;
      assert.notEqual(address, 0x0);
      assert.notEqual(address, "");
      assert.notEqual(address, null);
      assert.notEqual(address, undefined);
    });

    it("has same address", async () => {
      const tokenContract = await crowdfunding.tokenContract();
      assert.equal(tokenContract, cbtoken.address, "address correct");
    });

    it("has a name", async () => {
      const name = await crowdfunding.name();
      assert.equal(name, "Crowdfunding");
    });
  });

  describe("accounts", async () => {
    let result_startup, result_investor;

    before(async () => {
      result_startup = await crowdfunding.createAccountStartup(
        "Startup one",
        "vunam123",
        "startup_one@gmail.com",
        { from: startup }
      );
      result_investor = await crowdfunding.createAccountInvestor(
        "Investor one",
        "vunam123",
        "investor_one@gmail.com",
        { from: investor }
      );
    });

    it("create account startup successfully", async () => {
      //SUCCESS
      const event = result_startup.logs[0].args;

      assert.equal(event.name, "Startup one", "name is correct");
      assert.equal(event.password, "vunam123", "password is correct");
      assert.equal(event.email, "startup_one@gmail.com", "email is correct");
      assert.equal(event.accountType, "Startup", "account type correct");
      assert.equal(event.isReg, true, "registed");
      //FAUL
      await await crowdfunding.createAccountStartup(
        "",
        "vunam123",
        "startup_one@gmail.com",
        { from: startup }
      ).should.be.rejected;
      await await crowdfunding.createAccountStartup(
        "Startup one",
        "",
        "startup_one@gmail.com",
        { from: startup }
      ).should.be.rejected;
      await await crowdfunding.createAccountStartup(
        "Startup one",
        "vunam123",
        "",
        { from: startup }
      ).should.be.rejected;
    });

    it("create account investor successfully", async () => {
      //SUCCESS
      const event = result_investor.logs[0].args;
      assert.equal(event.name, "Investor one", "name is correct");
      assert.equal(event.password, "vunam123", "password is correct");
      assert.equal(event.email, "investor_one@gmail.com", "email is correct");
      assert.equal(event.accountType, "Investor", "account type correct");
      assert.equal(event.isReg, true, "registed");
      //FAUL
      await await crowdfunding.createAccountInvestor(
        "",
        "vunam123",
        "investor_one@gmail.com",
        { from: investor }
      ).should.be.rejected;
      await await crowdfunding.createAccountInvestor(
        "Investor one",
        "",
        "investor_one@gmail.com",
        { from: investor }
      ).should.be.rejected;
      await await crowdfunding.createAccountInvestor(
        "Investor one",
        "vunam123",
        "",
        { from: investor }
      ).should.be.rejected;
    });
  });

  describe("projects", async () => {
    let result, projectCount;

    before(async () => {
      result = await crowdfunding.createProject(
        "Project 1",
        "vunam123",
        1623516270328,
        1624986000000,
        web3.utils.toWei("12", "Ether") / tokenPrice,
        { from: startup }
      );

      await crowdfunding.createProject(
        "Project 2",
        "vunam123",
        1623516270328,
        1624986000000,
        web3.utils.toWei("18", "Ether") / tokenPrice,
        { from: startup }
      );

      projectCount = await crowdfunding.projectCount();
    });

    it("create project successfully", async () => {
      assert.equal(projectCount, 2);

      //SUCCESS
      const event = result.logs[0].args;
      assert.equal(
        event.id.toNumber(),
        projectCount.toNumber() - 1,
        "id is correct"
      );
      assert.equal(event.name, "Project 1", "name is correct");
      assert.equal(
        event.amount,
        web3.utils.toWei("12", "Ether") / tokenPrice,
        "amout is correct"
      );
      assert.equal(event.ownerProjectLength.toNumber(), 1, "idProject correct");
      //FAUL
      await await crowdfunding.createProject(
        "",
        "vunam123",
        1623516270328,
        1624986000000,
        web3.utils.toWei("12", "Ether"),
        { from: startup }
      ).should.be.rejected;
      await await crowdfunding.createProject(
        "Project 1",
        "",
        1623516270328,
        1624986000000,
        web3.utils.toWei("12", "Ether"),
        { from: startup }
      ).should.be.rejected;
      await await crowdfunding.createProject(
        "Project 1",
        "vunam123",
        0,
        1624986000000,
        web3.utils.toWei("12", "Ether"),
        { from: startup }
      ).should.be.rejected;
      await await crowdfunding.createProject(
        "Project 1",
        "vunam123",
        1623516270328,
        0,
        web3.utils.toWei("12", "Ether"),
        { from: startup }
      ).should.be.rejected;
      await await crowdfunding.createProject(
        "Project 1",
        "vunam123",
        1623516270328,
        1624986000000,
        web3.utils.toWei("0", "Ether"),
        { from: startup }
      ).should.be.rejected;
    });

    it("create State Project", async () => {
      let result = await crowdfunding.createStateProject(
        1,
        [1624122000000, 1624222000000, 1624322000000],
        {
          from: startup,
        }
      );

      assert.equal(result.logs[0].args.stateCount, 1, "state count correct");
      assert.equal(result.logs[1].args.stateCount, 2, "state count correct");
      assert.equal(result.logs[2].args.stateCount, 3, "state count correct");
      assert.equal(
        result.logs[0].args.endDate.toNumber(),
        1624122000000,
        "end date correct"
      );
      assert.equal(
        result.logs[1].args.endDate.toNumber(),
        1624222000000,
        "end date correct"
      );
      assert.equal(
        result.logs[2].args.endDate.toNumber(),
        1624322000000,
        "end date correct"
      );
      assert.equal(result.logs[0].args.isApprove, false, "isApprove correct");
      assert.equal(result.logs[1].args.isApprove, false, "isApprove correct");
      assert.equal(result.logs[2].args.isApprove, false, "isApprove correct");
      await crowdfunding.createStateProject(
        2,
        [1624122000000, 1624222000000, 1624322000000],
        {
          from: startup,
        }
      );
    });

    it("set approve project", async () => {
      let result = (
        await crowdfunding.setApproveProject(1, startup, { from: admin })
      ).logs[0].args;
      assert.equal(result.isApprove, true, "is Approve correct");

      await crowdfunding.setApproveProject(2, startup, { from: admin });
    });

    it("change state project false (not enought rased)", async () => {
      let result = (await crowdfunding.changeStateProject(1, { from: startup }))
        .logs[0].args;

      assert.equal(result.state.toNumber(), 0, "state correct");
    });

    it("fund project", async () => {
      //send Token
      await cbtoken.transfer(investor, 50000, { from: admin });
      await cbtoken.transfer(investor2, 50000, { from: admin });
      await cbtoken.approve(crowdfunding.address, 50000, { from: investor });
      await cbtoken.approve(crowdfunding.address, 50000, { from: investor2 });
      let result = (
        await crowdfunding.fundProject(
          1,
          startup,
          web3.utils.toWei("6", "Ether") / tokenPrice,
          { from: investor }
        )
      ).logs[0].args;

      assert.equal(
        +result.amount,
        web3.utils.toWei("12", "Ether") / tokenPrice,
        "amount correct"
      );
      assert.equal(
        +result.rased,
        web3.utils.toWei("6", "Ether") / tokenPrice,
        "rased correct"
      );
      assert.equal(
        +result.payment,
        web3.utils.toWei("6", "Ether") / tokenPrice,
        "payment correct"
      );
      assert.equal(
        +result.balanceContract,
        web3.utils.toWei("6", "Ether") / tokenPrice,
        "balance correct"
      );

      result = (
        await crowdfunding.fundProject(
          1,
          startup,
          web3.utils.toWei("8", "Ether") / tokenPrice,
          { from: investor }
        )
      ).logs[0].args;

      assert.equal(
        +result.amount,
        web3.utils.toWei("12", "Ether") / tokenPrice,
        "amount correct"
      );
      assert.equal(
        +result.rased,
        web3.utils.toWei("12", "Ether") / tokenPrice,
        "rased correct"
      );
      assert.equal(
        +result.payment,
        web3.utils.toWei("6", "Ether") / tokenPrice,
        "payment correct"
      );

      assert.equal(
        +result.balanceContract,
        web3.utils.toWei("12", "Ether") / tokenPrice,
        "balance correct"
      );
      await crowdfunding.fundProject(
        2,
        startup,
        web3.utils.toWei("10", "Ether") / tokenPrice,
        { from: investor }
      );
      await crowdfunding.fundProject(
        2,
        startup,
        web3.utils.toWei("8", "Ether") / tokenPrice,
        { from: investor2 }
      );
    });

    it("change state project success (after rased)", async () => {
      let result = (await crowdfunding.changeStateProject(1, { from: startup }))
        .logs[0].args;

      assert.equal(result.state.toNumber(), 1, "state correct");

      await crowdfunding.changeStateProject(2, { from: startup });
    });

    it("set approve state current project by investor", async () => {
      let result = await crowdfunding.setInvestorApproved(1, startup, {
        from: investor,
      });
      assert.equal(result.logs[0].args.investor, investor, "investor correct");
      assert.equal(+result.logs[0].args.iPproject, 1, "project correct");
      assert.equal(result.logs[0].args.owner, startup, "startup correct");
      assert.equal(+result.logs[0].args.percent, 100, "percent correct");

      assert.equal(
        +result.logs[1].args.coinReceipt,
        web3.utils.toWei("4", "Ether") / tokenPrice,
        "coinReceipt correct"
      );
      assert.equal(
        +result.logs[1].args.balanceContract,
        web3.utils.toWei("26", "Ether") / tokenPrice,
        "coinReceipt correct"
      );

      result = await crowdfunding.setInvestorApproved(2, startup, {
        from: investor2,
      });

      assert.equal(result.logs[0].args.investor, investor2, "investor correct");
      assert.equal(+result.logs[0].args.iPproject, 2, "project correct");
      assert.equal(result.logs[0].args.owner, startup, "startup correct");
      assert.equal(+result.logs[0].args.percent, 44, "percent correct");

      const isApproved = await crowdfunding.stateProjects(2, 1);
      const voted = await crowdfunding.checkVoted(2, startup, {
        from: investor2,
      });
      //approve fail
      assert.equal(isApproved.isApprove, false, "approve correct");
      assert.equal(voted, true, "voted correct");
      await crowdfunding.setInvestorApproved(2, startup, {
        from: investor,
      });
    });

    it("change next state project success (after approve)", async () => {
      let result = (await crowdfunding.changeStateProject(1, { from: startup }))
        .logs[0].args;

      assert.equal(+result.state, 2, "state correct");
      result = (await crowdfunding.changeStateProject(2, { from: startup }))
        .logs[0].args;
    });

    it("remove project", async () => {
      let result = (
        await crowdfunding.removeProject(2, startup, {
          from: startup,
        })
      ).logs[0].args;

      assert.equal(
        +result.refunc,
        web3.utils.toWei("12", "Ether") / tokenPrice,
        "refunc money correct"
      );
    });

    it("set finish project", async () => {
      let result;
      await crowdfunding.setInvestorApproved(1, startup, {
        from: investor,
      });
      await crowdfunding.changeStateProject(1, { from: startup });

      result = (await crowdfunding.setFinishProject(1, { from: startup }))
        .logs[0].args;
      assert.equal(result.isFinish, false, "isFinish correct");
      assert.equal(+result.state, 3, "state correct");

      await crowdfunding.setInvestorApproved(1, startup, {
        from: investor,
      });
      result = (await crowdfunding.setFinishProject(1, { from: startup }))
        .logs[0].args;
      assert.equal(result.isFinish, true, "isFinish correct");
      assert.equal(+result.state, 3, "state correct");
    });
  });
});
