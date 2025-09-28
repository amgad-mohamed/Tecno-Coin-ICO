// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function decimals() external view returns (uint8);
    function transfer(address, uint256) external returns (bool);
    function transferFrom(address, address, uint256) external returns (bool);
    function balanceOf(address) external view returns (uint256);
}

interface AggregatorV3Interface {
    function decimals() external view returns (uint8);
    function latestRoundData()
        external
        view
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        );
}

contract ICOContract {
    address public admin;
    IERC20 public paymentToken;
    IERC20 public icoToken;
    uint256 public tokenPrice; // بالدقة priceDecimals
    uint8 public priceDecimals = 6;

    uint256 public totalTokensSold;
    AggregatorV3Interface public ethUsdPriceFeed;
    bool public paused;

    event TokensPurchased(address indexed buyer, uint256 amount, bool paidInEth);
    event FundsWithdrawn(address indexed admin, uint256 amount);
    event EthWithdrawn(address indexed admin, uint256 amount);
    event TokensWithdrawn(address indexed admin, uint256 amount);
    event EmergencyWithdraw(uint256 tokenAmount, uint256 paymentAmount, uint256 ethAmount);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
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
        address _ethUsdPriceFeed
    ) {
        require(_paymentToken != address(0), "Invalid payment token");
        require(_icoToken != address(0), "Invalid ICO token");
        require(_ethUsdPriceFeed != address(0), "Invalid price feed");
        require(_tokenPrice > 0, "Price must > 0");

        admin = msg.sender;
        paymentToken = IERC20(_paymentToken);
        icoToken = IERC20(_icoToken);
        tokenPrice = _tokenPrice;
        ethUsdPriceFeed = AggregatorV3Interface(_ethUsdPriceFeed);
    }

    function getLatestETHPrice() public view returns (uint256, uint8) {
        (, int256 price,,,) = ethUsdPriceFeed.latestRoundData();
        require(price > 0, "Invalid ETH price");
        return (uint256(price), ethUsdPriceFeed.decimals());
    }

    function buyTokens(uint256 _paymentAmount) external whenNotPaused {
        require(_paymentAmount > 0, "Amount = 0");
        uint8 payDecimals = paymentToken.decimals();
        uint8 icoDecimals = icoToken.decimals();

        uint256 normalizedPayment = _paymentAmount * (10**priceDecimals) / (10**payDecimals);
        uint256 tokensToBuy = (normalizedPayment * (10**icoDecimals)) / tokenPrice;

        require(tokensToBuy > 0, "Too small");

        require(paymentToken.transferFrom(msg.sender, address(this), _paymentAmount), "Payment failed");
        require(icoToken.transfer(msg.sender, tokensToBuy), "ICO transfer failed");

        totalTokensSold += tokensToBuy;
        emit TokensPurchased(msg.sender, tokensToBuy, false);
    }

    function buyTokensWithETH() external payable whenNotPaused {
        require(msg.value > 0, "ETH = 0");
        (uint256 ethPrice, uint8 feedDecimals) = getLatestETHPrice();
        uint8 icoDecimals = icoToken.decimals();

        uint256 usdtValue = (msg.value * ethPrice) / (10**feedDecimals);
        uint256 normalizedUsdt = usdtValue * (10**priceDecimals) / 1e18;
        uint256 tokensToBuy = (normalizedUsdt * (10**icoDecimals)) / tokenPrice;

        require(tokensToBuy > 0, "Too small");
        require(icoToken.transfer(msg.sender, tokensToBuy), "ICO transfer failed");

        totalTokensSold += tokensToBuy;
        emit TokensPurchased(msg.sender, tokensToBuy, true);
    }

    function withdrawFunds(uint256 _amount) external onlyAdmin {
        require(paymentToken.balanceOf(address(this)) >= _amount, "Insufficient");
        require(paymentToken.transfer(admin, _amount), "Transfer failed");
        emit FundsWithdrawn(admin, _amount);
    }

    function withdrawETH(uint256 _amount) external onlyAdmin {
        require(address(this).balance >= _amount, "Insufficient ETH");
        (bool ok,) = admin.call{value:_amount}("");
        require(ok, "ETH withdraw failed");
        emit EthWithdrawn(admin, _amount);
    }

    function withdrawRemainingTokens(uint256 _amount) external onlyAdmin {
        require(icoToken.balanceOf(address(this)) >= _amount, "Insufficient");
        require(icoToken.transfer(admin, _amount), "Token withdraw failed");
        emit TokensWithdrawn(admin, _amount);
    }

    function emergencyWithdraw() external onlyAdmin {
        uint256 t = icoToken.balanceOf(address(this));
        uint256 p = paymentToken.balanceOf(address(this));
        uint256 e = address(this).balance;

        if (t > 0) icoToken.transfer(admin, t);
        if (p > 0) paymentToken.transfer(admin, p);
        if (e > 0) {
            (bool ok,) = admin.call{value:e}("");
            require(ok, "ETH emergency withdraw failed");
        }

        emit EmergencyWithdraw(t,p,e);
    }

    function pause(bool _pause) external onlyAdmin {
        paused = _pause;
    }


    function updateTokenPrice(uint256 _newPrice) external onlyAdmin {
        require(_newPrice > 0, "Price must be greater than zero");
        tokenPrice = _newPrice;
    }


        // رصيد التوكنات داخل عقد الـ ICO
    function getTokenBalance() external view returns (uint256) {
        return icoToken.balanceOf(address(this));
    }

    // رصيد ETH داخل عقد الـ ICO
    function getETHBalance() external view returns (uint256) {
        return address(this).balance;
    }

    // رصيد USDT داخل عقد الـ ICO
    function getUSDTBalance() external view returns (uint256) {
        return paymentToken.balanceOf(address(this));
    }


    receive() external payable {}
}
