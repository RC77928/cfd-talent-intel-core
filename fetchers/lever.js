// Lever adapter — public postings endpoint.
//
// Default host:  https://api.lever.co/v0/postings/<slug>?mode=json
// EU shard:      https://api.eu.lever.co/v0/postings/<slug>?mode=json
//
// Set ats.shard = "eu" to use the EU host. XM lives there (95 jobs at the
// time of this writing); Capital.com is on the default host (53 jobs).
//
// Lever returns a flat array of postings, each with:
//   id, text (title), categories { commitment, department, location, team },
//   country, workplaceType, descriptionPlain, hostedUrl, applyUrl, ...
// Rich descriptions (descriptionPlain) make Lever great for our classifier —
// hit rate on Capital.com and XM is near 100%.

import { Fetcher, Job, fetchJson } from "./base.js";

const HOST = {
  us: "https://api.lever.co",
  eu: "https://api.eu.lever.co",
};

export class LeverFetcher extends Fetcher {
  async fetchAll() {
    const out = [];
    for (const company of this.companies) {
      const slug = company.ats.slug;
      const shard = company.ats.shard || "us";
      const host = HOST[shard] || HOST.us;
      const url = `${host}/v0/postings/${encodeURIComponent(slug)}?mode=json`;
      try {
        const data = await fetchJson(url, { timeoutMs: this.timeoutMs, log: this.log });
        const postings = Array.isArray(data) ? data : [];
        this.log.info?.(`lever[${shard}] ${company.name} (slug=${slug}) → ${postings.length} jobs`);
        for (const p of postings) {
          // Lever's "country" field is sometimes 2-letter, sometimes full name,
          // sometimes missing. Pass everything through and let resolveLocation
          // decide.
          const locName = p.categories?.location || p.country || "";
          out.push(new Job({
            company: company.name,
            title: p.text || "",
            description: p.descriptionPlain || "",
            location: {
              country: (p.country || "").toString().slice(0, 2).toUpperCase(),
              name: locName,
            },
            postedAt: p.createdAt ? new Date(p.createdAt).toISOString() : null,
            sourceUrl: p.hostedUrl || p.applyUrl || null,
            jobId: p.id || null,
          }));
        }
      } catch (err) {
        this.log.warn?.(`lever[${shard}] ${company.name} (slug=${slug}) failed: ${err.message}`);
      }
    }
    return out;
  }
}
