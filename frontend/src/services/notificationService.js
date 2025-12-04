import api from "../utils/api";

export async function fetchLowFunds(envelopes, options = {}) {
  const payload = {
    envelopes,
    absolute_threshold: options.absoluteThreshold ?? null,
    percentage_threshold: options.percentageThreshold ?? 0.1,
  };
  const response = await api.post("/notifications/low-funds", payload);
  return response.data;
}

export async function sendLowFundsTestEmail(envelopes, options = {}) {
  const payload = {
    envelopes,
    absolute_threshold: options.absoluteThreshold ?? null,
    percentage_threshold: options.percentageThreshold ?? 0.1,
    to_email: options.toEmail,
    subject: options.subject || "Low funds alert from Budget CAR",
  };
  const response = await api.post("/notifications/low-funds/test-email", payload);
  return response.data;
}
