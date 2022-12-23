const { developmentChains } = require("../helper-hardhat-config");
const { ethers, deployments, network, getNamedAccounts } = require("hardhat");
const { assert } = require("chai");
!developmentChains.includes(network.name)
    ? describe.skip
    : describe("basicNft", function () {
          let tokenCounter, basicNft, deployer;
          beforeEach(async () => {
              const accounts = await ethers.getSigners();
              deployer = accounts[0];
              await deployments.fixture(["all"]);
              console.log("deployed...");
              basicNft = await ethers.getContract("BasicNft", deployer);
          });
          it("initialises tokenCounter correctly", async function () {
              tokenCounter = await basicNft.getTokenCounter();
              assert.equal(tokenCounter.toString(), "0");
          });
          it("mints the token and adds", async function () {
              const txMint = await basicNft.mintNft();
              await txMint.wait(1);
              const tokenUri = await basicNft.tokenURI(0);
              tokenCounter = await basicNft.getTokenCounter();
              assert.equal(tokenCounter.toString(), "1");
              assert.equal(tokenUri, await basicNft.TOKEN_URI());
              console.log("test completed");
          });
      });
/**
 describe("constructor", function () {
 });
 * 
 */
