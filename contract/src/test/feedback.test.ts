// Anonymous Employee Feedback Unit Tests
import { BBoardSimulator } from "./bboard-simulator.js";
import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { describe, it, expect } from "vitest";
import { randomBytes } from "./utils.js";

setNetworkId("undeployed");

describe("Anonymous Employee Feedback Midnight Contract", () => {
  it("Test 1: Initializes public ledger state with zero feedback count and zero rating sum", () => {
    const key = randomBytes(32);
    const simulator = new BBoardSimulator(key);
    const ledger = simulator.getLedger();

    expect(ledger.totalFeedbackCount).toEqual(0n);
    expect(ledger.totalRatingSum).toEqual(0n);
    expect(ledger.lastCategory.is_some).toEqual(false);
  });

  it("Test 2: Submits anonymous feedback and updates on-chain aggregate rating state", () => {
    const key = randomBytes(32);
    const simulator = new BBoardSimulator(key);
    const digest = new Uint8Array(32);
    digest[0] = 42;

    simulator.submitFeedback(5n, "Engineering", digest);

    const ledger = simulator.getLedger();
    expect(ledger.totalFeedbackCount).toEqual(1n);
    expect(ledger.totalRatingSum).toEqual(5n);
    expect(ledger.lastCategory.is_some).toEqual(true);
    expect(ledger.lastCategory.value).toEqual("Engineering");
    expect(ledger.lastFeedbackDigest[0]).toEqual(42);
  });

  it("Test 3: Accumulates multiple anonymous feedbacks while maintaining ZK privacy", () => {
    const emp1Key = randomBytes(32);
    const emp2Key = randomBytes(32);
    const simulator = new BBoardSimulator(emp1Key);

    // Employee 1 submits rating 4
    simulator.submitFeedback(4n, "Product", new Uint8Array(32));

    // Employee 2 submits rating 5 anonymously
    simulator.switchUser(emp2Key);
    simulator.submitFeedback(5n, "Product", new Uint8Array(32));

    const ledger = simulator.getLedger();
    expect(ledger.totalFeedbackCount).toEqual(2n);
    expect(ledger.totalRatingSum).toEqual(9n);
    const averageRating = Number(ledger.totalRatingSum) / Number(ledger.totalFeedbackCount);
    expect(averageRating).toEqual(4.5);
  });

  it("Test 4: Enforces rating validation boundaries (1 to 5)", () => {
    const simulator = new BBoardSimulator(randomBytes(32));
    
    // Rating 0 should fail circuit assertion
    expect(() => {
      simulator.submitFeedback(0n, "HR", new Uint8Array(32));
    }).toThrow();

    // Rating 6 should fail circuit assertion
    expect(() => {
      simulator.submitFeedback(6n, "HR", new Uint8Array(32));
    }).toThrow();
  });

  it("Test 5: Confidentiality check - employee secret key is never published on ledger", () => {
    const secretKey = randomBytes(32);
    const simulator = new BBoardSimulator(secretKey);
    simulator.submitFeedback(5n, "Engineering", new Uint8Array(32));

    const ledger = simulator.getLedger();
    
    // Ledger owner is empty or non-secret, secret key is preserved in private state
    expect(ledger.owner).not.toEqual(secretKey);
    expect(simulator.getPrivateState().secretKey).toEqual(secretKey);
  });
});
