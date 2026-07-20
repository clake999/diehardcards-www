import assert from "node:assert/strict";
import test from "node:test";

import worker from "../src/index.js";
import {
    INTERESTS,
    MIN_COMPLETION_MS,
    escapeHtml,
    validateContactPayload,
} from "../src/contact.mjs";

const now = 1_800_000_000_000;

function validPayload(overrides = {}) {
    return {
        name: "Ada Collector",
        email: "ADA@example.com",
        interest: "private_alpha",
        message: "I would like to participate.",
        website: "",
        startedAt: now - MIN_COMPLETION_MS - 1,
        turnstileToken: "test-token",
        ...overrides,
    };
}

test("accepts and normalizes a valid payload", () => {
    const result = validateContactPayload(validPayload(), now);

    assert.equal(result.ok, true);
    assert.deepEqual(result.value, {
        name: "Ada Collector",
        email: "ada@example.com",
        interest: "private_alpha",
        message: "I would like to participate.",
        turnstileToken: "test-token",
    });
    assert.equal(INTERESTS[result.value.interest], "Joining the private alpha");
});

test("rejects missing required fields", () => {
    assert.equal(validateContactPayload(validPayload({ name: "" }), now).field, "name");
    assert.equal(validateContactPayload(validPayload({ turnstileToken: "" }), now).abuse, true);
});

test("rejects an invalid email", () => {
    const result = validateContactPayload(validPayload({ email: "not-an-email" }), now);
    assert.deepEqual(result, { ok: false, field: "email", abuse: false });
});

test("rejects an interest outside the allowlist", () => {
    const result = validateContactPayload(validPayload({ interest: "admin_access" }), now);
    assert.equal(result.field, "interest");
});

test("rejects a filled honeypot as abuse", () => {
    const result = validateContactPayload(validPayload({ website: "https://spam.invalid" }), now);
    assert.equal(result.abuse, true);
});

test("rejects a submission completed too quickly", () => {
    const result = validateContactPayload(validPayload({ startedAt: now - 100 }), now);
    assert.equal(result.abuse, true);
});

test("rejects a message over 2,000 characters", () => {
    const result = validateContactPayload(validPayload({ message: "x".repeat(2_001) }), now);
    assert.equal(result.field, "message");
});

test("escapes HTML-sensitive characters", () => {
    assert.equal(
        escapeHtml(`<script data-x="one">Tom & 'Ada'</script>`),
        "&lt;script data-x=&quot;one&quot;&gt;Tom &amp; &#39;Ada&#39;&lt;/script&gt;",
    );
});

test("returns 405 for unsupported contact methods", async () => {
    const response = await worker.fetch(new Request("https://diehard.cards/api/contact"), {});

    assert.equal(response.status, 405);
    assert.equal(response.headers.get("Allow"), "POST");
    assert.deepEqual(await response.json(), { ok: false, message: "Method not allowed." });
});

test("returns 400 for malformed JSON without upstream calls", async () => {
    const request = new Request("https://diehard.cards/api/contact", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Origin: "https://diehard.cards",
        },
        body: "{",
    });
    const env = {
        TURNSTILE_SECRET_KEY: "configured",
        SENDGRID_API_KEY: "configured",
        CONTACT_TO_EMAIL: "hello@diehard.cards",
        CONTACT_FROM_EMAIL: "no-reply@diehard.cards",
    };
    const response = await worker.fetch(request, env);

    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), {
        ok: false,
        message: "Please check the form and try again.",
    });
});
