// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

/// @title AlphaPaymentHub — Core payment routing for AlphaAi
/// @notice Routes USDC nano-payments on Arc Testnet via Circle Gateway (x402)
/// @dev USDC on Arc Testnet: 0x3600000000000000000000000000000000000000
contract AlphaPaymentHub is UUPSUpgradeable, OwnableUpgradeable {
    IERC20 public usdc;

    struct Payment {
        address from;
        address to;
        uint256 amount;    // 6-decimal USDC
        string note;
        uint256 timestamp;
    }

    Payment[] public payments;

    event PaymentSent(
        address indexed from,
        address indexed to,
        uint256 amount,
        string note,
        uint256 paymentId
    );

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address _usdc) public initializer {
        __Ownable_init(msg.sender);
        usdc = IERC20(_usdc);
    }

    function sendPayment(
        address to,
        uint256 amount,
        string calldata note
    ) external returns (uint256 paymentId) {
        require(amount > 0, "Amount must be > 0");
        require(to != address(0), "Invalid recipient");
        require(usdc.transferFrom(msg.sender, to, amount), "Transfer failed");

        paymentId = payments.length;
        payments.push(Payment(msg.sender, to, amount, note, block.timestamp));
        emit PaymentSent(msg.sender, to, amount, note, paymentId);
    }

    function getPaymentsCount() external view returns (uint256) {
        return payments.length;
    }

    function getPayment(uint256 paymentId) external view returns (Payment memory) {
        require(paymentId < payments.length, "Payment does not exist");
        return payments[paymentId];
    }

    function _authorizeUpgrade(address) internal override onlyOwner {}
}
