// Workday adapter — CXS POST API (auth-free).
//
// URL pattern:
//   https://<tenant>.<host>.myworkdayjobs.com/wday/cxs/<tenant>/<site>/jobs
// where <host> is wd1 / wd3 / wd5 / wd103 / etc — varies per customer.
//
// POST body schema:
//   { appliedFacets: {}, limit: N, offset: N, searchText: "" }
//
// Response shape:
//   { total: N, jobPostings: [{ title, externalPath, locationsText, postedOn, bulletFields }] }
//
// Workday's listing endpoint does NOT return descriptions — only title +
// locationsText (a free-text city/HQ string). For now we classify on title
// alone; if hit-rate is too low, a Phase 3 enhancement can fetch each job's
// detail page in a second pass.

import { Fetcher, Job, fetchJson } from "./base.js";

const PAGE_SIZE = 20;
const MAX_PAGES = 25; // hard cap so a runaway tenant can't spin forever

function jobsUrl(c) {
  const host = c.ats.host || "wd3";
  return `https://${c.ats.tenant}.${host}.myworkdayjobs.com/wday/cxs/${c.ats.tenant}/${c.ats.site}/jobs`;
}

export class WorkdayFetcher extends Fetcher {
  async fetchAll() {
    const out = [];
    for (const company of this.companies) {
      const url = jobsUrl(company);
      let total = 0;
      let collected = 0;
      try {
        for (let page = 0; page < MAX_PAGES; page++) {
          const offset = page * PAGE_SIZE;
          const data = await fetchJson(url, {
            method: "POST",
            timeoutMs: this.timeoutMs,
            log: this.log,
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({ appliedFacets: {}, limit: PAGE_SIZE, offset, searchText: "" }),
          });
          if (page === 0) total = data?.total ?? 0;
          const postings = Array.isArray(data?.jobPostings) ? data.jobPostings : [];
          for (const p of postings) {
            out.push(new Job({
              company: company.name,
              title: p.title || "",
              description: "", // CXS list endpoint omits descriptions
              location: { name: p.locationsText || "" },
              postedAt: p.postedOn || null,
              sourceUrl: p.externalPath
                ? `https://${company.ats.tenant}.${company.ats.host || "wd3"}.myworkdayjobs.com${p.externalPath}`
                : null,
              jobId: (p.bulletFields && p.bulletFields[0]) || null,
            }));
            collected++;
          }
          if (postings.length < PAGE_SIZE) break;
          if (collected >= total) break;
        }
        this.log.info?.(`workday ${company.name} (${company.ats.tenant}/${company.ats.site}) → ${collected}/${total} jobs`);
      } catch (err) {
        this.log.warn?.(`workday ${company.name} failed: ${err.message}`);
      }
    }
    return out;
  }
}
