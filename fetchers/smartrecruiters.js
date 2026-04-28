// SmartRecruiters adapter (Swissquote).
//
// Public endpoint:
//   https://api.smartrecruiters.com/v1/companies/<slug>/postings
// Returns paginated postings with offset/limit/totalFound + content[].
//
// Each posting has: id, name, location { city, country, fullLocation },
// industry, releasedDate, jobAd { sections.jobDescription / qualifications }.
// We only fetch the listing endpoint; descriptions arrive only on a per-job
// detail call which we skip for now (title-only classification works for
// most postings here).

import { Fetcher, Job, fetchJson } from "./base.js";

const PAGE_SIZE = 100;
const MAX_PAGES = 20;

export class SmartRecruitersFetcher extends Fetcher {
  async fetchAll() {
    const out = [];
    for (const company of this.companies) {
      const slug = company.ats.slug;
      let total = 0;
      let collected = 0;
      try {
        for (let page = 0; page < MAX_PAGES; page++) {
          const offset = page * PAGE_SIZE;
          const url = `https://api.smartrecruiters.com/v1/companies/${encodeURIComponent(slug)}/postings?limit=${PAGE_SIZE}&offset=${offset}`;
          const data = await fetchJson(url, { timeoutMs: this.timeoutMs, log: this.log });
          if (page === 0) total = data?.totalFound ?? 0;
          const postings = Array.isArray(data?.content) ? data.content : [];
          for (const p of postings) {
            out.push(new Job({
              company: company.name,
              title: p.name || "",
              description: "", // listing endpoint omits description
              location: {
                country: (p.location?.country || "").toUpperCase(),
                city: p.location?.city || "",
                name: p.location?.fullLocation || "",
              },
              postedAt: p.releasedDate || null,
              sourceUrl: p.ref || null,
              jobId: p.id || p.refNumber || null,
            }));
            collected++;
          }
          if (postings.length < PAGE_SIZE) break;
          if (collected >= total) break;
        }
        this.log.info?.(`smartrecruiters ${company.name} (slug=${slug}) → ${collected}/${total} jobs`);
      } catch (err) {
        this.log.warn?.(`smartrecruiters ${company.name} failed: ${err.message}`);
      }
    }
    return out;
  }
}
