const { developmentChains, networkConfig } = require("../helper-hardhat-config");
const { ethers, network } = require("hardhat");
const { storeImages, storeMetadataIpfs } = require("../utils/uploadToPinata");
const imagesLocation = "./images/randomNft";

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deployer } = await getNamedAccounts();
    const { deploy, log } = deployments;
    const chainId = network.config.chainId;
    let vrfCoordinatorV2MockAddress, subscriptionId;

    if (process.env.UPLOAD_TO_PINATA == "true") {
        await handleTokenUris();
    }

    const sampleMetaData = {
        name: "",
        description: "",
        image: "",
        attributes: [
            {
                rarity: "",
            },
        ],
    };

    if (developmentChains.includes(network.name)) {
        const vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock");
        vrfCoordinatorV2MockAddress = vrfCoordinatorV2Mock.address;
        const tx = await vrfCoordinatorV2Mock.createSubscription();
        const txReceipt = await tx.wait(1);
        subscriptionId = await txReceipt.events[0].args.subId;
    } else {
        vrfCoordinatorV2MockAddress = networkConfig[chainId].vrfCoordinator;
        subscriptionId = networkConfig[chainId].subscriptionId;
    }

    // await storeImages(imagesLocation);

    // const args = [
    //     vrfCoordinatorV2MockAddress,
    //     networkConfig[chainId].gasLane,
    //     networkConfig[chainId].callbackGasLimit,
    //     subscriptionId,
    //     //tokenUris
    //     networkConfig[chainId].mintFee,
    // ];
    // const randomIpfs = await deploy("RandomIpfsNft", {
    //     from: deployer,
    //     log: true,
    //     args: args,
    //     waitConfirmations: 1,
    // });
};

async function handleTokenUris() {
    tokenUris = [];
    //upload images to ipfs
    //upload metadata to ipfs

    const { responses: imageUploadResponses, files } = await storeImages(imagesLocation);
    /**
         * 
        for (imageUploadResponseIndex in imageUploadResponses) {
            let tokenUriMetadata = [...sampleMetaData]; //unpacking sampleMetaData

            tokenUriMetadata.name = files[imageUploadResponseIndex].replace(".png", "");

            tokenUriMetadata.description = `a cute ${tokenUriMetadata.name} pup`;
            tokenUriMetadata.image = `ipfs://${imageUploadResponses[imageUploadResponseIndex].IpfsHash}`;
            //creating metadata for the images
            console.log(`uploading ${tokenUriMetadata.name}...`);
            //uploading JSON to ipfs
            const metadataUploadResponse = await storeMetadataIpfs(tokenUriMetadata);
            tokenUris.push(`ipfs://${metadataUploadResponse.IpfsHash}`);
        }
         */
    console.log("tokenUris uploaded to ipfs");
    console.log("they are...");
    console.log(tokenUris);

    return tokenUris;
}

module.exports.tags = ["randomIpfs", "all", "main"];
