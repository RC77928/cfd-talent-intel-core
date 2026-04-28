// Ashby adapter — public job-board posting API.
//
// Endpoint:
//   https://api.ashbyhq.com/posting-api/job-board/<slug>?includeCompensation=true
// Returns { jobs: [{ id, title, department, team, employmentType, location,
//                    secondaryLocations, address: { postalAddress: { addressCountry,
//                    addressLocality, addressRegion } }, jobUrl, descriptionHtml,
//                    descriptionPlain, isRemote, workplaceType, ... }] }
//
// Trading 212 lives here under slug `trading212` (38 jobs).

import { Fetcher, Job, fetchJson } from "./base.js";

export class AshbyFetcher extends Fetcher {
  async fetchAll() {
    const out = [];
    for (const company of this.companies) {
      const slug = company.ats.slug;
      const url = `https://api.ashbyhq.com/posting-api/job-board/${encodeURIComponent(slug)}?includeCompensation=true`;
      try {
        const data = await fetchJson(url, { timeoutMs: this.timeoutMs, log: this.log });
        const jobs = Array.isArray(data?.jobs) ? data.jobs : [];
        this.log.info?.(`ashby ${company.name} (slug=${slug}) → ${jobs.length} jobs`);
        for (const j of jobs) {
          const addr = j.address?.postalAddress || {};
          out.push(new Job({
            company: company.name,
            title: j.title || "",
            description: j.descriptionPlain || j.descriptionHtml || "",
            location: {
              country: addr.addressCountry || "",
              city: addr.addressLocality || j.location || "",
              name: [addr.addressLocality, addr.addressRegion, addr.addressCountry].filter(Boolean).join(", ") || j.location || "",
            },
            postedAt: j.publishedAt || null,
            sourceUrl: j.jobUrl || j.applyUrl || null,
            jobId: j.id || null,
          }));
        }
      } catch (err) {
        this.log.warn?.(`ashby ${company.name} (slug=${slug}) failed: ${err.message}`);
      }
    }
    return out;
  }
}
