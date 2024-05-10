// SPDX-Licence-Identifier: MIT
pragma solidity ^0.8.7;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Native is ERC20 {
    constructor(uint256 initialSupply) ERC20("Native", "NAT") {
        _mint(msg.sender, initialSupply);
    }
}
