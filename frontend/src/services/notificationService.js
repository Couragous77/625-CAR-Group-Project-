import { apiRequest } from "../utils/api";

export async function fetchLowFunds(envelopes, options = {}) {
  return apiRequest(
    "/notifications/low-funds",
    {
      method: "POST",
      body: JSON.stringify({
        envelopes,
        absolute_threshold: options.absoluteThreshold ?? null,
        percentage_threshold: options.percentageThreshold ?? 0.1,
      }),
    }
  );
}

export async function sendLowFundsTestEmail(envelopes, options = {}) {
  return apiRequest(
    "/notifications/low-funds/test-email",
    {
      method: "POST",
      body: JSON.stringify({
        envelopes,
        absolute_threshold: options.absoluteThreshold ?? null,
        percentage_threshold: options.percentageThreshold ?? 0.1,
        to_email: options.toEmail,
        subject: options.subject || "Low funds alert from Budget CAR",
      }),
    }
  );
}

export async function calculateLowFunds() {
  return apiRequest("/notifications/low-funds/check", {});
}

