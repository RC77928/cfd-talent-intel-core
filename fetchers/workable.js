// Workable adapter.
//
// Public widget endpoint:
//   https://apply.workable.com/api/v1/widget/accounts/<slug>?details=true
// Returns the company's account info plus jobs[] with location (country,
// country_code, city), department, full_title, and a short description.
//
// No auth, no quota, but the response can be large; we hard-cap timeout.

import { Fetcher, Job, fetchJson } from "./base.js";

const WIDGET_URL = (slug) => `https://apply.workable.com/api/v1/widget/accounts/${encodeURIComponent(slug)}?details=true`;

export class WorkableFetcher extends Fetcher {
  async fetchAll() {
    const out = [];
    for (const company of this.companies) {
      const slug = company.ats.slug;
      try {
        const data = await fetchJson(WIDGET_URL(slug), { timeoutMs: this.timeoutMs, log: this.log });
        const jobs = Array.isArray(data?.jobs) ? data.jobs : [];
        this.log.info?.(`workable ${company.name} (slug=${slug}) → ${jobs.length} jobs`);
        for (const j of jobs) {
          out.push(new Job({
            company: company.name,
            title: j.full_title || j.title || "",
            description: j.description || j.requirements || "",
            location: {
              country: j.country_code || "",
              countryCode: j.country_code || "",
              city: j.city || "",
              name: [j.city, j.country].filter(Boolean).join(", "),
            },
            postedAt: j.published || j.created_at || null,
            sourceUrl: j.url || j.application_url || null,
            jobId: j.shortcode || j.id || null,
          }));
        }
      } catch (err) {
        this.log.warn?.(`workable ${company.name} (slug=${slug}) failed: ${err.message}`);
      }
    }
    return out;
  }
}
