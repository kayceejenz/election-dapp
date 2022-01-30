pragma solidity >=0.4.22;

contract Election{

    // model a candidate
    struct Candidate{
        uint id;
        string name;
        uint voteCount;
    }

    // Store candiates
    mapping(uint => Candidate) public candidates;
    mapping(address => bool) public voteHistory;

    // Fetch candidate
    uint public candidatesCount;
    // Store candidate count

    // Constructor
    constructor() public {
       addCandidate("Candidate 1");
       addCandidate("Candidate 2");
    }

  
    // Add candidate to our map
    function addCandidate(string memory _name) private{
        candidatesCount++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
    }


    // Vote event
    event VoteEvent(
        uint indexed _candidateId
    );
    
    function castVote(uint _candidateId) public {
        // Validate the voter
        require(!voteHistory[msg.sender]);

        // Validate the candidateId
        require(_candidateId > 0 && _candidateId <= candidatesCount);

        voteHistory[msg.sender] = true;
        candidates[_candidateId].voteCount++;

        // Trigger vote event
        emit VoteEvent(_candidateId);
    }
} 