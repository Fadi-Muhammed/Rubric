// Runs a .sql file against a Supabase project via the Management API.
// Usage: SBP=sbp_... REF=xxxx node scripts/run-sql.mjs path/to/file.sql
import { readFileSync } from "node:fs";

const token = process.env.SBP;
const ref = process.env.REF;
const file = process.argv[2];
if (!token || !ref || !file) {
  console.error("need SBP, REF env and a sql file arg");
  process.exit(1);
}

const query = readFileSync(file, "utf8");
const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
  method: "POST",
  headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  body: JSON.stringify({ query }),
});
const text = await res.text();
console.log("HTTP", res.status);
console.log(text);
process.exit(res.ok ? 0 : 1);
