App = {
  web3Provider: null,
  contracts: {},
  account: "0x0",

  init: () => {
    return App.initWeb3();
  },

  initWeb3: () => {

    if(typeof window !== 'undefined' && typeof window.ethereum !== 'undefined'){
      //getting Permission to access. This is for when the user has new MetaMask
      App.web3Provider = window.ethereum;
      web3 = new Web3(window.ethereum);
    
    }else if (typeof window !== 'undefined' && typeof window.web3 !== 'undefined') {
      web3 = new Web3(window.web3.currentProvider);
      // Acccounts always exposed. This is those who have old version of MetaMask
    
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
    
    }
    // Initial contract
    return App.initContract();
  },

  initContract: () => {
    $.getJSON("Election.json", (election) => { 

      // Instantiate a truffle contract from the artifact
      App.contracts.Election = TruffleContract(election);

      // Connect provider to interact with contract
      App.contracts.Election.setProvider(App.web3Provider);

      // Listen for events
      App.listentForEvent();

      // Render app content
      return App.render();
    })
  },

  listentForEvent: ()=>{
    App.contracts.Election.deployed().then((instance)=>{
      instance.VoteEvent({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).watch((err, event) =>{
        console.log("event triggered", event);
        // App.render();
      })
    })
  },

  castVote : () =>{
    const candidateId = $("#CandidateSelect").val();
    App.contracts.Election.deployed().then((instance) => {
      return instance.castVote(candidateId, { from: App.account });
    }).then((result) => {
      const loader = $("#loader");
      const content = $("#content");

      loader.show();
      content.hide();
    }).catch((err) => {
      console.log(err);
    })
  },

  render: () => {
    let electionInstance;
    const loader = $("#loader");
    const content = $("#content");

    loader.show();
    content.hide();


    // Load account data
      ethereum.request({ method: "eth_requestAccounts"}).then((accounts) => {
          App.account = accounts[0];
          $("#accountAddress").html("Connected account : "+ accounts[0]);
      });


    // Load contract data;

    App.contracts.Election.deployed().then((instance) => {
      electionInstance = instance;
      return electionInstance.candidatesCount();
    }).then((count) => {
      var candidatesResults = $("#candidateResults");
      candidatesResults.empty();
      var candidateSelect = $("#CandidateSelect");
      candidateSelect.empty();

      for(let i = 1; i <= count; i++){
        electionInstance.candidates(i).then((candidate) => {
          const id = candidate[0];
          const name = candidate[1];
          const votes = candidate[2];

          const candidateTemplate = `<tr><th> ${id} </th><td>${name} </td><td> ${votes} </td></tr>`;
          candidatesResults.append(candidateTemplate);

          const candidateSelectTemplate = `<option value="${id}">${name} </option>`;
          candidateSelect.append(candidateSelectTemplate);
        });       
      }

      return electionInstance.voteHistory(App.account);

    }).then((voted) => {
      if(voted){
        $('form').hide();
      }
      loader.hide();
      content.show();
    }).catch((err) => {
      console.warn(err);
    })
  }

};

$(function() {
  $(window).load(() => {
    App.init();
  });
});
