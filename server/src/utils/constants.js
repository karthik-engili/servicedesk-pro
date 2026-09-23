export const TICKET_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

export const TICKET_STATUSES = [
  "OPEN",
  "ASSIGNED",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
  "REOPENED",
];

export const TICKET_CATEGORIES = [
  "HARDWARE",
  "SOFTWARE",
  "NETWORK",
  "ACCESS",
  "GENERAL",
];

export const SLA_STATUSES = ["WITHIN_SLA", "APPROACHING", "BREACHED", "MET"];

export const ALLOWED_TRANSITIONS = {
  OPEN: ["ASSIGNED"],
  ASSIGNED: ["IN_PROGRESS", "ASSIGNED"],
  IN_PROGRESS: ["RESOLVED", "ASSIGNED"],
  RESOLVED: ["CLOSED", "REOPENED"],
  REOPENED: ["IN_PROGRESS", "ASSIGNED"],
  CLOSED: [],
};

export const isValidTransition = (currentStatus, targetStatus) => {
  const allowed = ALLOWED_TRANSITIONS[currentStatus];
  return Array.isArray(allowed) && allowed.includes(targetStatus);
};
