// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

/// @title AlphaAgentRegistry — Register AI agents for auto-payments
/// @notice Allows agents to register their x402 endpoints and pricing
contract AlphaAgentRegistry {
    struct Agent {
        address agentAddress;
        string name;
        string endpoint;       // x402 API endpoint
        uint256 pricePerCall;  // in USDC 6-decimal units
        bool active;
    }

    Agent[] public agents;

    mapping(address => uint256[]) public agentsByOwner;

    event AgentRegistered(
        uint256 indexed agentId,
        address indexed agentAddress,
        string name
    );

    event AgentDeactivated(uint256 indexed agentId);
    event AgentActivated(uint256 indexed agentId);

    function registerAgent(
        string calldata name,
        string calldata endpoint,
        uint256 pricePerCall
    ) external returns (uint256 agentId) {
        require(bytes(name).length > 0, "Name required");
        require(bytes(endpoint).length > 0, "Endpoint required");

        agentId = agents.length;
        agents.push(Agent(msg.sender, name, endpoint, pricePerCall, true));
        agentsByOwner[msg.sender].push(agentId);
        emit AgentRegistered(agentId, msg.sender, name);
    }

    function deactivateAgent(uint256 agentId) external {
        require(agentId < agents.length, "Agent does not exist");
        require(agents[agentId].agentAddress == msg.sender, "Not owner");
        agents[agentId].active = false;
        emit AgentDeactivated(agentId);
    }

    function activateAgent(uint256 agentId) external {
        require(agentId < agents.length, "Agent does not exist");
        require(agents[agentId].agentAddress == msg.sender, "Not owner");
        agents[agentId].active = true;
        emit AgentActivated(agentId);
    }

    function getAgents() external view returns (Agent[] memory) {
        return agents;
    }

    function getAgent(uint256 agentId) external view returns (Agent memory) {
        require(agentId < agents.length, "Agent does not exist");
        return agents[agentId];
    }

    function getAgentsCount() external view returns (uint256) {
        return agents.length;
    }

    function getAgentsByOwner(address owner) external view returns (uint256[] memory) {
        return agentsByOwner[owner];
    }
}
