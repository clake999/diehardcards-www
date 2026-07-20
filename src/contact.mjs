export const INTERESTS = Object.freeze({
    learn_more: "Learning more about DieHardCards",
    private_alpha: "Joining the private alpha",
    hans: "Hans scanning technology",
    other: "Something else",
});

export const MAX_BODY_BYTES = 16_384;
export const MIN_COMPLETION_MS = 3_000;
const MAX_FORM_AGE_MS = 2 * 60 * 60 * 1_000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CONTROL_CHARACTER_PATTERN = /[\u0000-\u001f\u007f]/;
const MESSAGE_CONTROL_CHARACTER_PATTERN = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/;

export function validateContactPayload(input, now = Date.now()) {
    if (!input || typeof input !== "object" || Array.isArray(input)) {
        return invalid("payload");
    }

    const name = normalizeString(input.name);
    const email = normalizeString(input.email).toLowerCase();
    const interest = normalizeString(input.interest);
    const message = normalizeMessage(input.message);
    const website = normalizeString(input.website);
    const turnstileToken = normalizeString(input.turnstileToken);
    const startedAt = Number(input.startedAt);

    if (website) {
        return invalid("abuse", true);
    }

    if (!Number.isFinite(startedAt) || now - startedAt < MIN_COMPLETION_MS || now - startedAt > MAX_FORM_AGE_MS) {
        return invalid("abuse", true);
    }

    if (name.length < 2 || name.length > 100 || CONTROL_CHARACTER_PATTERN.test(name)) {
        return invalid("name");
    }

    if (email.length > 254 || !EMAIL_PATTERN.test(email) || CONTROL_CHARACTER_PATTERN.test(email)) {
        return invalid("email");
    }

    if (!Object.hasOwn(INTERESTS, interest)) {
        return invalid("interest");
    }

    if (message.length > 2_000 || MESSAGE_CONTROL_CHARACTER_PATTERN.test(message)) {
        return invalid("message");
    }

    if (!turnstileToken || turnstileToken.length > 2_048 || CONTROL_CHARACTER_PATTERN.test(turnstileToken)) {
        return invalid("turnstile", true);
    }

    return {
        ok: true,
        value: { name, email, interest, message, turnstileToken },
    };
}

export function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

export function buildEmailPayload(contact, env, submittedAt, country) {
    const interestLabel = INTERESTS[contact.interest];
    const message = contact.message || "Not provided";
    const countryLabel = country || "Unknown";
    const rows = [
        ["Name", contact.name],
        ["Email", contact.email],
        ["Interest", interestLabel],
        ["Message", message],
        ["Submitted", submittedAt],
        ["Country", countryLabel],
    ];
    const text = rows.map(([label, value]) => `${label}: ${value}`).join("\n\n");
    const html = rows.map(([label, value]) => (
        `<p><strong>${escapeHtml(label)}:</strong><br>${escapeHtml(value).replaceAll("\n", "<br>")}</p>`
    )).join("");

    return {
        personalizations: [{
            to: [{ email: env.CONTACT_TO_EMAIL }],
            subject: `DieHardCards website inquiry: ${interestLabel}`,
        }],
        from: { email: env.CONTACT_FROM_EMAIL, name: "DieHardCards Website" },
        reply_to: { email: contact.email, name: contact.name },
        content: [
            { type: "text/plain", value: text },
            { type: "text/html", value: html },
        ],
    };
}

function normalizeString(value) {
    return typeof value === "string" ? value.trim() : "";
}

function normalizeMessage(value) {
    return normalizeString(value).replace(/\r\n?/g, "\n");
}

function invalid(field, abuse = false) {
    return { ok: false, field, abuse };
}
