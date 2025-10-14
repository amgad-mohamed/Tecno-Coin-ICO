// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.20;

contract AdminManager {
    address public superAdmin;
    mapping(address => bool) public isAdmin;
    address[] private adminList;

    event AdminAdded(address indexed newAdmin);
    event AdminRemoved(address indexed removedAdmin);
    event SuperAdminChanged(address indexed oldAdmin, address indexed newAdmin);

    constructor() {
        superAdmin = msg.sender;
        isAdmin[msg.sender] = true;
        adminList.push(msg.sender);
    }

    modifier onlySuperAdmin() {
        require(msg.sender == superAdmin, "Only super admin can perform this operation");
        _;
    }

    modifier onlyAdmin() {
        require(isAdmin[msg.sender], "Only admin can perform this operation");
        _;
    }

    function addAdmin(address _newAdmin) external onlyAdmin {
        require(_newAdmin != address(0), "Invalid address");
        require(!isAdmin[_newAdmin], "Admin already exists");

        isAdmin[_newAdmin] = true;
        adminList.push(_newAdmin);
        emit AdminAdded(_newAdmin);
    }

    function removeAdmin(address _admin) external onlyAdmin {
        require(isAdmin[_admin], "Admin does not exist");
        require(_admin != superAdmin, "Cannot remove super admin directly");

        isAdmin[_admin] = false;

        for (uint i = 0; i < adminList.length; i++) {
            if (adminList[i] == _admin) {
                adminList[i] = adminList[adminList.length - 1];
                adminList.pop();
                break;
            }
        }
        emit AdminRemoved(_admin);
    }

    function removeSuperAdmin(address _newSuperAdmin) external onlySuperAdmin {
        require(_newSuperAdmin != address(0), "Invalid new super admin");
        require(isAdmin[_newSuperAdmin], "New super admin must already be admin");

        address old = superAdmin;

        isAdmin[superAdmin] = false;
        superAdmin = _newSuperAdmin;
        isAdmin[_newSuperAdmin] = true;

        emit SuperAdminChanged(old, _newSuperAdmin);
    }

    function addressExists(address _address) external view returns (bool) {
        return isAdmin[_address];
    }

    function getAdmins() external view returns (address[] memory) {
        return adminList;
    }
}
