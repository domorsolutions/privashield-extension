// Unit tests for checkForLeaks and redactText logic
// Run with: node --test tests/

import { strict as assert } from "node:assert";
import { describe, it } from "node:test";

// Extracted from content.js for isolated testing
const leakPatterns = {
  email:      { regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z]{2,}\b/gi },
  phone:      { regex: /\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g },
  ssn:        { regex: /\b\d{3}-\d{2}-\d{4}\b/g },
  creditCard: { regex: /\b(?:\d{4}[-\s]?){3}\d{4}\b/g },
  apiKey:     { regex: /\b(?:sk-|ghp_|xox[baprs]-)[A-Za-z0-9]{20,}\b/g },
};

function checkForLeaks(text) {
  const found = [];
  for (const [type, { regex }] of Object.entries(leakPatterns)) {
    regex.lastIndex = 0;
    if (regex.test(text)) found.push(type);
  }
  return found;
}

function redactText(text) {
  let redacted = text;
  for (const { regex } of Object.values(leakPatterns)) {
    regex.lastIndex = 0;
    redacted = redacted.replace(regex, "[REDACTED]");
  }
  return redacted;
}

describe("checkForLeaks", () => {
  it("returns empty array for clean text", () => {
    assert.deepEqual(checkForLeaks("Hello, can you help me write a poem?"), []);
  });

  it("detects email addresses", () => {
    assert.ok(checkForLeaks("My email is john.doe@example.com").includes("email"));
  });

  it("detects US phone numbers", () => {
    assert.ok(checkForLeaks("Call me at 555-867-5309").includes("phone"));
    assert.ok(checkForLeaks("My number is (415) 555-1234").includes("phone"));
    assert.ok(checkForLeaks("+1 800 555 0100").includes("phone"));
  });

  it("detects SSNs", () => {
    assert.ok(checkForLeaks("SSN: 123-45-6789").includes("ssn"));
  });

  it("detects credit card numbers", () => {
    assert.ok(checkForLeaks("Card: 4111 1111 1111 1111").includes("creditCard"));
    assert.ok(checkForLeaks("4111-1111-1111-1111").includes("creditCard"));
  });

  it("detects OpenAI API keys", () => {
    assert.ok(checkForLeaks("My key is sk-abcdefghijklmnopqrstuvwxyz12").includes("apiKey"));
  });

  it("detects GitHub tokens", () => {
    assert.ok(checkForLeaks("Token: ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZabc").includes("apiKey"));
  });

  it("detects multiple PII types in one string", () => {
    const result = checkForLeaks("Email john@test.com, SSN 123-45-6789");
    assert.ok(result.includes("email"));
    assert.ok(result.includes("ssn"));
  });

  it("returns empty array for numbers that are not phone numbers", () => {
    // A plain number shorter than 10 digits should not trigger phone
    const result = checkForLeaks("Version 1234567");
    assert.ok(!result.includes("phone"));
  });
});

describe("redactText", () => {
  it("replaces email with [REDACTED]", () => {
    const result = redactText("Contact me at alice@example.com thanks");
    assert.ok(result.includes("[REDACTED]"));
    assert.ok(!result.includes("alice@example.com"));
  });

  it("replaces SSN with [REDACTED]", () => {
    const result = redactText("My SSN is 987-65-4321");
    assert.ok(result.includes("[REDACTED]"));
    assert.ok(!result.includes("987-65-4321"));
  });

  it("preserves non-PII text", () => {
    const result = redactText("Hello, how are you?");
    assert.equal(result, "Hello, how are you?");
  });

  it("replaces multiple PII in one string", () => {
    const result = redactText("Email: bob@test.com, SSN: 123-45-6789");
    assert.equal(result.split("[REDACTED]").length - 1, 2);
  });
});
