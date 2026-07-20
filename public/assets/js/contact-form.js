(() => {
    "use strict";

    const form = document.getElementById("contact-form");
    const submitButton = document.getElementById("contact-submit");
    const status = document.getElementById("contact-status");
    const startedAt = document.getElementById("contact-started-at");
    const year = document.getElementById("year");
    let widgetId;
    let turnstileToken = "";

    if (year) {
        year.textContent = new Date().getFullYear();
    }

    if (!form || !submitButton || !status || !startedAt) {
        return;
    }

    setStartTime();
    initializeTurnstile();
    form.addEventListener("submit", handleSubmit);

    async function initializeTurnstile() {
        try {
            const response = await fetch("/api/contact/config", {
                headers: { Accept: "application/json" },
            });
            const result = await response.json();

            if (!response.ok || !result.ok || !result.turnstileSiteKey || !window.turnstile) {
                throw new Error();
            }

            widgetId = window.turnstile.render("#turnstile-widget", {
                sitekey: result.turnstileSiteKey,
                theme: "light",
                callback(token) {
                    turnstileToken = token;
                    submitButton.disabled = false;
                    clearStatus();
                },
                "expired-callback"() {
                    turnstileToken = "";
                    submitButton.disabled = true;
                },
                "error-callback"() {
                    turnstileToken = "";
                    submitButton.disabled = true;
                    showStatus("Verification could not load. Please refresh and try again.", "error");
                },
            });
        } catch {
            showStatus("The contact form is temporarily unavailable. Please use the email link instead.", "error");
        }
    }

    async function handleSubmit(event) {
        event.preventDefault();

        if (!form.reportValidity()) {
            return;
        }

        if (!turnstileToken) {
            showStatus("Please complete the security verification.", "error");
            return;
        }

        const formData = new FormData(form);
        const payload = {
            name: formData.get("name"),
            email: formData.get("email"),
            interest: formData.get("interest"),
            message: formData.get("message"),
            website: formData.get("website"),
            startedAt: formData.get("startedAt"),
            turnstileToken,
        };

        submitButton.disabled = true;
        submitButton.setAttribute("aria-disabled", "true");
        showStatus("Sending your request…", "pending");

        try {
            const response = await fetch("/api/contact", {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });
            const result = await response.json();

            if (response.ok && result.ok) {
                form.reset();
                setStartTime();
                showStatus(result.message, "success");
            } else {
                showStatus(
                    result.message || "We could not send your request right now. Please try again later.",
                    "error",
                );
            }
        } catch {
            showStatus("We could not send your request right now. Please try again later.", "error");
        } finally {
            turnstileToken = "";
            submitButton.removeAttribute("aria-disabled");
            if (window.turnstile && widgetId !== undefined) {
                window.turnstile.reset(widgetId);
            }
        }
    }

    function setStartTime() {
        startedAt.value = String(Date.now());
    }

    function showStatus(message, state) {
        status.textContent = message;
        status.dataset.state = state;
    }

    function clearStatus() {
        status.textContent = "";
        delete status.dataset.state;
    }
})();
