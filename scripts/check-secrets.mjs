#!/usr/bin/env node
// Blocks commits that contain likely PHI (SSNs, MRN-shaped identifiers) in staged files.
import { execSync } from "node:child_process";

const SSN = /\b\d{3}-\d{2}-\d{4}\b/;
const MRN = /\bMRN[:\s#]*\d{6,10}\b/i;

const staged = execSync("git diff --cached --name-only --diff-filter=ACM", {
  encoding: "utf8",
})
  .split("\n")
  .filter(Boolean)
  .filter((f) => !/\.(png|jpg|jpeg|gif|ico|woff2?|ttf)$/i.test(f));

let blocked = false;

for (const file of staged) {
  let content;
  try {
    content = execSync(`git show :"${file}"`, { encoding: "utf8" });
  } catch {
    continue;
  }
  if (SSN.test(content) || MRN.test(content)) {
    console.error(`Possible PHI pattern (SSN/MRN) found in staged file: ${file}`);
    blocked = true;
  }
}

if (blocked) {
  console.error("\nCommit blocked. Remove PHI-shaped values before committing.");
  process.exit(1);
}
