/**
 * IMDAD.BUILDS — Master Production Readiness Test Suite
 *
 * Runs all validation suites and compiles consolidated production metrics.
 */

import { execSync } from "child_process";

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
  yellow: "\x1b[33m",
  bold: "\x1b[1m",
};

interface SuiteResult {
  name: string;
  script: string;
  passed: boolean;
  durationMs: number;
  output: string;
}

const suites = [
  { name: "Storage Security Rules & Asset Sanitizer", script: "scripts/verify-storage-rules.ts" },
  { name: "Publishing System & CMS Model", script: "scripts/verify-publishing-system.ts" },
  { name: "Portfolio Publishing E2E Lifecycle", script: "scripts/verify-live-portfolio-lifecycle.ts" },
  { name: "App Distribution & Binary Verification", script: "scripts/verify-app-distribution.ts" },
  { name: "Live APK Flow & Release Hardening", script: "scripts/verify-live-apk-flow.ts" },
  { name: "API Security & Administrative Auth", script: "scripts/verify-security-endpoints.ts" },
];

console.log(`${colors.bold}${colors.cyan}======================================================================`);
console.log(`  IMDAD.BUILDS — MASTER PRODUCTION READINESS AUDIT RUNNER             `);
console.log(`======================================================================${colors.reset}\n`);

const results: SuiteResult[] = [];
let overallPass = true;

for (const suite of suites) {
  const start = Date.now();
  process.stdout.write(`Running: ${colors.bold}${suite.name}${colors.reset} ... `);
  try {
    const output = execSync(`npx --yes tsx ${suite.script}`, {
      stdio: ["pipe", "pipe", "pipe"],
      encoding: "utf8",
    });
    const durationMs = Date.now() - start;
    results.push({ name: suite.name, script: suite.script, passed: true, durationMs, output });
    console.log(`${colors.green}PASSED${colors.reset} (${durationMs}ms)`);
  } catch (err: unknown) {
    overallPass = false;
    const durationMs = Date.now() - start;
    const errorOutput = err && typeof err === "object" && "stdout" in err ? String(err.stdout) : String(err);
    results.push({ name: suite.name, script: suite.script, passed: false, durationMs, output: errorOutput });
    console.log(`${colors.red}FAILED${colors.reset} (${durationMs}ms)`);
  }
}

console.log(`\n${colors.bold}${colors.cyan}======================================================================`);
console.log(`  CONSOLIDATED TEST SUITE SUMMARY                                     `);
console.log(`======================================================================${colors.reset}\n`);

for (const r of results) {
  const statusBadge = r.passed ? `${colors.green}✔ PASSED${colors.reset}` : `${colors.red}✖ FAILED${colors.reset}`;
  console.log(`  ${statusBadge.padEnd(20)} ${r.name.padEnd(45)} (${r.durationMs}ms)`);
}

console.log(`\n${colors.bold}${colors.cyan}======================================================================${colors.reset}`);
if (overallPass) {
  console.log(`  ${colors.green}${colors.bold}ALL TEST SUITES PASSED CLEANLY (100% PRODUCTION READY)${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}======================================================================${colors.reset}\n`);
  process.exit(0);
} else {
  console.log(`  ${colors.red}${colors.bold}SOME TEST SUITES FAILED — SEE LOGS ABOVE${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}======================================================================${colors.reset}\n`);
  process.exit(1);
}
