// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./AdminManager.sol";
import "./Token.sol";

contract TokenStaking {
    IERC20Basic public stakingToken;
    AdminManager public adminManager;
    address public icoContractAddress;

    uint256 public stakingStartTime;
    uint256 public totalReleased; 
    uint256 public totalAdminWithdrawn; 

    uint256[] public releaseTimes;    
    uint256[] public releasePercents; 

    event TokensReleased(uint256 amount, uint256 phase);
    event IcoContractUpdated(address indexed newIcoContract);
    event AdminWithdraw(address indexed to, uint256 amount);

    modifier onlyAdmin() {
        require(adminManager.addressExists(msg.sender), "Only admin");
        _;
    }

    constructor(address _stakingToken, address _adminManager) {
        stakingToken = IERC20Basic(_stakingToken);
        adminManager = AdminManager(_adminManager);

        stakingStartTime = block.timestamp;

        // 🟢 5 مراحل متساوية (20% لكل مرحلة من النصف المخصص)
        releasePercents = [20, 20, 20, 20, 20];

        // 🟢 كل المراحل تبدأ بعد يوم واحد
        releaseTimes.push(stakingStartTime + 2 minutes); // المرحلة 1
        releaseTimes.push(stakingStartTime + 2 days); // المرحلة 2
        releaseTimes.push(stakingStartTime + 3 days); // المرحلة 3
        releaseTimes.push(stakingStartTime + 4 days); // المرحلة 4
        releaseTimes.push(stakingStartTime + 5 days); // المرحلة 5
    }

    function setIcoContract(address _icoContract) external onlyAdmin {
        require(_icoContract != address(0), "Invalid address");
        icoContractAddress = _icoContract;
        emit IcoContractUpdated(_icoContract);
    }

    function totalStakingAmount() public view returns (uint256) {
        return stakingToken.balanceOf(address(this)) + totalReleased + totalAdminWithdrawn;
    }

    function stakingPlanAmount() public view returns (uint256) {
        return totalStakingAmount() / 2;
    }

    function calculateAvailableRelease() public view returns (uint256) {
        uint256 available = 0;
        uint256 totalEntitled = 0;
        uint256 planAmount = stakingPlanAmount();

        for (uint256 i = 0; i < releaseTimes.length; i++) {
            if (block.timestamp >= releaseTimes[i]) {
                totalEntitled += (planAmount * releasePercents[i]) / 100;
            }
        }

        if (totalEntitled > totalReleased) {
            available = totalEntitled - totalReleased;
        }

        return available;
    }

    function releaseTokens() external onlyAdmin {
        require(icoContractAddress != address(0), "ICO not set");
        uint256 available = calculateAvailableRelease();
        require(available > 0, "Nothing to release");

        uint256 phase = 0;
        for (uint256 i = 0; i < releaseTimes.length; i++) {
            if (block.timestamp >= releaseTimes[i]) {
                phase = i + 1;
            }
        }

        totalReleased += available;
        Token(address(stakingToken)).transfer(icoContractAddress, available);
        emit TokensReleased(available, phase);
    }

    function adminWithdraw(address to, uint256 amount) external onlyAdmin {
        require(to != address(0), "Invalid address");
        
        uint256 totalHalf = totalStakingAmount() / 2; 
        uint256 availableForAdmins = totalHalf - totalAdminWithdrawn;

        require(amount <= availableForAdmins, "Exceeds admin allocation");

        totalAdminWithdrawn += amount;
        Token(address(stakingToken)).transfer(to, amount);

        emit AdminWithdraw(to, amount);
    }

    function updateReleasePlan(uint256[] calldata _percents, uint256[] calldata _times) external onlyAdmin {
        require(_percents.length == _times.length, "Array mismatch");

        uint256 totalPercent = 0;
        for (uint256 i = 0; i < _percents.length; i++) {
            totalPercent += _percents[i];
        }
        require(totalPercent == 100, "Percents must sum to 100");

        releasePercents = _percents;
        releaseTimes = _times;
    }
}
