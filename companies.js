// v8 master list — Phase 1 subset (companies with confirmed Workable / Greenhouse
// public ATS endpoints). Phase 2 will add Workday / SmartRecruiters / Lever /
// Ashby / Recruitis. Phase 3 will fall back to Adzuna / JSearch for the rest
// of the v7 master list (the ~20 self-hosted MENA + APAC brokers).
//
// Region for each job is decided by the JOB location (see fetchers/base.js
// resolveLocation), not by anything declared here. We only set defaultRegion
// as a fallback for fully-remote postings without geo metadata.
//
// tier values:
//   tier1       — global Tier-1 incumbents
//   growth      — growth-aggressive retail (XM / Exness / Pepperstone family)
//   multiasset  — multi-asset / social brokers (Trading 212 / Capital.com / NAGA)
//   mena        — MENA-native CFD
//   apac        — APAC retail
//   eu          — EU mid-size
//   propfirm    — prop trading firms (always file under propfirm region)

export const COMPANIES = [
  // === Workable ===
  // Endpoint pattern: https://apply.workable.com/api/v1/widget/accounts/<slug>?details=true
  // (this returns jobs[] with location, department, full_title, etc. — the
  // documented /api/accounts/<slug> only returns account metadata.)

  {
    name: "Pepperstone",
    tier: "growth",
    ats: { provider: "workable", slug: "pepperstone" },
    defaultRegion: "apac",
    defaultZone: "AU",
  },
  {
    name: "Eightcap",
    tier: "growth",
    ats: { provider: "workable", slug: "eightcap" },
    defaultRegion: "apac",
    defaultZone: "AU",
  },
  {
    name: "FP Markets",
    tier: "growth",
    ats: { provider: "workable", slug: "fpmarkets" },
    defaultRegion: "apac",
    defaultZone: "AU",
  },
  {
    name: "Tickmill",
    tier: "growth",
    ats: { provider: "workable", slug: "tickmill" },
    defaultRegion: "eu",
    defaultZone: "CY",
  },
  {
    name: "NAGA",
    tier: "multiasset",
    ats: { provider: "workable", slug: "naga" },
    defaultRegion: "eu",
    defaultZone: "CY",
  },
  {
    name: "TMGM",
    tier: "apac",
    ats: { provider: "workable", slug: "tmgm" },
    defaultRegion: "apac",
    defaultZone: "AU",
  },
  {
    name: "EBC Financial Group",
    tier: "apac",
    ats: { provider: "workable", slug: "ebcfinancialgroup" },
    defaultRegion: "apac",
    defaultZone: "HK",
  },
  {
    name: "FXTM",
    tier: "apac",
    ats: { provider: "workable", slug: "fxtm" },
    defaultRegion: "eu",
    defaultZone: "CY",
  },
  {
    name: "ActivTrades",
    tier: "eu",
    ats: { provider: "workable", slug: "activtrades" },
    defaultRegion: "eu",
    defaultZone: "UK",
  },
  {
    name: "Trade Nation",
    tier: "eu",
    ats: { provider: "workable", slug: "trade-nation" },
    defaultRegion: "eu",
    defaultZone: "UK",
  },
  {
    name: "Libertex",
    tier: "multiasset",
    ats: { provider: "workable", slug: "libertexgroup" },
    defaultRegion: "eu",
    defaultZone: "CY",
  },
  {
    name: "Libertex Europe",
    tier: "multiasset",
    ats: { provider: "workable", slug: "libertex-europe" },
    defaultRegion: "eu",
    defaultZone: "CY",
  },
  {
    name: "AvaTrade",
    tier: "mena",
    ats: { provider: "workable", slug: "avatrade" },
    defaultRegion: "eu",
    defaultZone: "IE",
  },
  {
    name: "Admirals",
    tier: "growth",
    ats: { provider: "workable", slug: "admirals" },
    defaultRegion: "eu",
    defaultZone: "EE",
  },
  {
    name: "CXM Direct",
    tier: "growth",
    ats: { provider: "workable", slug: "cxmdirect" },
    defaultRegion: "eu",
    defaultZone: "UK",
  },

  // === Greenhouse ===
  // Endpoint:  https://boards-api.greenhouse.io/v1/boards/<slug>/jobs?content=true
  // EU shard:  https://boards-api.eu.greenhouse.io/v1/boards/<slug>/jobs?content=true
  // ATS config supports `shard: "us" | "eu"` (us = default).

  {
    name: "ThinkMarkets",
    tier: "growth",
    ats: { provider: "greenhouse", slug: "thinkmarkets", shard: "us" },
    defaultRegion: "apac",
    defaultZone: "AU",
  },
  {
    name: "XTB",
    tier: "eu",
    ats: { provider: "greenhouse", slug: "xtb", shard: "us" },
    defaultRegion: "eu",
    defaultZone: "PL",
  },
  {
    name: "Axi",
    tier: "growth",
    ats: { provider: "greenhouse", slug: "axicorpfinancialservicesptyltd", shard: "us" },
    defaultRegion: "apac",
    defaultZone: "AU",
  },
  {
    name: "Exness",
    tier: "growth",
    ats: { provider: "greenhouse", slug: "internalhiring", shard: "eu" },
    defaultRegion: "eu",
    defaultZone: "CY",
  },
  {
    name: "MyFunded Futures",
    tier: "propfirm",
    ats: { provider: "greenhouse", slug: "myfundedfutures", shard: "us" },
    defaultRegion: "propfirm",
    defaultZone: "GLOBAL",
  },
  {
    name: "Maven Trading",
    tier: "propfirm",
    ats: { provider: "greenhouse", slug: "maventrading", shard: "us" },
    defaultRegion: "propfirm",
    defaultZone: "GLOBAL",
  },
  // OANDA — Greenhouse slug `oanda` returns 404. The audit flagged this as
  // "needs verification". OANDA's career portal at jobs.lever.co/oanda exists,
  // so we'll wire it up in Phase 2 via the Lever adapter.

  // === Workday (CXS POST, auth-free) ===
  // <tenant>.<host>.myworkdayjobs.com/wday/cxs/<tenant>/<site>/jobs
  // host varies per customer (wd3, wd5, wd103, ...). Verified with HTTP 200.

  {
    name: "IG Group",
    tier: "tier1",
    ats: { provider: "workday", tenant: "ig", site: "EXT_IG", host: "wd103" },
    defaultRegion: "eu",
    defaultZone: "UK",
  },
  {
    name: "CMC Markets",
    tier: "tier1",
    ats: { provider: "workday", tenant: "cmcmarkets", site: "CMC_Markets_Careers", host: "wd3" },
    defaultRegion: "eu",
    defaultZone: "UK",
  },
  {
    name: "Saxo Bank",
    tier: "tier1",
    ats: { provider: "workday", tenant: "saxobank", site: "CareeratSaxoBank", host: "wd3" },
    defaultRegion: "eu",
    defaultZone: "DK",
  },

  // === SmartRecruiters ===
  {
    name: "Swissquote",
    tier: "eu",
    ats: { provider: "smartrecruiters", slug: "Swissquote" },
    defaultRegion: "eu",
    defaultZone: "CH",
  },

  // === Lever (with EU shard for XM) ===
  {
    name: "Capital.com",
    tier: "multiasset",
    ats: { provider: "lever", slug: "capital", shard: "us" },
    defaultRegion: "eu",
    defaultZone: "CY",
  },
  {
    name: "XM",
    tier: "growth",
    ats: { provider: "lever", slug: "xm", shard: "eu" },
    defaultRegion: "eu",
    defaultZone: "CY",
  },

  // === Ashby ===
  {
    name: "Trading 212",
    tier: "multiasset",
    ats: { provider: "ashby", slug: "trading212" },
    defaultRegion: "eu",
    defaultZone: "BG",
  },
];

// Convenience accessor for run.js
export function companiesByProvider(provider) {
  return COMPANIES.filter(c => c.ats?.provider === provider);
}
