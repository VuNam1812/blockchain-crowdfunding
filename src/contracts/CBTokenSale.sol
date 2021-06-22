// SPDX-License-Identifier: GPL-3.0

import "./CBToken.sol";

pragma solidity >=0.7.0 <0.9.0;

contract CBTokenSale {
    address public admin;
    CBToken public tokenContract;
    uint256 public tokenPrice;
    uint256 public tokenSold;
    uint256 public currentTokenSale;

    event BuyTokens(uint256 balanceOfBuyer, uint256 tokenSold);

    event SetTokenSale(uint256 balanceOfContract);

    event EndSale(
        uint256 balanceContract,
        uint256 balanceSold,
        uint256 tokenContract
    );

    constructor(CBToken _tokenContract, uint256 _price) {
        admin = msg.sender;
        tokenContract = _tokenContract;
        tokenPrice = _price;
    }

    function setCurrentTokenSale(uint256 _amount) public {
        require(msg.sender == admin);

        currentTokenSale = _amount;
    }

    function multiply(uint256 x, uint256 y) internal pure returns (uint256 z) {
        require(y == 0 || (z = x * y) / y == x);
    }

    function buyTokens(uint256 _tokens) public payable returns (bool result) {
        require(msg.value == multiply(_tokens, tokenPrice));
        require(tokenContract.balanceOf(address(this)) >= _tokens);
        require(tokenContract.transfer(msg.sender, _tokens));

        tokenSold += _tokens;

        emit BuyTokens(tokenContract.balanceOf(msg.sender), tokenSold);

        payable(admin).transfer(0);

        return true;
    }

    function endSale() public payable {
        require(msg.sender == admin);
        require(
            tokenContract.transfer(
                admin,
                tokenContract.balanceOf(address(this))
            )
        );
        uint256 balanceContract = address(this).balance;
        payable(admin).transfer(address(this).balance);

        tokenSold = 0;
        currentTokenSale = 0;

        emit EndSale(
            address(this).balance,
            balanceContract,
            tokenContract.balanceOf(address(this))
        );
    }
}
