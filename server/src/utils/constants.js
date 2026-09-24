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

// Asset Management Constants
export const ASSET_STATUSES = [
  "AVAILABLE",
  "ASSIGNED",
  "UNDER_REPAIR",
  "REPLACED",
  "RETIRED",
  "LOST",
];

export const ASSET_CATEGORIES = [
  "LAPTOP",
  "DESKTOP",
  "MONITOR",
  "PRINTER",
  "NETWORK",
  "MOBILE",
  "SOFTWARE",
  "SERVER",
  "OTHER",
];

export const VENDOR_STATUSES = ["ACTIVE", "INACTIVE"];

export const ASSET_HISTORY_ACTIONS = [
  "CREATED",
  "ASSIGNED",
  "UNASSIGNED",
  "SENT_FOR_REPAIR",
  "RETURNED_FROM_REPAIR",
  "REPLACED",
  "RETIRED",
  "REPORTED_LOST",
  "RECOVERED",
  "UPDATED",
];

export const ALLOWED_ASSET_TRANSITIONS = {
  AVAILABLE: ["ASSIGNED", "RETIRED", "UNDER_REPAIR"],
  ASSIGNED: ["AVAILABLE", "UNDER_REPAIR", "REPLACED", "LOST", "RETIRED"],
  UNDER_REPAIR: ["AVAILABLE", "RETIRED", "REPLACED"],
  REPLACED: ["RETIRED"],
  LOST: ["AVAILABLE", "RETIRED"],
  RETIRED: [],
};

export const isValidAssetTransition = (currentStatus, targetStatus) => {
  const allowed = ALLOWED_ASSET_TRANSITIONS[currentStatus];
  return Array.isArray(allowed) && allowed.includes(targetStatus);
};

// Knowledge Base Constants
export const ARTICLE_CATEGORIES = [
  "PASSWORDS",
  "NETWORK",
  "HARDWARE",
  "SOFTWARE",
  "EMAIL",
  "SECURITY",
  "VPN",
  "PRINTER",
  "ACCOUNT_ACCESS",
  "GENERAL",
];

export const ARTICLE_STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED"];

export const ARTICLE_VISIBILITIES = ["PUBLIC", "INTERNAL", "DEPARTMENT"];

export const ALLOWED_ARTICLE_TRANSITIONS = {
  DRAFT: ["PUBLISHED"],
  PUBLISHED: ["ARCHIVED", "DRAFT"],
  ARCHIVED: ["DRAFT"],
};

export const isValidArticleTransition = (currentStatus, targetStatus) => {
  const allowed = ALLOWED_ARTICLE_TRANSITIONS[currentStatus];
  return Array.isArray(allowed) && allowed.includes(targetStatus);
};

// Category compatibility mapping between Ticket categories and Article categories
export const CATEGORY_COMPATIBILITY = {
  HARDWARE: ["HARDWARE", "PRINTER"],
  NETWORK: ["NETWORK", "VPN"],
  ACCESS: ["ACCOUNT_ACCESS", "PASSWORDS", "SECURITY"],
  SOFTWARE: ["SOFTWARE", "EMAIL"],
  GENERAL: [
    "GENERAL",
    "HARDWARE",
    "NETWORK",
    "ACCESS",
    "SOFTWARE",
    "SECURITY",
    "PASSWORDS",
    "VPN",
    "PRINTER",
    "ACCOUNT_ACCESS",
    "EMAIL",
  ],
};

