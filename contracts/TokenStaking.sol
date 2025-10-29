// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./AdminManager.sol";
import "./Token.sol";
import "./ICOContract.sol"; // ✅ استدعاء عقد ICO مباشرة

contract TokenStaking {
    IERC20Basic public stakingToken;
    AdminManager public adminManager;
    ICOContract public icoContract; // ✅ نوعه مباشرة ICOContract

    uint256 public stakingStartTime;
    uint256 public totalReleased;
    uint256 public totalAdminWithdrawn;

    struct Release {
        uint256 time;
        uint256 price;
        uint256 rewardPercent;
    }

    Release[] public releases;

    event TokensReleased(uint256 amount, uint256 phase);
    event IcoContractUpdated(address indexed newIcoContract);
    event AdminWithdraw(address indexed to, uint256 amount);
    event ReleasePlanUpdated(uint256 releaseCount);

    modifier onlyAdmin() {
        require(adminManager.addressExists(msg.sender), "Only admin");
        _;
    }

    constructor(address _stakingToken, address _adminManager) {
        stakingToken = IERC20Basic(_stakingToken);
        adminManager = AdminManager(_adminManager);
        stakingStartTime = block.timestamp;

        // مثال لخمس مراحل بإعدادات مبدئية
        releases.push(Release({time: stakingStartTime + 5 minutes, price: 1e3, rewardPercent: 1}));
        releases.push(Release({time: stakingStartTime + 10 minutes, price: 3e3, rewardPercent: 2}));
        releases.push(Release({time: stakingStartTime + 3 days, price: 5e3, rewardPercent: 3}));
        releases.push(Release({time: stakingStartTime + 4 days, price: 7e3, rewardPercent: 4}));
        releases.push(Release({time: stakingStartTime + 5 days, price: 9e3, rewardPercent: 5}));
    }

    // 🧩 تعيين عقد الـ ICO
    function setIcoContract(address _icoContract) external onlyAdmin {
        require(_icoContract != address(0), "Invalid address");
        icoContract = ICOContract(_icoContract);
        emit IcoContractUpdated(_icoContract);
    }

    function totalStakingAmount() public view returns (uint256) {
        return stakingToken.balanceOf(address(this)) + totalReleased + totalAdminWithdrawn;
    }

    function stakingPlanAmount() public view returns (uint256) {
        return totalStakingAmount() / 2;
    }

    function calculateAvailableRelease() public view returns (uint256) {
        uint256 planAmount = stakingPlanAmount();
        uint256 totalReleases = releases.length;
        uint256 totalEntitled = 0;

        for (uint256 i = 0; i < totalReleases; i++) {
            if (block.timestamp >= releases[i].time) {
                totalEntitled += (planAmount * 1) / totalReleases;
            }
        }

        if (totalEntitled > totalReleased) {
            return totalEntitled - totalReleased;
        }
        return 0;
    }

    // 🔥 هنا بيتعامل مباشرة مع دوال الـ ICO الأصلية
    function releaseTokens() external onlyAdmin {
        require(address(icoContract) != address(0), "ICO not set");
        uint256 available = calculateAvailableRelease();
        require(available > 0, "Nothing to release");

        uint256 latestValidIdx = 0;
        bool found = false;

        for (uint256 i = 0; i < releases.length; i++) {
            if (block.timestamp >= releases[i].time) {
                latestValidIdx = i;
                found = true;
            }
        }

        require(found, "No release period reached yet");

        totalReleased += available;

        Token(address(stakingToken)).transfer(address(icoContract), available);

        Release memory latest = releases[latestValidIdx];

        // ✅ تحديث السعر من دالة updateTokenPrice داخل ICO مباشرة
        icoContract.updateTokenPriceFromStaking(latest.price);

        // ✅ وتحديث المكافأة من دالة setRewardPercentFromStaking
        icoContract.setRewardPercentFromStaking(latest.rewardPercent);

        emit TokensReleased(available, latestValidIdx + 1);
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

    function updateReleasePlan(
        uint256[] calldata _times,
        uint256[] calldata _prices,
        uint256[] calldata _rewardPercents
    ) external onlyAdmin {
        require(_times.length == _prices.length && _prices.length == _rewardPercents.length, "Array mismatch");

        delete releases;

        for (uint256 i = 0; i < _times.length; i++) {
            require(_rewardPercents[i] >= 1 && _rewardPercents[i] <= 100, "Reward % must be 1-100");
            releases.push(Release({
                time: _times[i],
                price: _prices[i],
                rewardPercent: _rewardPercents[i]
            }));
        }

        emit ReleasePlanUpdated(releases.length);
    }

    function getReleasesCount() external view returns (uint256) {
        return releases.length;
    }

    function getRelease(uint256 idx) external view returns (uint256 time, uint256 price, uint256 rewardPercent) {
        require(idx < releases.length, "Index OOB");
        Release storage r = releases[idx];
        return (r.time, r.price, r.rewardPercent);
    }
}
