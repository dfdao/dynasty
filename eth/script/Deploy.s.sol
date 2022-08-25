// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "../src/Registry.sol";
import "../src/NFT.sol";

contract Deploy is Script {
    function run() public {
        vm.broadcast();
        Registry registry = new Registry();
        vm.stopBroadcast();
        
        vm.broadcast();
        NFT nft = new NFT("dfdao", "DFD");
        vm.stopBroadcast();
    }
}
