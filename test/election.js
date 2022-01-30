var Election =  artifacts.require("./Election.sol");
var ElectionInstance;
var defaultAccount;
var candidateId;
contract("Election", function(accounts){
    it("initializes with two candidates",function(){
        return Election.deployed().then(function(instance){
            return instance.candidatesCount();
        }).then(function(count){
            assert.equal(count, 2);
        })
    });

    it("initialized with correct values", function(){
        return Election.deployed().then(function(instance){
            ElectionInstance = instance;
            return ElectionInstance.candidates(1);
        }).then(function(candidate){
            assert.equal(candidate[0], 1, "Candidate id is valid");
            assert.equal(candidate[1], "Candidate 1", "Candidate name is valid");
            assert.equal(candidate[2], 0, "Candidate vote count is valid");

            return ElectionInstance.candidates(2);
        }).then(function(candidate){
            assert.equal(candidate[0], 2, "Candidate id is valid");
            assert.equal(candidate[1], "Candidate 2", "Candidate name is valid");
            assert.equal(candidate[2], 0, "Candidate vote count is valid");

        })
    });

    it("allow voter to cast vote", function(){
        return Election.deployed().then(function(instance){
            ElectionInstance = instance;
            candidateId = 1;
            defaultAccount = accounts[0];
            return ElectionInstance.castVote(1, { from: defaultAccount });
        }).then(function(recipet){
            return ElectionInstance.voteHistory(defaultAccount);
        }).then(function(voted){
            assert(voted, "This voter has voted");
            return ElectionInstance.candidates(candidateId);
        }).then(function(candidate){
            assert.equal(candidate[2], 1, "Increment the candidate votes")
        })
    })
})