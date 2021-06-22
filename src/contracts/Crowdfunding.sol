// SPDX-License-Identifier: GPL-3.0

import "./CBToken.sol";

pragma solidity >=0.7.0 <0.9.0;

contract Crowdfunding {
    address admin;
    string public name;
    uint256 public projectCount = 0;
    address[] accountsList;
    CBToken public tokenContract;

    mapping(address => Account) public accounts;

    //address = address owner, uint = idProject;
    mapping(address => mapping(uint256 => Project)) public projects;

    mapping(uint256 => DetailProject) public detailProjects;
    //uint = idProject, uint = idStateProject;
    mapping(uint256 => mapping(uint256 => StateProject)) public stateProjects;

    //uint = idProject, address = address rase;
    mapping(uint256 => mapping(address => uint256)) public rases;

    //---------------struct-------------------
    struct Project {
        uint256 id;
        address owner;
        string name;
        uint256 amount;
        bool isApprove;
        bool isFinished;
        bool isCreated;
        uint256 state;
        uint256 rased;
        uint256 coinReceipt;
        uint256 stateCount;
    }

    struct DetailProject {
        string desc;
        uint256 startDate;
        uint256 endDate;
        address[] investors;
    }

    struct StateProject {
        uint256 endDate;
        uint256 percentApproved;
        uint256 percentRemoved;
        bool isApprove;
        bool isCreated;
        mapping(address => bool) voted;
    }

    struct Account {
        string name;
        string email;
        string password;
        string accountType;
        bool isReg;
        uint256[] projects;
    }

    //---------------event-------------------
    event CreatedAccount(
        string name,
        string email,
        string password,
        string accountType,
        bool isReg
    );

    event CreateProject(
        uint256 id,
        string name,
        uint256 amount,
        uint256 ownerProjectLength
    );

    event CreateStateProject(
        uint256 endDate,
        bool isApprove,
        uint256 stateCount
    );

    event SetApproveProject(bool isApprove);

    event SetFinishProject(bool isFinish, uint256 state);

    event ChangeStateProject(uint256 state);

    event SetApproveStateProject(uint256 coinReceipt, uint256 balanceContract);

    event RemoveProject(uint256 refunc);

    event FundProject(
        uint256 amount,
        uint256 rased,
        uint256 payment,
        uint256 balanceContract
    );

    event SetInvestorApproved(
        address investor,
        uint256 iPproject,
        address owner,
        uint256 percent
    );

    event SetInvestorRejected(
        address investor,
        uint256 project,
        address owner,
        uint256 percent
    );

    constructor(CBToken _tokenContract) {
        admin = msg.sender;
        tokenContract = _tokenContract;
        name = "Crowdfunding";
    }

    //---------------function-------------------

    function getAccountList() public view returns (address[] memory) {
        return accountsList;
    }

    function getProjects() public view returns (uint256[] memory) {
        return accounts[msg.sender].projects;
    }

    function getInvestor(uint256 idProject)
        public
        view
        returns (address[] memory)
    {
        return detailProjects[idProject].investors;
    }

    function checkVoted(uint256 idProject, address owner)
        public
        view
        returns (bool voted)
    {
        Project storage project = projects[owner][idProject];
        require(project.isApprove);
        return stateProjects[idProject][project.state].voted[msg.sender];
    }

    //---------------Startup--------------------
    function createAccountStartup(
        string memory _name,
        string memory _password,
        string memory _email
    ) public {
        require(bytes(_name).length > 0);
        require(bytes(_email).length > 0);
        require(bytes(_password).length > 0);
        require(!accounts[msg.sender].isReg);

        Account storage account = accounts[msg.sender];

        account.name = _name;
        account.email = _email;
        account.password = _password;
        account.accountType = "Startup";
        account.isReg = true;

        accounts[msg.sender] = account;

        accountsList.push(msg.sender);

        emit CreatedAccount(
            accounts[msg.sender].name,
            accounts[msg.sender].email,
            accounts[msg.sender].password,
            accounts[msg.sender].accountType,
            accounts[msg.sender].isReg
        );
    }

    function createProject(
        string memory _name,
        string memory _desc,
        uint256 _startDate,
        uint256 _endDate,
        uint256 amount
    ) public {
        require(bytes(_name).length > 0);
        require(bytes(_desc).length > 0);
        require(_startDate > 0);
        require(_endDate > 0);
        require(amount > 0);

        require(!projects[msg.sender][projectCount + 1].isCreated);
        require(msg.sender != address(0x0));

        projectCount++;

        Project storage p = projects[msg.sender][projectCount];

        p.id = projectCount;
        p.owner = (msg.sender);
        p.name = _name;
        p.amount = amount;
        p.isApprove = false;
        p.isFinished = false;
        p.isCreated = true;
        p.state = 0;
        p.rased = 0;
        p.stateCount = 0;
        p.coinReceipt = 0;

        DetailProject storage dp = detailProjects[p.id];
        dp.desc = _desc;
        dp.startDate = _startDate;
        dp.endDate = _endDate;

        detailProjects[p.id] = dp;
        projects[msg.sender][projectCount] = p;
        accounts[msg.sender].projects.push(p.id);

        emit CreateProject(
            p.id,
            p.name,
            p.amount,
            accounts[msg.sender].projects.length
        );
    }

    //tạo các cột mốc cho dự án (startup)
    function createStateProject(uint256 idProject, uint256[] memory endDate)
        public
    {
        //check project exists
        require(projects[msg.sender][idProject].isCreated);

        Project storage target = projects[msg.sender][idProject];
        projects[msg.sender][idProject].stateCount = 0;
        for (uint256 i = 1; i <= endDate.length; i += 1) {
            StateProject storage sp = stateProjects[target.id][i];

            sp.endDate = endDate[i - 1];
            sp.percentApproved = 0;
            sp.percentRemoved = 0;
            sp.isApprove = false;
            sp.isCreated = true;

            projects[msg.sender][idProject].stateCount += 1;

            emit CreateStateProject(
                sp.endDate,
                sp.isApprove,
                projects[msg.sender][idProject].stateCount
            );
        }
    }

    //thiết lập đã hoàn thành dự án. (startup)
    function setFinishProject(uint256 idProject) public {
        require(projects[msg.sender][idProject].isCreated);
        require(projects[msg.sender][idProject].isApprove);
        require(!projects[msg.sender][idProject].isFinished);
        Project storage target = projects[msg.sender][idProject];
        StateProject storage sp = stateProjects[idProject][target.state];
        if (target.state == target.stateCount && sp.isApprove) {
            target.isFinished = true;
        }
        projects[msg.sender][idProject] = target;

        emit SetFinishProject(target.isFinished, target.state);
    }

    //chuyển đổi qua cột mốc tiếp theo của dự án. (startup)
    function changeStateProject(uint256 idProject) public returns (bool) {
        require(projects[msg.sender][idProject].isCreated);
        require(projects[msg.sender][idProject].isApprove);
        require(!projects[msg.sender][idProject].isFinished);
        bool flag = false;
        Project storage target = projects[msg.sender][idProject];
        if (target.state != 0) {
            StateProject storage sp = stateProjects[target.id][target.state];
            if (sp.isApprove) {
                target.state += 1;
                flag = true;
            }
        } else {
            if (target.rased == target.amount) {
                flag = true;
                target.state += 1;
            }
        }

        projects[msg.sender][idProject] = target;

        emit ChangeStateProject(target.state);

        return flag;
    }

    //hủy bỏ dự án (startup)
    function removeProject(uint256 idProject, address owner) public {
        require(!projects[owner][idProject].isFinished);
        require(projects[owner][idProject].isApprove);
        Project storage target = projects[owner][idProject];
        DetailProject storage detail = detailProjects[idProject];
        uint256 refunc;
        if (
            msg.sender == admin ||
            msg.sender == target.owner ||
            stateProjects[idProject][target.state].percentRemoved >= 51
        )
            for (uint256 i = 0; i < detail.investors.length; i += 1) {
                address investor = detail.investors[i];

                uint256 rased = rases[idProject][investor];
                uint256 payment;
                if (target.rased == target.amount) {
                    uint256 available = target.rased - target.coinReceipt;

                    payment = mul((available * rased), target.amount);
                } else {
                    payment = rased;
                }

                refunc += payment;

                //investor.transfer(payment);
                tokenContract.transfer(investor, payment);
            }

        target.isFinished = true;
        projects[owner][idProject] = target;

        emit RemoveProject(refunc);
    }

    //---------------Investor--------------------

    function mul(uint256 x, uint256 y) public pure returns (uint256 z) {
        uint256 result = x / y;
        uint256 result1 = (x * 10) / y;
        uint256 result2 = result * 10 + 5;
        if (result1 >= result2) {
            result = result + 1;
        }
        return result;
    }

    function createAccountInvestor(
        string memory _name,
        string memory _password,
        string memory _email
    ) public {
        require(bytes(_name).length > 0);
        require(bytes(_email).length > 0);
        require(bytes(_password).length > 0);
        require(!accounts[msg.sender].isReg);

        Account storage account = accounts[msg.sender];

        account.name = _name;
        account.email = _email;
        account.password = _password;
        account.accountType = "Investor";
        account.isReg = true;

        accounts[msg.sender] = account;

        emit CreatedAccount(
            accounts[msg.sender].name,
            accounts[msg.sender].email,
            accounts[msg.sender].password,
            accounts[msg.sender].accountType,
            accounts[msg.sender].isReg
        );
    }

    //chuyển tiền đầu tư đến dự án (investor)
    function fundProject(
        uint256 idProject,
        address owner,
        uint256 amount
    ) public {
        require(projects[owner][idProject].isApprove);
        require(projects[owner][idProject].isCreated);
        require(
            projects[owner][idProject].amount !=
                projects[owner][idProject].rased
        );
        uint256 payment;
        //update rased project
        Project storage p = projects[owner][idProject];
        DetailProject storage dp = detailProjects[p.id];

        if (p.amount - p.rased != 0) {
            if (amount > p.amount - p.rased) {
                payment = p.amount - p.rased;

                //payable(msg.sender).transfer(amount - payment);
            } else {
                payment = amount;
                //tokenContract.transferFrom(msg.sender, address(this), payment);
                //payable(msg.sender).transfer(0);
            }
            tokenContract.transferFrom(msg.sender, address(this), payment);
            if (rases[p.id][msg.sender] == 0) {
                dp.investors.push((msg.sender));
            }

            p.rased += payment;

            rases[idProject][msg.sender] += payment;

            projects[owner][idProject] = p;
        }

        emit FundProject(
            p.amount,
            p.rased,
            payment,
            tokenContract.balanceOf(address(this))
        );
    }

    //---------------Admin--------------------
    //chấp nhận những dự án đã tạo cột mốc.(admin)
    function setApproveProject(uint256 idProject, address owner) public {
        require(msg.sender == admin);
        require(projects[owner][idProject].isCreated);
        require(!projects[owner][idProject].isFinished);
        require(projects[owner][idProject].stateCount > 0);

        Project storage target = projects[owner][idProject];

        if (target.stateCount >= 3) {
            target.isApprove = true;
        }

        projects[owner][idProject] = target;

        emit SetApproveProject(target.isApprove);
    }

    //chấp nhận cột mốc tiếp theo của dự án (admin)
    function setApproveStateProject(uint256 idProject, address owner) public {
        require(projects[owner][idProject].isCreated);
        require(!projects[owner][idProject].isFinished);
        require(projects[owner][idProject].stateCount > 0);

        Project storage target = projects[owner][idProject];
        require((!stateProjects[idProject][target.state].isApprove));
        uint256 coinReceipt;
        if (
            !stateProjects[idProject][target.state].isApprove &&
            stateProjects[idProject][target.state].percentApproved > 51
        ) {
            if (target.state != target.stateCount) {
                coinReceipt = mul(target.amount, target.stateCount);
                target.coinReceipt += coinReceipt;
            } else {
                coinReceipt = target.rased - target.coinReceipt;
                target.coinReceipt = target.rased;
            }

            stateProjects[idProject][target.state].isApprove = true;
            projects[owner][idProject] = target;

            tokenContract.transfer(target.owner, coinReceipt);
        }

        emit SetApproveStateProject(
            target.coinReceipt,
            tokenContract.balanceOf(address(this))
        );
    }

    function setInvestorApproved(uint256 idProject, address owner) public {
        require(projects[owner][idProject].isCreated);
        require(!projects[owner][idProject].isFinished);
        require(projects[owner][idProject].stateCount > 0);

        Project storage target = projects[owner][idProject];
        require((!stateProjects[idProject][target.state].isApprove));

        StateProject storage state = stateProjects[idProject][target.state];
        require(!state.voted[msg.sender]);
        uint256 rased = rases[idProject][msg.sender];

        uint256 percentRase = mul((rased * 100), target.amount);

        state.percentApproved += percentRase;

        state.voted[msg.sender] = true;

        emit SetInvestorApproved(
            msg.sender,
            idProject,
            owner,
            state.percentApproved
        );
        setApproveStateProject(idProject, owner);
    }

    function setInvestorRejected(uint256 idProject, address owner) public {
        require(projects[owner][idProject].isCreated);
        require(!projects[owner][idProject].isFinished);
        require(projects[owner][idProject].stateCount > 0);

        Project storage target = projects[owner][idProject];
        require((!stateProjects[idProject][target.state].isApprove));

        StateProject storage state = stateProjects[idProject][target.state];
        require(!state.voted[msg.sender]);
        uint256 rased = rases[idProject][msg.sender];

        uint256 percentRase = mul((rased * 100), target.amount);

        state.percentRemoved += percentRase;

        state.voted[msg.sender] = true;

        emit SetInvestorRejected(
            msg.sender,
            idProject,
            owner,
            state.percentRemoved
        );

        removeProject(idProject, owner);
    }
}
