// SPDX-License-Identifier:MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

//Custom errors
error RandomIpfsNft__RangeOutOfBounds();
error RandomIpfsNft__NotEnoughEthSend();
error RandomIpfsNft__withdrawFailed();

contract RandomIpfsNft is VRFConsumerBaseV2, ERC721URIStorage, Ownable {
    /**
     * when we mint an Nft,we will trigger a chainlinkVrf call to get a random number
     * using that random number,we will send a random NFT
     * Pug,Shiba inu,st.Bernard
     * Pug-super rare,shiba:sort of rare,Bernard:common
     *
     *
     * Users have to pay to mint NFT
     * Owner can withdraw the ETH
     */

    //state variables
    enum Breed {
        PUG,
        SHIBA_INU,
        ST_BERNARD
    }

    //constructor variables
    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    bytes32 private immutable i_gasLane;
    uint32 private immutable i_callbackGasLimit;
    uint64 private immutable i_subscriptionId;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 1;

    //NFT variables
    uint256 public s_tokenCounter;
    uint256 internal constant MAX_CHANCE_VALUE = 100;
    uint256 internal immutable i_mintFee;
    string[] internal s_dogTokenUris;

    //mapping
    mapping(uint256 => address) public s_requestToTokenId;

    //events
    event NftRequested(uint256 indexed requestId, address requester);
    event NftMinted(Breed dogBreed, address minter);

    constructor(
        address vrfCoordinatorV2,
        bytes32 gasLane,
        uint32 callbackGasLimit,
        uint64 subscriptionId,
        string[3] memory dogTokenUris,
        uint256 mintFee
    ) VRFConsumerBaseV2(vrfCoordinatorV2) ERC721("Random Ipfs Nft", "RIN") {
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
        i_gasLane = gasLane;
        i_callbackGasLimit = callbackGasLimit;
        i_subscriptionId = subscriptionId;
        s_dogTokenUris = dogTokenUris;
        i_mintFee = mintFee;
    }

    function requestNft() public payable returns (uint256 requestId) {
        if (msg.value < i_mintFee) {
            revert RandomIpfsNft__NotEnoughEthSend();
        }
        requestId = i_vrfCoordinator.requestRandomWords(
            i_gasLane,
            i_subscriptionId,
            REQUEST_CONFIRMATIONS,
            i_callbackGasLimit,
            NUM_WORDS
        );
        emit NftRequested(requestId, msg.sender);
    }

    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {
        s_requestToTokenId[requestId] = msg.sender;
        uint256 newTokenId = s_tokenCounter;
        address dogOwner = s_requestToTokenId[requestId];

        uint256 moddedRng = randomWords[0] % MAX_CHANCE_VALUE;
        /**
         * moddedRng helps us to assign NFTs randomly after getting the random number
         * this mod function here returns numbers between 0-99
         * in which we mint PUG,if the moddedRng is between 0-10
         * SHIBA_INU:if moddedRng is 10-30
         * ST_BERNARD:if moddedRng is 30-100
         */

        Breed dogBreed = getBreedFromModded(moddedRng);
        _safeMint(dogOwner, newTokenId);
        _setTokenURI(newTokenId, s_dogTokenUris[uint256(dogBreed)]);

        emit NftMinted(dogBreed, dogOwner);
    }

    function withdraw() public onlyOwner {
        uint256 amount = address(this).balance;
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        if (!success) {
            revert RandomIpfsNft__withdrawFailed();
        }
    }

    function getBreedFromModded(uint256 moddedRng) public pure returns (Breed) {
        uint256 cumulativeSum = 0;
        uint256[3] memory chanceArray = getChance();
        for (uint256 i = 0; i < chanceArray.length; i++) {
            if (moddedRng >= cumulativeSum && moddedRng < cumulativeSum + chanceArray[i]) {
                return Breed(i);
            }
            cumulativeSum += chanceArray[i];
        }
        revert RandomIpfsNft__RangeOutOfBounds();
    }

    function getChance() public pure returns (uint256[3] memory) {
        return [10, 30, MAX_CHANCE_VALUE];
        /**
         * PUG:10% chance of getting
         * SHIBA_INU:20% chance of getting this NFT
         * ST_BERNARD:60% chance of getting this NFT
         */
    }

    //view functions

    function getMintFee() public view returns (uint256) {
        return i_mintFee;
    }

    function getDogTokenUris(uint256 index) public view returns (string memory) {
        return s_dogTokenUris[index];
    }

    function getTokenCounter() public view returns (uint256) {
        return s_tokenCounter;
    }
}

/**
 *         requestId = COORDINATOR.requestRandomWords(
            keyHash,
            s_subscriptionId,
            requestConfirmations,
            callbackGasLimit,
            numWords
        );
 */
