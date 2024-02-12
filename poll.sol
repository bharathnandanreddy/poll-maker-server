// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.10;
contract Poll {
    // Poll attributes
    string public title;
    string[] public options;

    mapping(address => uint256) public votes; // Maps address to voted option
    mapping(string => uint256) public users;
    struct Results {
        uint256[] optionVotes;
    }

    Results results; // Store the results

    // Events
    event VoteCast(address voter, uint256 option);

    // Constructor
    constructor(string memory _title, string[] memory _options) {
        title = _title;
        options = _options;
        results.optionVotes = new uint256[](options.length); // Initialize results
    }

    // Function to cast a vote
    function vote(uint256 option, string memory hash) public {
        require(option < options.length, "Invalid option");
         // Check if user already voted 
        if (votes[msg.sender] > 0) { 
            revert("Address has already voted - Ethereum");
        }
        if (users[hash] > 0) { 
            revert("User has already voted - WorldID");
        }
       
        votes[msg.sender] = option+1;
        users[hash] = option+1;
        // Update the results
        results.optionVotes[option]++;

        emit VoteCast(msg.sender, option);
    }

    function getResults() public view returns (string memory, string[] memory,uint256[] memory) {
        return (title, options, results.optionVotes);
    }
    //funtion to return title and options
    function getMetadata() public view returns (string memory, string[] memory) {
        return (title, options);
    }
}
