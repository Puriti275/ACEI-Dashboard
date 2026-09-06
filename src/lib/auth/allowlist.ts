import "server-only";
import bcrypt from "bcryptjs";
import type { AceiRole } from "@/types/next-auth";

/**
 * Access is driven entirely by environment variables — no database.
 *
 *   ACEI_ADMINS        "alice@utk.edu:<b64hash>,bob@utk.edu:<b64hash>"
 *   ACEI_SUPER_ADMINS  "alice@utk.edu,carol@utk.edu"
 *
 * The password hash is base64-encoded so it survives `.env` file parsing
 * (dotenv expands the `$` characters in a raw bcrypt hash). A raw `$2...`
 * hash is still accepted for platforms like Vercel where env vars are not
 * expanded. Generate one with: `node scripts/hash-password.mjs 'password'`.
 *
 * Everyone in ACEI_ADMINS can sign in. Anyone additionally listed in
 * ACEI_SUPER_ADMINS gets person-level access (student PII, small groups,
 * editing profile tables).
 */

type AdminEntry = { email: string; hash: string };

function decodeHash(value: string): string {
  const trimmed = value.trim();
  if (trimmed.startsWith("$2")) return trimmed; // already a raw bcrypt hash
  try {
    const decoded = Buffer.from(trimmed, "base64").toString("utf8");
    return decoded.startsWith("$2") ? decoded : trimmed;
  } catch {
    return trimmed;
  }
}

function parseAdmins(): AdminEntry[] {
  const raw = process.env.ACEI_ADMINS ?? "";
  return raw
    .split(",")
    .map((pair) => pair.trim())
    .filter(Boolean)
    .map((pair) => {
      const sep = pair.indexOf(":");
      if (sep === -1) return null;
      return {
        email: pair.slice(0, sep).trim().toLowerCase(),
        hash: decodeHash(pair.slice(sep + 1)),
      };
    })
    .filter(
      (entry): entry is AdminEntry =>
        entry !== null && entry.email.length > 0 && entry.hash.startsWith("$2"),
    );
}

function superAdminSet(): Set<string> {
  return new Set(
    (process.env.ACEI_SUPER_ADMINS ?? "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function roleForEmail(email: string): AceiRole {
  return superAdminSet().has(email.trim().toLowerCase()) ? "super_admin" : "admin";
}

export async function verifyCredentials(
  email: string,
  password: string,
): Promise<{ email: string; role: AceiRole } | null> {
  const normalized = email.trim().toLowerCase();
  const entry = parseAdmins().find((candidate) => candidate.email === normalized);
  if (!entry) return null;

  const ok = await bcrypt.compare(password, entry.hash).catch(() => false);
  if (!ok) return null;

  return { email: normalized, role: roleForEmail(normalized) };
}
