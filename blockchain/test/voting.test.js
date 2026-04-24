const Voting = artifacts.require("Voting");

contract("Voting", (accounts) => {
  const owner = accounts[0];
  const voter1 = accounts[1];
  const voter2 = accounts[2];
  const nonOwner = accounts[3];

  let votingInstance;

  beforeEach(async () => {
    votingInstance = await Voting.new({ from: owner });
  });

  // ─── Candidate Management ─────────────────────────────────────────

  describe("Candidate Management", () => {
    it("should add a candidate successfully", async () => {
      await votingInstance.addCandidate("Alice Johnson", "Democratic Party", "/images/alice.jpg", { from: owner });

      const count = await votingInstance.getCandidatesCount();
      assert.equal(count.toNumber(), 1, "Candidate count should be 1");

      const candidate = await votingInstance.getCandidate(1);
      assert.equal(candidate.name, "Alice Johnson");
      assert.equal(candidate.party, "Democratic Party");
      assert.equal(candidate.voteCount.toNumber(), 0);
    });

    it("should add multiple candidates", async () => {
      await votingInstance.addCandidate("Alice", "Party A", "/img/a.jpg", { from: owner });
      await votingInstance.addCandidate("Bob", "Party B", "/img/b.jpg", { from: owner });
      await votingInstance.addCandidate("Charlie", "Party C", "/img/c.jpg", { from: owner });

      const count = await votingInstance.getCandidatesCount();
      assert.equal(count.toNumber(), 3);
    });

    it("should emit CandidateAdded event", async () => {
      const result = await votingInstance.addCandidate("Alice", "Party A", "/img/a.jpg", { from: owner });

      assert.equal(result.logs[0].event, "CandidateAdded");
      assert.equal(result.logs[0].args.candidateId.toNumber(), 1);
      assert.equal(result.logs[0].args.name, "Alice");
    });

    it("should reject non-owner adding candidates", async () => {
      try {
        await votingInstance.addCandidate("Alice", "Party A", "/img/a.jpg", { from: nonOwner });
        assert.fail("Expected revert not received");
      } catch (error) {
        assert(error.message.includes("Only the contract owner"), "Expected owner restriction error");
      }
    });
  });

  // ─── Election Control ─────────────────────────────────────────────

  describe("Election Control", () => {
    beforeEach(async () => {
      await votingInstance.addCandidate("Alice", "Party A", "/img/a.jpg", { from: owner });
      await votingInstance.addCandidate("Bob", "Party B", "/img/b.jpg", { from: owner });
    });

    it("should start an election", async () => {
      const result = await votingInstance.startElection("General Election 2026", 60, { from: owner });

      assert.equal(result.logs[0].event, "ElectionStarted");

      const status = await votingInstance.getElectionStatus();
      assert.equal(status.name, "General Election 2026");
      assert.equal(status.isActive, true);
    });

    it("should not start election without candidates", async () => {
      const freshInstance = await Voting.new({ from: owner });
      try {
        await freshInstance.startElection("Test", 60, { from: owner });
        assert.fail("Expected revert not received");
      } catch (error) {
        assert(error.message.includes("Add at least one candidate"), "Expected candidate requirement error");
      }
    });

    it("should not start election with zero duration", async () => {
      try {
        await votingInstance.startElection("Test", 0, { from: owner });
        assert.fail("Expected revert not received");
      } catch (error) {
        assert(error.message.includes("Duration must be greater than zero"), "Expected duration error");
      }
    });

    it("should not allow starting a second election while one is active", async () => {
      await votingInstance.startElection("Election 1", 60, { from: owner });
      try {
        await votingInstance.startElection("Election 2", 60, { from: owner });
        assert.fail("Expected revert not received");
      } catch (error) {
        assert(error.message.includes("already active"), "Expected active election error");
      }
    });

    it("should end an election", async () => {
      await votingInstance.startElection("Test Election", 60, { from: owner });
      const result = await votingInstance.endElection({ from: owner });

      assert.equal(result.logs[0].event, "ElectionEnded");

      const status = await votingInstance.getElectionStatus();
      assert.equal(status.isActive, false);
    });

    it("should reject non-owner starting election", async () => {
      try {
        await votingInstance.startElection("Test", 60, { from: nonOwner });
        assert.fail("Expected revert not received");
      } catch (error) {
        assert(error.message.includes("Only the contract owner"));
      }
    });
  });

  // ─── Voting ───────────────────────────────────────────────────────

  describe("Voting", () => {
    beforeEach(async () => {
      await votingInstance.addCandidate("Alice", "Party A", "/img/a.jpg", { from: owner });
      await votingInstance.addCandidate("Bob", "Party B", "/img/b.jpg", { from: owner });
      await votingInstance.startElection("Test Election", 60, { from: owner });
    });

    it("should cast a vote successfully", async () => {
      const result = await votingInstance.castVote(1, voter1, { from: owner });

      assert.equal(result.logs[0].event, "VoteCast");
      assert.equal(result.logs[0].args.voter, voter1);
      assert.equal(result.logs[0].args.candidateId.toNumber(), 1);

      const candidate = await votingInstance.getCandidate(1);
      assert.equal(candidate.voteCount.toNumber(), 1);

      const hasVoted = await votingInstance.hasVoted(voter1);
      assert.equal(hasVoted, true);

      const total = await votingInstance.totalVotes();
      assert.equal(total.toNumber(), 1);
    });

    it("should prevent double voting", async () => {
      await votingInstance.castVote(1, voter1, { from: owner });
      try {
        await votingInstance.castVote(2, voter1, { from: owner });
        assert.fail("Expected revert not received");
      } catch (error) {
        assert(error.message.includes("already cast a vote"), "Expected double vote error");
      }
    });

    it("should reject invalid candidate ID", async () => {
      try {
        await votingInstance.castVote(99, voter1, { from: owner });
        assert.fail("Expected revert not received");
      } catch (error) {
        assert(error.message.includes("Invalid candidate ID"), "Expected invalid ID error");
      }
    });

    it("should reject non-owner casting votes", async () => {
      try {
        await votingInstance.castVote(1, voter1, { from: nonOwner });
        assert.fail("Expected revert not received");
      } catch (error) {
        assert(error.message.includes("Only the contract owner"));
      }
    });

    it("should allow multiple different voters", async () => {
      await votingInstance.castVote(1, voter1, { from: owner });
      await votingInstance.castVote(2, voter2, { from: owner });

      const c1 = await votingInstance.getCandidate(1);
      const c2 = await votingInstance.getCandidate(2);
      assert.equal(c1.voteCount.toNumber(), 1);
      assert.equal(c2.voteCount.toNumber(), 1);

      const total = await votingInstance.totalVotes();
      assert.equal(total.toNumber(), 2);
    });
  });

  // ─── Results ──────────────────────────────────────────────────────

  describe("Results", () => {
    it("should return all candidates with vote counts", async () => {
      await votingInstance.addCandidate("Alice", "Party A", "/img/a.jpg", { from: owner });
      await votingInstance.addCandidate("Bob", "Party B", "/img/b.jpg", { from: owner });
      await votingInstance.startElection("Test", 60, { from: owner });

      await votingInstance.castVote(1, voter1, { from: owner });
      await votingInstance.castVote(1, voter2, { from: owner });

      const results = await votingInstance.getResults();

      assert.equal(results.ids.length, 2);
      assert.equal(results.names[0], "Alice");
      assert.equal(results.names[1], "Bob");
      assert.equal(results.voteCounts[0].toNumber(), 2);
      assert.equal(results.voteCounts[1].toNumber(), 0);
    });
  });
});
