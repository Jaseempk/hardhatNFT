const { network } = require("hardhat");
const{developmentChains}=require("../helper-hardhat-config")

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deployer } = await getNamedAccounts();
    const { deploy, log } = deployments;
    const args=[]

    const basicNft = await deploy("BasicNft", {
        from: deployer,
        args: args,
        log: true,
    });
};

module.exports.tags = ["basicNft", "all"];
