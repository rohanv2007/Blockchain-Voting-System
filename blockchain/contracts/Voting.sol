// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

/// @title Blockchain Voting System
/// @notice A tamper-proof voting contract with admin controls, time-bound elections, and double-vote prevention
contract Voting {
    // ─── State Variables ───────────────────────────────────────────────

    address public owner;

    struct Candidate {
        uint256 id;
        string name;
        string party;
        string imageUrl;
        uint256 voteCount;
        bool exists;
    }

    struct Election {
        string name;
        bool isActive;
        uint256 startTime;
        uint256 endTime;
    }

    Election public election;
    uint256 public candidatesCount;
    mapping(uint256 => Candidate) public candidates;
    mapping(address => bool) public voters;
    uint256 public totalVotes;

    // ─── Events ────────────────────────────────────────────────────────

    event CandidateAdded(uint256 indexed candidateId, string name, string party);
    event ElectionStarted(string name, uint256 startTime, uint256 endTime);
    event ElectionEnded(string name, uint256 endTime, uint256 totalVotes);
    event VoteCast(address indexed voter, uint256 indexed candidateId, uint256 timestamp);

    // ─── Modifiers ─────────────────────────────────────────────────────

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the contract owner can perform this action");
        _;
    }

    modifier electionActive() {
        require(election.isActive, "No active election");
        require(block.timestamp >= election.startTime, "Election has not started yet");
        require(block.timestamp <= election.endTime, "Election period has ended");
        _;
    }

    modifier electionNotActive() {
        require(!election.isActive, "An election is already active");
        _;
    }

    // ─── Constructor ───────────────────────────────────────────────────

    constructor() {
        owner = msg.sender;
    }

    // ─── Admin Functions ───────────────────────────────────────────────

    /// @notice Add a new candidate (only before or during election, but typically before)
    /// @param _name Candidate's full name
    /// @param _party Candidate's party name
    /// @param _imageUrl URL or path to candidate's photo
    function addCandidate(
        string memory _name,
        string memory _party,
        string memory _imageUrl
    ) public onlyOwner {
        candidatesCount++;
        candidates[candidatesCount] = Candidate({
            id: candidatesCount,
            name: _name,
            party: _party,
            imageUrl: _imageUrl,
            voteCount: 0,
            exists: true
        });

        emit CandidateAdded(candidatesCount, _name, _party);
    }

    /// @notice Start a new election with a specified duration
    /// @param _name Name of the election
    /// @param _durationInMinutes How long the election should last
    function startElection(
        string memory _name,
        uint256 _durationInMinutes
    ) public onlyOwner electionNotActive {
        require(candidatesCount > 0, "Add at least one candidate before starting");
        require(_durationInMinutes > 0, "Duration must be greater than zero");

        election = Election({
            name: _name,
            isActive: true,
            startTime: block.timestamp,
            endTime: block.timestamp + (_durationInMinutes * 1 minutes)
        });

        emit ElectionStarted(_name, block.timestamp, election.endTime);
    }

    /// @notice End the current election manually
    function endElection() public onlyOwner {
        require(election.isActive, "No active election to end");

        election.isActive = false;
        election.endTime = block.timestamp;

        emit ElectionEnded(election.name, block.timestamp, totalVotes);
    }

    // ─── Voting Function ──────────────────────────────────────────────

    /// @notice Cast a vote on behalf of a verified voter (called by backend wallet)
    /// @param _candidateId The ID of the candidate to vote for
    /// @param _voterAddress The Ethereum address assigned to the voter
    function castVote(
        uint256 _candidateId,
        address _voterAddress
    ) public onlyOwner electionActive {
        require(!voters[_voterAddress], "This voter has already cast a vote");
        require(_candidateId > 0 && _candidateId <= candidatesCount, "Invalid candidate ID");
        require(candidates[_candidateId].exists, "Candidate does not exist");

        voters[_voterAddress] = true;
        candidates[_candidateId].voteCount++;
        totalVotes++;

        emit VoteCast(_voterAddress, _candidateId, block.timestamp);
    }

    // ─── View Functions ───────────────────────────────────────────────

    /// @notice Get details of a specific candidate
    function getCandidate(uint256 _id)
        public
        view
        returns (
            uint256 id,
            string memory name,
            string memory party,
            string memory imageUrl,
            uint256 voteCount
        )
    {
        require(_id > 0 && _id <= candidatesCount, "Invalid candidate ID");
        Candidate memory c = candidates[_id];
        return (c.id, c.name, c.party, c.imageUrl, c.voteCount);
    }

    /// @notice Get total number of candidates
    function getCandidatesCount() public view returns (uint256) {
        return candidatesCount;
    }

    /// @notice Check if a voter address has already voted
    function hasVoted(address _voter) public view returns (bool) {
        return voters[_voter];
    }

    /// @notice Get current election status
    function getElectionStatus()
        public
        view
        returns (
            string memory name,
            bool isActive,
            uint256 startTime,
            uint256 endTime,
            uint256 _totalVotes
        )
    {
        // Auto-detect if election time has passed
        bool active = election.isActive && block.timestamp <= election.endTime;
        return (
            election.name,
            active,
            election.startTime,
            election.endTime,
            totalVotes
        );
    }

    /// @notice Get all candidates with their vote counts (for results)
    function getResults()
        public
        view
        returns (
            uint256[] memory ids,
            string[] memory names,
            string[] memory parties,
            string[] memory imageUrls,
            uint256[] memory voteCounts
        )
    {
        ids = new uint256[](candidatesCount);
        names = new string[](candidatesCount);
        parties = new string[](candidatesCount);
        imageUrls = new string[](candidatesCount);
        voteCounts = new uint256[](candidatesCount);

        for (uint256 i = 1; i <= candidatesCount; i++) {
            Candidate memory c = candidates[i];
            ids[i - 1] = c.id;
            names[i - 1] = c.name;
            parties[i - 1] = c.party;
            imageUrls[i - 1] = c.imageUrl;
            voteCounts[i - 1] = c.voteCount;
        }

        return (ids, names, parties, imageUrls, voteCounts);
    }
}
