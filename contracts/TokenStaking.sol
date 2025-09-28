// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./AdminManager.sol";
import "./Token.sol";

contract TokenStaking {
    IERC20Basic public stakingToken;
    AdminManager public adminManager;
    address public icoContractAddress;
    
    uint256 public constant TOTAL_STAKING_AMOUNT = 90_000_000 * 1e18;
    uint256 public constant FIRST_RELEASE = 1_000_000 * 1e18;
    uint256 public constant SECOND_RELEASE = 800_000 * 1e18;
    uint256 public constant THIRD_RELEASE = 2_000_000 * 1e18;
    
    uint256 public stakingStartTime;
    uint256 public totalReleased;
    
    uint256 public firstReleaseTime;
    uint256 public secondReleaseTime;
    uint256 public thirdReleaseTime;
    uint256 public finalReleaseTime;
    
    event TokensReleased(uint256 amount, uint256 phase);
    event IcoContractUpdated(address indexed newIcoContract);
    
    modifier onlyAdmin() {
        require(adminManager.addressExists(msg.sender), "Only admin");
        _;
    }
    
    constructor(address _stakingToken, address _adminManager) {
        stakingToken = IERC20Basic(_stakingToken);
        adminManager = AdminManager(_adminManager);
        
        stakingStartTime = block.timestamp;
        firstReleaseTime = stakingStartTime + 120 seconds;
        secondReleaseTime = stakingStartTime + 120 days;
        thirdReleaseTime = stakingStartTime + 240 days;
        finalReleaseTime = stakingStartTime + 365 days;
    }
    
    function setIcoContract(address _icoContract) external onlyAdmin {
        require(_icoContract != address(0), "Invalid address");
        icoContractAddress = _icoContract;
        emit IcoContractUpdated(_icoContract);
    }
    
    function calculateAvailableRelease() public view returns (uint256) {
        uint256 available = 0;
        if (block.timestamp >= firstReleaseTime) available += FIRST_RELEASE;
        if (block.timestamp >= secondReleaseTime) available += SECOND_RELEASE;
        if (block.timestamp >= thirdReleaseTime) available += THIRD_RELEASE;
        if (block.timestamp >= finalReleaseTime) available = TOTAL_STAKING_AMOUNT;
        return available > totalReleased ? available - totalReleased : 0;
    }
    
    function releaseTokens() external onlyAdmin {
        require(icoContractAddress != address(0), "ICO not set");
        uint256 available = calculateAvailableRelease();
        require(available > 0, "Nothing to release");
        
        uint256 phase;
        if (block.timestamp >= finalReleaseTime) phase = 4;
        else if (block.timestamp >= thirdReleaseTime) phase = 3;
        else if (block.timestamp >= secondReleaseTime) phase = 2;
        else phase = 1;
        
        totalReleased += available;
        Token(address(stakingToken)).transfer(icoContractAddress, available);
        emit TokensReleased(available, phase);
    }
}
