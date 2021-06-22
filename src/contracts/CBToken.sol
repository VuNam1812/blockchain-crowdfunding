// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

contract CBToken {
    string public name = "Crowdfunding by Blockchain Token";
    string public symbol = "CBT";
    uint256 public totalSupply;
    uint256 public tokenPrice = 1000000000000000;
    address owner;
    event Transfer(address _from, address _to, uint256 _value);

    event Approval(address _owner, address _spender, uint256 _value);

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    constructor(uint256 _initialSupply) {
        balanceOf[msg.sender] = _initialSupply;
        totalSupply = _initialSupply;
        owner = msg.sender;
    }

    function transfer(address _to, uint256 _value)
        public
        payable
        returns (bool result)
    {
        require(balanceOf[msg.sender] >= _value);

        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;

        emit Transfer(msg.sender, _to, balanceOf[_to]);
        return true;
    }

    //limit spender use token
    function approve(address _spender, uint256 _value)
        public
        returns (bool result)
    {
        allowance[msg.sender][_spender] = _value;

        emit Approval(msg.sender, _spender, allowance[msg.sender][_spender]);

        return true;
    }

    //spender use to transfer
    function transferFrom(
        address _from,
        address _to,
        uint256 _value
    ) public payable returns (bool result) {
        require(balanceOf[_from] >= _value);
        require(allowance[_from][msg.sender] >= _value);

        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;

        allowance[_from][msg.sender] -= _value;

        emit Transfer(_from, _to, allowance[_from][msg.sender]);

        return true;
    }
}
