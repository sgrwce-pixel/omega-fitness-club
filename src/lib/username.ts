export const INTERNAL_EMAIL_DOMAIN = "omega.internal";

export function normalizeUsername(raw: string): string {
  return String(raw ?? "").trim().toLowerCase();
}

export function usernameToEmail(raw: string): string {
  return `${normalizeUsername(raw)}@${INTERNAL_EMAIL_DOMAIN}`;
}

export function validateUsername(raw: string): string {
  const username = normalizeUsername(raw);
  if (!/^[a-z0-9_.]{3,32}$/.test(username)) {
    throw new Error("Username must be 3–32 characters: lowercase letters, numbers, dots or underscores.");
  }
  return username;
}
