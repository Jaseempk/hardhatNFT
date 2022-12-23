const { ethers, network } = require("hardhat");
const { developmentChains, networkConfig } = require("../helper-hardhat-config");

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deployer } = await getNamedAccounts();
    const { deploy, log } = await deployments;
    const GAS_PRICE = ethers.utils.parseEther("0.25");
    const GAS_PER_LINK = 1e9;
    const args = [GAS_PRICE, GAS_PER_LINK];
    if (developmentChains.includes(network.name)) {
        console.log("localhost detected! deploying mocks...");
        await deploy("VRFCoordinatorV2Mock", {
            from: deployer,
            log: true,
            args: args,
            waitConfirmations: 1,
        });
        console.log("mocks deployed...");
    }
};
module.exports.tags = ["all", "mocks"];
