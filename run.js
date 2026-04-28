// CLI entry point. Run all configured ATS fetchers, aggregate, and write
// data/{region}.json. Use `--verbose` for per-company fetch logs.
//
// Usage:
//   node run.js                 # quiet, writes 5 region JSONs
//   node run.js --verbose       # logs every company fetch
//   node run.js --dry-run       # no file writes, prints summary only

import { writeFile, mkdir } from "node:fs/promises";
import { resolve, dirname } from "node:path";

import { COMPANIES, companiesByProvider } from "./companies.js";
import { WorkableFetcher } from "./fetchers/workable.js";
import { GreenhouseFetcher } from "./fetchers/greenhouse.js";
import { WorkdayFetcher } from "./fetchers/workday.js";
import { SmartRecruitersFetcher } from "./fetchers/smartrecruiters.js";
import { LeverFetcher } from "./fetchers/lever.js";
import { AshbyFetcher } from "./fetchers/ashby.js";
import { aggregate, buildPayload } from "./core/pipeline.js";

const args = new Set(process.argv.slice(2));
const VERBOSE = args.has("--verbose") || args.has("-v");
const DRY_RUN = args.has("--dry-run");

const log = {
  info: (...a) => VERBOSE && console.log("[info]", ...a),
  warn: (...a) => console.warn("[warn]", ...a),
  error: (...a) => console.error("[error]", ...a),
};

const FETCHERS = [
  { name: "workable",        provider: "workable",        ctor: WorkableFetcher },
  { name: "greenhouse",      provider: "greenhouse",      ctor: GreenhouseFetcher },
  { name: "workday",         provider: "workday",         ctor: WorkdayFetcher },
  { name: "smartrecruiters", provider: "smartrecruiters", ctor: SmartRecruitersFetcher },
  { name: "lever",           provider: "lever",           ctor: LeverFetcher },
  { name: "ashby",           provider: "ashby",           ctor: AshbyFetcher },
];

async function main() {
  const startedAt = Date.now();
  const allJobs = [];

  for (const f of FETCHERS) {
    const companies = companiesByProvider(f.provider);
    if (companies.length === 0) {
      log.info(`skipping ${f.name} — no companies configured`);
      continue;
    }
    console.log(`\n=== ${f.name} (${companies.length} companies) ===`);
    const fetcher = new f.ctor({ companies, log });
    try {
      const jobs = await fetcher.fetchAll();
      console.log(`${f.name} returned ${jobs.length} raw jobs`);
      allJobs.push(...jobs);
    } catch (err) {
      log.error(`${f.name} fetcher failed:`, err);
    }
  }

  console.log(`\n=== aggregation ===`);
  console.log(`raw jobs: ${allJobs.length}`);
  const { byRegion, dropped } = aggregate(allJobs, COMPANIES);
  console.log(`dropped (no region / no function / unknown company): ${dropped}`);

  // Always emit all five region files, even if empty — the dashboard's
  // empty-state should not crash on a 404.
  const REGIONS = ["eu", "latam", "mena", "apac", "propfirm"];
  for (const region of REGIONS) {
    const rows = byRegion.get(region) || [];
    const payload = buildPayload(region, rows);
    const totalJobs = rows.reduce((s, r) => s + r.count, 0);
    console.log(`  ${region.padEnd(8)} → ${rows.length} records, ${totalJobs} jobs`);

    if (!DRY_RUN) {
      const outPath = resolve(`./data/${region}.json`);
      await mkdir(dirname(outPath), { recursive: true });
      await writeFile(outPath, JSON.stringify(payload, null, 2) + "\n", "utf8");
    }
  }

  const ms = Date.now() - startedAt;
  console.log(`\ndone in ${(ms / 1000).toFixed(1)}s${DRY_RUN ? " (dry-run, no files written)" : ""}`);
}

main().catch(err => {
  console.error("fatal:", err);
  process.exit(1);
});
