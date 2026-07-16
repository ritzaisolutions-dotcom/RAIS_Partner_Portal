type UserMetadata = Record<string, unknown> | undefined;

export function requiresPasswordChange(metadata: UserMetadata): boolean {
  const value = metadata?.must_change_password;
  if (value === true) return true;
  if (value === 1) return true;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "true" || normalized === "1";
  }
  return false;
}
