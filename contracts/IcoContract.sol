// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./AdminManager.sol";

interface IERC20 {
    function decimals() external view returns (uint8);
    function transfer(address, uint256) external returns (bool);
    function transferFrom(address, address, uint256) external returns (bool);
    function balanceOf(address) external view returns (uint256);
}

contract ICOContract {
    address public superAdmin;
    IERC20 public paymentToken; // USDT
    IERC20 public icoToken;
    uint256 public tokenPrice; 
    uint8 public priceDecimals = 6;

    uint256 public totalTokensSold;
    bool public paused;

    AdminManager public adminManager;

    event TokensPurchased(address indexed buyer, uint256 amount, uint256 paymentAmount);
    event TokensWithdrawn(address indexed admin, uint256 amount);
    event EmergencyWithdraw(uint256 tokenAmount, uint256 paymentAmount);

    modifier onlySuperAdmin() {
        require(msg.sender == superAdmin, "Only super admin");
        _;
    }

    modifier onlyAdmin() {
        require(adminManager.isAdmin(msg.sender), "Only admin");
        _;
    }

    modifier whenNotPaused() {
        require(!paused, "Paused");
        _;
    }

    constructor(
        address _paymentToken, 
        address _icoToken, 
        uint256 _tokenPrice,
        address _adminManager
    ) {
        require(_paymentToken != address(0), "Invalid payment token");
        require(_icoToken != address(0), "Invalid ICO token");
        require(_adminManager != address(0), "Invalid admin manager");
        require(_tokenPrice > 0, "Price must > 0");

        superAdmin = msg.sender;
        paymentToken = IERC20(_paymentToken);
        icoToken = IERC20(_icoToken);
        tokenPrice = _tokenPrice;
        adminManager = AdminManager(_adminManager);
    }

    function buyTokens(uint256 _paymentAmount) external whenNotPaused {
        require(_paymentAmount > 0, "Amount = 0");
        uint8 payDecimals = paymentToken.decimals();
        uint8 icoDecimals = icoToken.decimals();

        uint256 normalizedPayment = _paymentAmount * (10**priceDecimals) / (10**payDecimals);
        uint256 tokensToBuy = (normalizedPayment * (10**icoDecimals)) / tokenPrice;

        require(tokensToBuy > 0, "Too small");

        // استلام USDT من المشتري
        require(paymentToken.transferFrom(msg.sender, address(this), _paymentAmount), "Payment failed");

        // توزيع المبلغ على الإدمنز بالتساوي
        address[] memory admins = adminManager.getAdmins();
        require(admins.length > 0, "No admins available");

        uint256 share = _paymentAmount / admins.length;

        for (uint256 i = 0; i < admins.length; i++) {
            require(paymentToken.transfer(admins[i], share), "Admin transfer failed");
        }

        // إرسال التوكنز للمشتري
        require(icoToken.transfer(msg.sender, tokensToBuy), "ICO transfer failed");

        totalTokensSold += tokensToBuy;
        emit TokensPurchased(msg.sender, tokensToBuy, _paymentAmount);
    }

    function withdrawRemainingTokens(uint256 _amount) external onlySuperAdmin {
        require(icoToken.balanceOf(address(this)) >= _amount, "Insufficient");
        require(icoToken.transfer(superAdmin, _amount), "Token withdraw failed");
        emit TokensWithdrawn(superAdmin, _amount);
    }

    function emergencyWithdraw() external onlySuperAdmin {
        uint256 t = icoToken.balanceOf(address(this));
        uint256 p = paymentToken.balanceOf(address(this));

        if (t > 0) icoToken.transfer(superAdmin, t);
        if (p > 0) paymentToken.transfer(superAdmin, p);

        emit EmergencyWithdraw(t,p);
    }

    function pause(bool _pause) external onlySuperAdmin {
        paused = _pause;
    }

    function updateTokenPrice(uint256 _newPrice) external onlySuperAdmin {
        require(_newPrice > 0, "Price must > 0");
        tokenPrice = _newPrice;
    }

    function getTokenBalance() external view returns (uint256) {
        return icoToken.balanceOf(address(this));
    }

    function getUSDTBalance() external view returns (uint256) {
        return paymentToken.balanceOf(address(this));
    }
}
