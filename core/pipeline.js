// Pipeline: Job[] → resolveLocation → classify → group by region → aggregate
// → write data/<region>.json. Output schema is intentionally identical to
// the existing eu_data.json / latam_data.json / mena_data.json shape so the
// three dashboards keep rendering after we just change their fetch URL.

import { resolveLocation, regionForJob } from "../fetchers/base.js";
import { classifyJob } from "./classifier.js";

const HOT_COUNT_THRESHOLD = 5;

const REGION_LABELS = {
  eu:       "EU+UK",
  latam:    "LATAM",
  mena:     "MENA",
  apac:     "APAC",
  propfirm: "Prop Firms",
};

function nowTaipeiIso() {
  // Asia/Taipei is UTC+8 with no DST.
  const now = new Date();
  const offsetMs = 8 * 60 * 60 * 1000;
  const taipei = new Date(now.getTime() + offsetMs);
  // strip ms, append +08:00
  const iso = taipei.toISOString().replace(/\.\d{3}Z$/, "+08:00");
  return iso;
}

function companyByName(companies, name) {
  return companies.find(c => c.name === name);
}

/**
 * @param {Job[]} jobs
 * @param {Company[]} companies
 * @returns {Map<string, AggregateRow[]>}  region -> rows
 */
export function aggregate(jobs, companies) {
  // bucket = `${company}|${zone}|${function}` within a region
  const byRegion = new Map(); // region -> Map<bucketKey, row>

  let dropped = 0;
  for (const job of jobs) {
    const company = companyByName(companies, job.company);
    if (!company) { dropped++; continue; }

    const resolved = resolveLocation(job.location);
    const { region, zone } = regionForJob(company, resolved);
    if (!region) { dropped++; continue; }

    const fn = classifyJob(job);
    if (!fn) { dropped++; continue; }

    const country = resolved.country || "";
    const key = `${company.name}|${zone}|${fn}`;
    if (!byRegion.has(region)) byRegion.set(region, new Map());
    const bucket = byRegion.get(region);
    if (!bucket.has(key)) {
      bucket.set(key, {
        company: company.name,
        zone,
        function: fn,
        count: 0,
        hot: false,
        salary_min: null,
        salary_max: null,
        salary_currency: "USD",
        country,
        source: `ats:${company.ats?.provider || "unknown"}`,
        updated_at: nowTaipeiIso(),
      });
    }
    const row = bucket.get(key);
    row.count += 1;
    // first non-empty country wins; if same bucket has mixed, that's fine
    if (!row.country && country) row.country = country;
  }

  // mark hot, sort
  const out = new Map();
  for (const [region, bucket] of byRegion) {
    const rows = [...bucket.values()].map(r => ({ ...r, hot: r.count >= HOT_COUNT_THRESHOLD }));
    rows.sort((a, b) => a.zone.localeCompare(b.zone) || a.company.localeCompare(b.company) || (b.count - a.count));
    out.set(region, rows);
  }
  return { byRegion: out, dropped };
}

export function buildPayload(region, rows) {
  return {
    generated_at: nowTaipeiIso(),
    region,
    region_label: REGION_LABELS[region] || region,
    source: "ats-multi",
    record_count: rows.length,
    records: rows,
  };
}
