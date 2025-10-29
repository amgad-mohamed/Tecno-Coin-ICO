// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20Basic {
    function decimals() external view returns (uint8);
    function totalSupply() external view returns (uint256);
    function balanceOf(address _owner) external view returns (uint256);
    function transfer(address _to, uint256 _value) external returns (bool);
    function transferFrom(address _from, address _to, uint256 _value) external returns (bool);
    function approve(address _spender, uint256 _value) external returns (bool);
}

contract Token {
    string public name;
    string public symbol;
    uint8 public decimals;
    uint256 public maxSupply;

    address public stakingAddress;
    address private _owner;

    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;
    uint256 private _totalSupply;

    // 🆕 تتبع إجمالي Mint و Burn
    uint256 public totalMinted;
    uint256 public totalBurned;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event StakingAddressSet(address indexed staking);
    event Burn(address indexed burner, uint256 amount);
    event Mint(address indexed to, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == _owner, "Only owner");
        _;
    }

    constructor(
        string memory _name,
        string memory _symbol,
        uint8 _decimals,
        uint256 _maxSupply
    ) {
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
        maxSupply = _maxSupply;
        _owner = msg.sender;
    }

    function setStakingAddress(address _staking) external onlyOwner {
        require(_staking != address(0), "Invalid address");
        stakingAddress = _staking;
        emit StakingAddressSet(_staking);
    }

    function _mint(address account, uint256 amount) internal {
        require(account != address(0), "Zero address");
        require(_totalSupply + amount <= maxSupply, "Exceeds cap");
        _totalSupply += amount;
        _balances[account] += amount;

        // ✅ تتبع إجمالي الـ mint
        totalMinted += amount;

        emit Mint(account, amount);
        emit Transfer(address(0), account, amount);
    }

    function mint(uint256 amount) external onlyOwner {
        require(stakingAddress != address(0), "Staking not set");
        _mint(stakingAddress, amount);
    }

    function _burn(address account, uint256 amount) internal {
        require(_balances[account] >= amount, "Balance low");
        _balances[account] -= amount;
        _totalSupply -= amount;

        // ✅ تتبع إجمالي الـ burn
        totalBurned += amount;

        emit Burn(account, amount);
        emit Transfer(account, address(0), amount);
    }

    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }

    // 📊 إرجاع القيم الحالية
    function totalSupply() external view returns (uint256) { return _totalSupply; }
    function balanceOf(address account) external view returns (uint256) { return _balances[account]; }

    function transfer(address recipient, uint256 amount) external returns (bool) {
        _transfer(msg.sender, recipient, amount);
        return true;
    }

    function _transfer(address sender, address recipient, uint256 amount) internal {
        require(_balances[sender] >= amount, "Balance low");
        _balances[sender] -= amount;
        _balances[recipient] += amount;
        emit Transfer(sender, recipient, amount);
    }

    function allowance(address owner, address spender) external view returns (uint256) {
        return _allowances[owner][spender];
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        _allowances[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool) {
        require(_allowances[sender][msg.sender] >= amount, "Allowance low");
        _allowances[sender][msg.sender] -= amount;
        _transfer(sender, recipient, amount);
        return true;
    }

    // 🆕 دوال عرض إضافية
    function getTotalMinted() external view returns (uint256) {
        return totalMinted;
    }

    function getTotalBurned() external view returns (uint256) {
        return totalBurned;
    }
}
