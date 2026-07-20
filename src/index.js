import {
    MAX_BODY_BYTES,
    buildEmailPayload,
    validateContactPayload,
} from "./contact.mjs";

const CONTACT_PATH = "/api/contact";
const CONFIG_PATH = "/api/contact/config";
const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const SENDGRID_URL = "https://api.sendgrid.com/v3/mail/send";
const PRODUCTION_HOSTNAMES = new Set(["diehard.cards", "www.diehard.cards"]);

export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        if (url.pathname === CONFIG_PATH) {
            if (request.method !== "GET") {
                return jsonResponse(405, false, "Method not allowed.", { Allow: "GET" });
            }
            return handleConfig(env);
        }

        if (url.pathname === CONTACT_PATH) {
            if (request.method !== "POST") {
                return jsonResponse(405, false, "Method not allowed.", { Allow: "POST" });
            }
            return handleContact(request, env, url);
        }

        if (url.pathname.startsWith("/api/")) {
            return jsonResponse(404, false, "Not found.");
        }

        return env.ASSETS.fetch(request);
    },
};

function handleConfig(env) {
    if (!isConfigured(env.TURNSTILE_SITE_KEY)) {
        return jsonResponse(503, false, "The contact form is temporarily unavailable.");
    }

    return new Response(JSON.stringify({
        ok: true,
        turnstileSiteKey: env.TURNSTILE_SITE_KEY,
    }), {
        status: 200,
        headers: responseHeaders(),
    });
}

async function handleContact(request, env, url) {
    if (!hasValidConfiguration(env)) {
        return jsonResponse(503, false, "We could not send your request right now. Please try again later.");
    }

    if (!isSameOrigin(request, url)) {
        return abuseResponse();
    }

    const contentType = request.headers.get("Content-Type") || "";
    if (!contentType.toLowerCase().startsWith("application/json")) {
        return jsonResponse(415, false, "Please check the form and try again.");
    }

    const contentLength = Number(request.headers.get("Content-Length"));
    if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
        return jsonResponse(413, false, "Please check the form and try again.");
    }

    let rawBody;
    try {
        rawBody = await request.text();
    } catch {
        return jsonResponse(400, false, "Please check the form and try again.");
    }

    if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
        return jsonResponse(413, false, "Please check the form and try again.");
    }

    let input;
    try {
        input = JSON.parse(rawBody);
    } catch {
        return jsonResponse(400, false, "Please check the form and try again.");
    }

    const validation = validateContactPayload(input);
    if (!validation.ok) {
        return validation.abuse
            ? abuseResponse()
            : jsonResponse(400, false, "Please check the form and try again.");
    }

    const turnstileValid = await verifyTurnstile(
        validation.value.turnstileToken,
        request.headers.get("CF-Connecting-IP"),
        env.TURNSTILE_SECRET_KEY,
        url.hostname,
    );
    if (!turnstileValid) {
        return abuseResponse();
    }

    const contact = { ...validation.value };
    delete contact.turnstileToken;
    const emailPayload = buildEmailPayload(
        contact,
        env,
        new Date().toISOString(),
        request.cf?.country,
    );

    let sendGridResponse;
    try {
        sendGridResponse = await fetch(SENDGRID_URL, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${env.SENDGRID_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(emailPayload),
        });
    } catch {
        return jsonResponse(502, false, "We could not send your request right now. Please try again later.");
    }

    if (sendGridResponse.status !== 202) {
        return jsonResponse(502, false, "We could not send your request right now. Please try again later.");
    }

    return jsonResponse(201, true, "Thanks — your request has been sent.");
}

async function verifyTurnstile(token, remoteIp, secret, requestHostname) {
    const body = new URLSearchParams({ secret, response: token });
    if (remoteIp) {
        body.set("remoteip", remoteIp);
    }

    let response;
    try {
        response = await fetch(TURNSTILE_VERIFY_URL, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body,
        });
    } catch {
        return false;
    }

    if (!response.ok) {
        return false;
    }

    let result;
    try {
        result = await response.json();
    } catch {
        return false;
    }

    if (!result || result.success !== true || typeof result.hostname !== "string") {
        return false;
    }

    if (isLocalHostname(requestHostname)) {
        return result.hostname === "example.com";
    }

    return PRODUCTION_HOSTNAMES.has(requestHostname) && result.hostname === requestHostname;
}

function isSameOrigin(request, url) {
    const origin = request.headers.get("Origin");
    if (!origin) {
        return false;
    }

    try {
        return new URL(origin).origin === url.origin;
    } catch {
        return false;
    }
}

function isLocalHostname(hostname) {
    return hostname === "localhost" || hostname === "127.0.0.1";
}

function hasValidConfiguration(env) {
    return [
        env.TURNSTILE_SECRET_KEY,
        env.SENDGRID_API_KEY,
        env.CONTACT_TO_EMAIL,
        env.CONTACT_FROM_EMAIL,
    ].every(isConfigured);
}

function isConfigured(value) {
    return typeof value === "string" && value.length > 0 && !value.startsWith("REPLACE_WITH_");
}

function abuseResponse() {
    return jsonResponse(403, false, "Please check the form and try again.");
}

function jsonResponse(status, ok, message, extraHeaders = {}) {
    return new Response(JSON.stringify({ ok, message }), {
        status,
        headers: responseHeaders(extraHeaders),
    });
}

function responseHeaders(extraHeaders = {}) {
    return {
        "Cache-Control": "no-store",
        "Content-Type": "application/json; charset=utf-8",
        "X-Content-Type-Options": "nosniff",
        ...extraHeaders,
    };
}
