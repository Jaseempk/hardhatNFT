const pinataSDK = require("@pinata/sdk");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const pinataApiKey = process.env.PINATA_API_KEY;
const pinataSecretKey = process.env.PINATA_SECRET_KEY;
const pinata = new pinataSDK(pinataApiKey, pinataSecretKey);

async function storeImages(imagesFilePath) {
    const fullImagesPath = path.resolve(imagesFilePath);
    const files = fs.readdirSync(fullImagesPath);

    let responses = [];
    for (fileIndex in files) {
        const fullStreamForFiles = fs.createReadStream(`${fullImagesPath}/${files[fileIndex]}`);
        const options = {
            pinataMetadata: {
                name: files[fileIndex],
            },
        };
        try {
            const response = await pinata.pinFileToIPFS(fullStreamForFiles, options); //pins our files to IPFS using pinata,which returns a hash function(hashIpfs)
            responses.push(response);
            console.log("your files have been pinned to ipfs");
        } catch (error) {
            console.error(error);
        }
    }
    return { responses, files };
}
async function storeMetadataIpfs(metadata) {
    try {
        const response = await pinata.pinJSONToIPFS(metadata);
        return response;
    } catch (error) {
        console.log(error);
    }
    return null;
}
module.exports = { storeImages, storeMetadataIpfs };
