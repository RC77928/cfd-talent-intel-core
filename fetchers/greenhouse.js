// Greenhouse adapter.
//
// Public job-board API:
//   https://boards-api.greenhouse.io/v1/boards/<slug>/jobs?content=true        (US shard)
//   https://boards-api.eu.greenhouse.io/v1/boards/<slug>/jobs?content=true     (EU shard)
//
// Set `ats.shard: "eu"` on a company to use the EU host (Exness lives there
// under the unusual slug `internalhiring`).

import { Fetcher, Job, fetchJson } from "./base.js";

const HOST = {
  us: "https://boards-api.greenhouse.io",
  eu: "https://boards-api.eu.greenhouse.io",
};

function jobsUrl(slug, shard = "us") {
  const host = HOST[shard] || HOST.us;
  return `${host}/v1/boards/${encodeURIComponent(slug)}/jobs?content=true`;
}

// Greenhouse encodes job descriptions as HTML-escaped HTML (&lt;p&gt;Hello&lt;/p&gt;).
// For classification purposes we only need plain text — strip tags and decode
// the most common entities.
function htmlToText(html) {
  if (!html) return "";
  // unescape HTML entities (one pass — Greenhouse double-encodes)
  let s = String(html)
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&").replace(/&nbsp;/g, " ");
  // strip tags
  s = s.replace(/<[^>]+>/g, " ");
  // collapse whitespace
  s = s.replace(/\s+/g, " ").trim();
  return s;
}

export class GreenhouseFetcher extends Fetcher {
  async fetchAll() {
    const out = [];
    for (const company of this.companies) {
      const slug = company.ats.slug;
      const shard = company.ats.shard || "us";
      const url = jobsUrl(slug, shard);
      try {
        const data = await fetchJson(url, { timeoutMs: this.timeoutMs, log: this.log });
        const jobs = Array.isArray(data?.jobs) ? data.jobs : [];
        this.log.info?.(`greenhouse[${shard}] ${company.name} (slug=${slug}) → ${jobs.length} jobs`);
        for (const j of jobs) {
          // Greenhouse gives us location.name as "City, Country" free text and
          // an offices[] array. Pass both — resolveLocation lastIndexOf logic
          // picks the rightmost country reference.
          const locName = j.location?.name || j.offices?.[0]?.location || j.offices?.[0]?.name || "";
          out.push(new Job({
            company: company.name,
            title: j.title || "",
            description: htmlToText(j.content),
            location: { name: locName },
            postedAt: j.updated_at || j.first_published || null,
            sourceUrl: j.absolute_url || null,
            jobId: j.id ? String(j.id) : null,
          }));
        }
      } catch (err) {
        this.log.warn?.(`greenhouse[${shard}] ${company.name} (slug=${slug}) failed: ${err.message}`);
      }
    }
    return out;
  }
}
