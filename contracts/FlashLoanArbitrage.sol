// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@aave/core-v3/contracts/flashloan/base/FlashLoanSimpleReceiverBase.sol";
import "@aave/core-v3/contracts/interfaces/IPoolAddressesProvider.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IUniswapV2Router {
    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);
}

contract FlashLoanArbitrage is FlashLoanSimpleReceiverBase, Ownable {
    address public tokenA;
    address public tokenB;
    address public dex1;
    address public dex2;

    constructor(
        address _provider,
        address _tokenA,
        address _tokenB,
        address _dex1,
        address _dex2
    ) FlashLoanSimpleReceiverBase(IPoolAddressesProvider(_provider)) {
        tokenA = _tokenA;
        tokenB = _tokenB;
        dex1 = _dex1;
        dex2 = _dex2;
    }

    function executeOperation(
        address asset,
        uint256 amount,
        uint256 premium,
        address initiator,
        bytes calldata
    ) external override returns (bool) {
        require(msg.sender == address(POOL), "Only Aave pool can call");
        require(initiator == address(this), "Unauthorized");

        // Approve tokens for both routers
        IERC20(asset).approve(dex1, amount);
        IERC20(tokenB).approve(dex2, type(uint256).max);

        address ;
        path1[0] = tokenA;
        path1[1] = tokenB;

        address ;
        path2[0] = tokenB;
        path2[1] = tokenA;

        // Swap on DEX1
        uint[] memory output1 = IUniswapV2Router(dex1).swapExactTokensForTokens(
            amount,
            1,
            path1,
            address(this),
            block.timestamp
        );

        // Swap back on DEX2
        uint[] memory output2 = IUniswapV2Router(dex2).swapExactTokensForTokens(
            output1[1],
            1,
            path2,
            address(this),
            block.timestamp
        );

        uint256 totalOwed = amount + premium;
        require(output2[1] > totalOwed, "No arbitrage profit");

        // Repay flash loan
        IERC20(asset).approve(address(POOL), totalOwed);

        // Keep the profit
        uint256 profit = output2[1] - totalOwed;
        IERC20(asset).transfer(owner(), profit);

        return true;
    }

    function initiateFlashLoan(address _token, uint256 _amount) external onlyOwner {
        POOL.flashLoanSimple(address(this), _token, _amount, "", 0);
    }

    function rescueFunds(address _token) external onlyOwner {
        uint256 bal = IERC20(_token).balanceOf(address(this));
        require(IERC20(_token).transfer(msg.sender, bal), "Transfer failed");
    }
}
