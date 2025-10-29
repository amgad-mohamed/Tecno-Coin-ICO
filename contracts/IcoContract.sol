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

    mapping(address => bool) public allowedPaymentTokens;

    IERC20 public icoToken;
    uint256 public tokenPrice; 
    uint8 public priceDecimals = 6;
    uint256 public rewardPercent = 1; 
    AdminManager public adminManager;

    uint256 public totalTokensSold;
    bool public paused;

    address public stakingContract;

    // 🆕 قائمة العناوين التي يتم التحويل إليها بالتتابع
    address[] public receivers;
    uint256 public currentReceiverIndex;

    // 📢 Events
    event TokensPurchased(
        address indexed buyer,
        uint256 tokensBought,
        uint256 reward,
        uint256 paymentAmount,
        address paymentToken
    );
    event TokensWithdrawn(address indexed admin, uint256 amount);
    event EmergencyWithdraw(uint256 tokenAmount);
    event RewardPercentUpdated(uint256 newPercent);
    event PaymentTokenAllowed(address token, bool allowed);
    event StakingContractSet(address indexed staking);
    event ReceiverAdded(address indexed receiver, uint256 index);
    event ReceiverRemoved(address indexed receiver);
    event ReceiverListCleared();

    // 🔒 Modifiers
    modifier onlyAdmin() {
        require(adminManager.isAdmin(msg.sender), "Only admin");
        _;
    }

    modifier onlyFromStaking() {
        require(msg.sender == stakingContract, "Only staking contract");
        _;
    }

    modifier whenNotPaused() {
        require(!paused, "Paused");
        _;
    }

    // ⚙️ Constructor
    constructor(
        address[] memory _paymentTokens,
        address _icoToken,
        uint256 _tokenPrice,
        address _adminManager
    ) {
        require(_icoToken != address(0), "Invalid ICO token");
        require(_adminManager != address(0), "Invalid admin manager");
        require(_tokenPrice > 0, "Price must > 0");

        superAdmin = msg.sender;

        for (uint256 i = 0; i < _paymentTokens.length; i++) {
            if (_paymentTokens[i] != address(0)) {
                allowedPaymentTokens[_paymentTokens[i]] = true;
                emit PaymentTokenAllowed(_paymentTokens[i], true);
            }
        }

        icoToken = IERC20(_icoToken);
        tokenPrice = _tokenPrice;
        adminManager = AdminManager(_adminManager);
    }

    // 🧩 إدارة العملات المسموح بها
    function addPaymentToken(address token) external onlyAdmin {
        require(token != address(0), "Invalid token");
        allowedPaymentTokens[token] = true;
        emit PaymentTokenAllowed(token, true);
    }

    function removePaymentToken(address token) external onlyAdmin {
        require(token != address(0), "Invalid token");
        allowedPaymentTokens[token] = false;
        emit PaymentTokenAllowed(token, false);
    }

    // 🔗 تعيين عقد الـ Staking
    function setStakingContract(address _staking) external onlyAdmin {
        require(_staking != address(0), "Invalid staking");
        stakingContract = _staking;
        emit StakingContractSet(_staking);
    }

    // ⚖️ تعديل نسبة المكافأة من قبل الأدمن
    function setRewardPercent(uint256 _percent) external onlyAdmin {
        require(_percent <= 100, "Max 100%");
        rewardPercent = _percent;
        emit RewardPercentUpdated(_percent);
    }

    // 🔄 تحديث السعر من عقد الـ Staking
    function setTokenPriceFromStaking(uint256 _newPrice) external onlyFromStaking {
        require(_newPrice > 0, "Price > 0");
        tokenPrice = _newPrice;
    }

    // 🔄 تحديث نسبة المكافأة من عقد الـ Staking
    function setRewardPercentFromStaking(uint256 _percent) external onlyFromStaking {
        require(_percent <= 100, "Max 100%");
        rewardPercent = _percent;
        emit RewardPercentUpdated(_percent);
    }

    // 🆕 إدارة قائمة المستلمين (Receivers)
    function addReceiver(address _receiver) external onlyAdmin {
        require(_receiver != address(0), "Invalid address");
        receivers.push(_receiver);
        emit ReceiverAdded(_receiver, receivers.length - 1);
    }

    function removeReceiver(uint256 index) external onlyAdmin {
        require(index < receivers.length, "Index OOB");
        address removed = receivers[index];
        receivers[index] = receivers[receivers.length - 1];
        receivers.pop();
        emit ReceiverRemoved(removed);
        if (currentReceiverIndex >= receivers.length && receivers.length > 0) {
            currentReceiverIndex = 0;
        }
    }

    function clearReceivers() external onlyAdmin {
        delete receivers;
        currentReceiverIndex = 0;
        emit ReceiverListCleared();
    }

    function getReceivers() external view returns (address[] memory) {
        return receivers;
    }

    // 🧠 helper لاختيار المستلم التالي بالتتابع
    function _getNextReceiver() internal returns (address) {
        require(receivers.length > 0, "Receivers not set");
        address receiver = receivers[currentReceiverIndex];
        currentReceiverIndex = (currentReceiverIndex + 1) % receivers.length;
        return receiver;
    }

    // 💰 الشراء باستخدام أي من العملات المسموح بها
    function buyTokens(address paymentTokenAddr, uint256 _paymentAmount) external whenNotPaused {
        require(_paymentAmount > 0, "Amount = 0");
        require(allowedPaymentTokens[paymentTokenAddr], "Payment token not allowed");

        IERC20 paymentToken = IERC20(paymentTokenAddr);

        uint8 payDecimals = paymentToken.decimals();
        uint8 icoDecimals = icoToken.decimals();

        uint256 normalizedPayment = (_paymentAmount * (10 ** priceDecimals)) / (10 ** payDecimals);
        uint256 tokensToBuy = (normalizedPayment * (10 ** icoDecimals)) / tokenPrice;

        require(tokensToBuy > 0, "Too small");
        require(icoToken.balanceOf(address(this)) >= tokensToBuy, "Insufficient ICO tokens");

        // استلام المبلغ من المشتري
        require(paymentToken.transferFrom(msg.sender, address(this), _paymentAmount), "Payment failed");

        // 🌀 التحويل إلى المستلم بالتتابع (round robin)
        address receiver = _getNextReceiver();
        require(paymentToken.transfer(receiver, _paymentAmount), "Receiver transfer failed");

        // حساب المكافأة وإرسال التوكنات
        uint256 reward = (tokensToBuy * rewardPercent) / 100;
        uint256 totalSend = tokensToBuy + reward;

        require(icoToken.balanceOf(address(this)) >= totalSend, "Not enough tokens");
        require(icoToken.transfer(msg.sender, totalSend), "ICO transfer failed");

        totalTokensSold += totalSend;

        emit TokensPurchased(msg.sender, tokensToBuy, reward, _paymentAmount, paymentTokenAddr);
    }

    // 🏦 سحب التوكنات المتبقية
    function withdrawRemainingTokens(uint256 _amount) external onlyAdmin {
        require(icoToken.balanceOf(address(this)) >= _amount, "Insufficient");
        require(icoToken.transfer(superAdmin, _amount), "Token withdraw failed");
        emit TokensWithdrawn(superAdmin, _amount);
    }

    // 🚨 سحب طارئ (التوكنات فقط)
    function emergencyWithdraw() external onlyAdmin {
        uint256 t = icoToken.balanceOf(address(this));
        if (t > 0) icoToken.transfer(superAdmin, t);
        emit EmergencyWithdraw(t);
    }

    // ⏸️ إيقاف / تشغيل الشراء
    function pause(bool _pause) external onlyAdmin {
        paused = _pause;
    }

    // 📊 تحديث السعر يدويًا من الأدمن
    function updateTokenPrice(uint256 _newPrice) external onlyAdmin {
        require(_newPrice > 0, "Price must > 0");
        tokenPrice = _newPrice;
    }

    function updateTokenPriceFromStaking(uint256 _newPrice) external onlyFromStaking {
        require(_newPrice > 0, "Price must > 0");
        tokenPrice = _newPrice;
    }

    // 🔍 قراءة الرصيد
    function getTokenBalance() external view returns (uint256) {
        return icoToken.balanceOf(address(this));
    }

    function getTokenBalanceOf(address tokenAddr) external view returns (uint256) {
        return IERC20(tokenAddr).balanceOf(address(this));
    }
}
