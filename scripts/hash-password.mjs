#!/usr/bin/env node
// Usage: node scripts/hash-password.mjs 'the-password'
//
// Prints "<base64 bcrypt hash>" to paste into ACEI_ADMINS as
//   email:<output>
// The hash is base64-encoded so it survives .env file parsing (dotenv would
// otherwise expand the "$" characters in a raw bcrypt hash).
import bcrypt from "bcryptjs";

const password = process.argv[2];
if (!password) {
  console.error("Usage: node scripts/hash-password.mjs 'the-password'");
  process.exit(1);
}

const hash = await bcrypt.hash(password, 10);
console.log(Buffer.from(hash).toString("base64"));
