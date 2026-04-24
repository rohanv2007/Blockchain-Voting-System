const Voting = artifacts.require("Voting");

module.exports = function (deployer, network, accounts) {
  deployer.deploy(Voting).then(() => {
    console.log("========================================");
    console.log("Voting Contract deployed successfully!");
    console.log("Contract Address:", Voting.address);
    console.log("Deployer (Admin):", accounts[0]);
    console.log("========================================");
    console.log("Copy the Contract Address above into:");
    console.log("  1. backend/.env → CONTRACT_ADDRESS");
    console.log("  2. frontend/src/utils/web3Utils.js → CONTRACT_ADDRESS");
    console.log("========================================");
  });
};
