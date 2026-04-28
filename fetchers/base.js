// Base classes + region/location utilities shared by every ATS fetcher.
//
// The whole point of normalizing here (rather than per-fetcher) is so the
// "Cyprus broker hiring in BR" case (Capital.com / XM / Vantage) flows into
// the LATAM dashboard automatically — region is decided by the JOB location,
// not the company HQ.

// ISO-3166 country code → region. Add to these as we encounter new countries
// in real ATS responses.
export const COUNTRY_TO_REGION = {
  // EU + UK
  GB: { region: "eu", zone: "UK" },
  IE: { region: "eu", zone: "IE" },
  DE: { region: "eu", zone: "DE" },
  FR: { region: "eu", zone: "FR" },
  NL: { region: "eu", zone: "NL" },
  BE: { region: "eu", zone: "BE" },
  ES: { region: "eu", zone: "ES" },
  IT: { region: "eu", zone: "IT" },
  PL: { region: "eu", zone: "PL" },
  CZ: { region: "eu", zone: "CZ" },
  HU: { region: "eu", zone: "HU" },
  RO: { region: "eu", zone: "RO" },
  BG: { region: "eu", zone: "BG" },
  GR: { region: "eu", zone: "GR" },
  SE: { region: "eu", zone: "SE" },
  NO: { region: "eu", zone: "NO" },
  DK: { region: "eu", zone: "DK" },
  FI: { region: "eu", zone: "FI" },
  AT: { region: "eu", zone: "AT" },
  CH: { region: "eu", zone: "CH" },
  LU: { region: "eu", zone: "LU" },
  MT: { region: "eu", zone: "MT" },
  EE: { region: "eu", zone: "EE" },
  LV: { region: "eu", zone: "LV" },
  LT: { region: "eu", zone: "LT" },
  HR: { region: "eu", zone: "HR" },
  SI: { region: "eu", zone: "SI" },
  PT: { region: "eu", zone: "PT" },
  CY: { region: "eu", zone: "CY" },

  // MENA
  AE: { region: "mena", zone: "UAE" },
  SA: { region: "mena", zone: "KSA" },
  BH: { region: "mena", zone: "BHR" },
  OM: { region: "mena", zone: "OMN" },
  KW: { region: "mena", zone: "KWT" },
  QA: { region: "mena", zone: "QAT" },
  EG: { region: "mena", zone: "EGY" },
  JO: { region: "mena", zone: "JOR" },
  LB: { region: "mena", zone: "LBN" },
  MA: { region: "mena", zone: "MAR" },
  TN: { region: "mena", zone: "TUN" },
  DZ: { region: "mena", zone: "DZA" },
  TR: { region: "mena", zone: "TUR" },

  // APAC (incl. China + HK)
  SG: { region: "apac", zone: "SG" },
  HK: { region: "apac", zone: "HK" },
  JP: { region: "apac", zone: "JP" },
  KR: { region: "apac", zone: "KR" },
  TW: { region: "apac", zone: "TW" },
  CN: { region: "apac", zone: "CN" },
  MO: { region: "apac", zone: "MO" },
  MY: { region: "apac", zone: "MY" },
  TH: { region: "apac", zone: "TH" },
  VN: { region: "apac", zone: "VN" },
  PH: { region: "apac", zone: "PH" },
  ID: { region: "apac", zone: "ID" },
  IN: { region: "apac", zone: "IN" },
  AU: { region: "apac", zone: "AU" },
  NZ: { region: "apac", zone: "NZ" },
  BD: { region: "apac", zone: "BD" },
  PK: { region: "apac", zone: "PK" },
  LK: { region: "apac", zone: "LK" },

  // LATAM
  BR: { region: "latam", zone: "BR" },
  MX: { region: "latam", zone: "MX" },
  AR: { region: "latam", zone: "AR" },
  CL: { region: "latam", zone: "CL" },
  CO: { region: "latam", zone: "CO" },
  PE: { region: "latam", zone: "PE" },
  VE: { region: "latam", zone: "VE" },
  UY: { region: "latam", zone: "UY" },
  PY: { region: "latam", zone: "PY" },
  EC: { region: "latam", zone: "EC" },
  CR: { region: "latam", zone: "CR" },
  PA: { region: "latam", zone: "PA" },
  DO: { region: "latam", zone: "DO" },
  JM: { region: "latam", zone: "JM" },

  // North America (out of scope, mapped so we don't treat US as latam)
  US: { region: "noram", zone: "US" },
  CA: { region: "noram", zone: "CA" },
};

// Country names → ISO-3166 alpha-2 (Greenhouse/Workday return free-text
// "City, Country" location strings; we have to backfill the code).
export const COUNTRY_NAME_TO_CODE = {
  "united kingdom": "GB", uk: "GB", england: "GB", scotland: "GB", wales: "GB",
  "northern ireland": "GB", britain: "GB",
  ireland: "IE",
  germany: "DE", deutschland: "DE",
  france: "FR",
  netherlands: "NL", holland: "NL",
  belgium: "BE",
  spain: "ES", españa: "ES",
  italy: "IT", italia: "IT",
  poland: "PL", polska: "PL",
  "czech republic": "CZ", czechia: "CZ",
  hungary: "HU",
  romania: "RO",
  bulgaria: "BG",
  greece: "GR",
  sweden: "SE",
  norway: "NO",
  denmark: "DK",
  finland: "FI",
  austria: "AT",
  switzerland: "CH",
  luxembourg: "LU",
  malta: "MT",
  estonia: "EE",
  latvia: "LV",
  lithuania: "LT",
  croatia: "HR",
  slovenia: "SI",
  portugal: "PT",
  cyprus: "CY",

  "united arab emirates": "AE", uae: "AE", "u.a.e.": "AE", emirates: "AE",
  "saudi arabia": "SA", ksa: "SA",
  bahrain: "BH",
  oman: "OM",
  kuwait: "KW",
  qatar: "QA",
  egypt: "EG",
  jordan: "JO",
  lebanon: "LB",
  morocco: "MA",
  tunisia: "TN",
  algeria: "DZ",
  turkey: "TR", türkiye: "TR",

  singapore: "SG",
  "hong kong": "HK", hongkong: "HK", hk: "HK",
  japan: "JP",
  "south korea": "KR", korea: "KR",
  taiwan: "TW",
  china: "CN", "people's republic of china": "CN", prc: "CN", "mainland china": "CN",
  macau: "MO", macao: "MO",
  malaysia: "MY",
  thailand: "TH",
  vietnam: "VN", "viet nam": "VN",
  philippines: "PH",
  indonesia: "ID",
  india: "IN",
  australia: "AU",
  "new zealand": "NZ",
  bangladesh: "BD",
  pakistan: "PK",
  "sri lanka": "LK",

  brazil: "BR", brasil: "BR",
  mexico: "MX", méxico: "MX",
  argentina: "AR",
  chile: "CL",
  colombia: "CO",
  peru: "PE", perú: "PE",
  venezuela: "VE",
  uruguay: "UY",
  paraguay: "PY",
  ecuador: "EC",
  "costa rica": "CR",
  panama: "PA",
  "dominican republic": "DO",
  jamaica: "JM",

  "united states": "US", usa: "US", "u.s.a.": "US", america: "US",
  canada: "CA",
};

// City → country backfill for common CFD financial hubs. Only used when an
// ATS gives us city without country (Workable's "city" field can be alone).
export const CITY_TO_COUNTRY = {
  london: "GB", manchester: "GB", edinburgh: "GB", belfast: "GB",
  dublin: "IE",
  berlin: "DE", frankfurt: "DE", munich: "DE", hamburg: "DE",
  paris: "FR",
  amsterdam: "NL",
  brussels: "BE",
  madrid: "ES", barcelona: "ES",
  milan: "IT", rome: "IT",
  warsaw: "PL", kraków: "PL", krakow: "PL", wroclaw: "PL", "wrocław": "PL",
  prague: "CZ",
  zurich: "CH", geneva: "CH", gland: "CH",
  copenhagen: "DK",
  stockholm: "SE",
  vienna: "AT",
  athens: "GR",
  limassol: "CY", nicosia: "CY", paphos: "CY",
  malta: "MT", valletta: "MT", "st. julian's": "MT", sliema: "MT",
  lisbon: "PT", porto: "PT",

  dubai: "AE", "abu dhabi": "AE", sharjah: "AE", difc: "AE", adgm: "AE",
  riyadh: "SA", jeddah: "SA",
  doha: "QA",
  manama: "BH",
  cairo: "EG",
  istanbul: "TR", ankara: "TR",
  amman: "JO",
  beirut: "LB",

  singapore: "SG",
  "hong kong": "HK", kowloon: "HK", "central hong kong": "HK",
  tokyo: "JP", osaka: "JP",
  seoul: "KR",
  taipei: "TW",
  shanghai: "CN", beijing: "CN", shenzhen: "CN", guangzhou: "CN",
  "kuala lumpur": "MY",
  bangkok: "TH",
  manila: "PH", "bonifacio global city": "PH", bgc: "PH",
  jakarta: "ID",
  mumbai: "IN", bangalore: "IN", bengaluru: "IN", "new delhi": "IN", delhi: "IN",
  sydney: "AU", melbourne: "AU", brisbane: "AU", perth: "AU",
  auckland: "NZ", wellington: "NZ",

  "são paulo": "BR", "sao paulo": "BR", "rio de janeiro": "BR",
  "mexico city": "MX", "ciudad de méxico": "MX", "ciudad de mexico": "MX",
  "buenos aires": "AR",
  santiago: "CL",
  bogota: "CO", "bogotá": "CO",
  lima: "PE",
  caracas: "VE",
  montevideo: "UY",
  asuncion: "PY", "asunción": "PY",
  quito: "EC",
  "san jose": "CR", "san josé": "CR",
  "panama city": "PA",
  "santo domingo": "DO",
  kingston: "JM",
};

/**
 * Resolve a free-form location into { region, zone, country }.
 * country: ISO-3166 alpha-2 if we could pin it down, else null.
 * region: one of eu / mena / apac / latam / noram / null (unknown).
 * zone:   sub-region label for the dashboard (UK / SG / BR / etc.).
 *
 * Inputs may be:
 *   { country: "CY", city: "Limassol" }                  // Workable
 *   { name: "Limassol, Cyprus" }                         // Greenhouse
 *   { countryCode: "GB" }                                // some ATS
 *   { description: "Remote — EU only" }                  // free text fallback
 */
export function resolveLocation(loc) {
  if (!loc) return { region: null, zone: null, country: null };

  // 1. explicit country code (most reliable)
  const code = (loc.country || loc.countryCode || loc.country_code || "").toString().trim().toUpperCase();
  if (code && COUNTRY_TO_REGION[code]) {
    return { ...COUNTRY_TO_REGION[code], country: code };
  }

  // 2. city alone → country backfill
  const city = (loc.city || "").toString().trim().toLowerCase();
  if (city && CITY_TO_COUNTRY[city]) {
    const c = CITY_TO_COUNTRY[city];
    return { ...COUNTRY_TO_REGION[c], country: c };
  }

  // 3. free-text "City, Country" parse
  const text = (loc.name || loc.description || loc.location || "").toString().toLowerCase();
  if (text) {
    // try every country name we know — last match wins (rightmost is usually
    // the country in "City, Region, Country" formats).
    let best = null;
    for (const [name, c] of Object.entries(COUNTRY_NAME_TO_CODE)) {
      const idx = text.lastIndexOf(name);
      if (idx >= 0 && (!best || idx > best.idx)) best = { idx, country: c };
    }
    if (best && COUNTRY_TO_REGION[best.country]) {
      return { ...COUNTRY_TO_REGION[best.country], country: best.country };
    }
    // city-only fallback in free text
    for (const [cityName, c] of Object.entries(CITY_TO_COUNTRY)) {
      if (text.includes(cityName)) {
        return { ...COUNTRY_TO_REGION[c], country: c };
      }
    }
  }

  return { region: null, zone: null, country: null };
}

/**
 * Apply company-level region overrides.
 * - tier === "propfirm": always file under propfirm region regardless of geo.
 * - resolved.region present: use it.
 * - else fall back to company.defaultRegion (if any) or null.
 */
export function regionForJob(company, resolved) {
  if (company.tier === "propfirm") {
    return { region: "propfirm", zone: resolved.country || company.defaultZone || "GLOBAL" };
  }
  if (resolved.region) return { region: resolved.region, zone: resolved.zone };
  if (company.defaultRegion) return { region: company.defaultRegion, zone: company.defaultZone || "" };
  return { region: null, zone: null };
}

// Job — what each ATS adapter normalizes into.
export class Job {
  constructor({ company, title, description = "", location = null, salaryMin = null, salaryMax = null, salaryCurrency = null, postedAt = null, sourceUrl = null, jobId = null }) {
    this.company = company;
    this.title = title;
    this.description = description;
    this.location = location;
    this.salaryMin = salaryMin;
    this.salaryMax = salaryMax;
    this.salaryCurrency = salaryCurrency;
    this.postedAt = postedAt;
    this.sourceUrl = sourceUrl;
    this.jobId = jobId;
  }
}

// Abstract base. Subclasses implement fetchAll() returning Job[].
export class Fetcher {
  constructor({ companies = [], log = console, timeoutMs = 25000 }) {
    this.companies = companies;
    this.log = log;
    this.timeoutMs = timeoutMs;
  }
  get name() { return this.constructor.name; }
  async fetchAll() { throw new Error(`${this.name}.fetchAll() not implemented`); }
}

// Tiny fetch wrapper: timeout, JSON parse, retry on 429 / 5xx.
export async function fetchJson(url, { method = "GET", headers = {}, body = null, timeoutMs = 25000, maxAttempts = 3, log = console } = {}) {
  const baseHeaders = {
    "User-Agent": "cfd-talent-intel-core/0.1 (+https://github.com/RC77928)",
    Accept: "application/json",
    ...headers,
  };
  let lastErr;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const resp = await fetch(url, { method, headers: baseHeaders, body, signal: controller.signal });
      clearTimeout(timer);
      if (resp.ok) {
        const text = await resp.text();
        if (!text) return null;
        try { return JSON.parse(text); }
        catch { return text; } // some endpoints return HTML even on 200
      }
      if (resp.status === 429 || (resp.status >= 500 && resp.status < 600)) {
        const wait = Math.min(2 ** attempt * 500, 8000);
        log.warn?.(`fetch ${url} → ${resp.status}, retrying in ${wait}ms (attempt ${attempt}/${maxAttempts})`);
        await new Promise(r => setTimeout(r, wait));
        lastErr = new Error(`HTTP ${resp.status}`);
        continue;
      }
      // 4xx other than 429 — caller likely passed a wrong slug; bail loudly.
      throw new Error(`HTTP ${resp.status} ${resp.statusText} for ${url}`);
    } catch (err) {
      clearTimeout(timer);
      if (err.name === "AbortError") {
        lastErr = new Error(`timeout after ${timeoutMs}ms for ${url}`);
      } else {
        lastErr = err;
      }
      if (attempt < maxAttempts) {
        const wait = Math.min(2 ** attempt * 500, 8000);
        log.warn?.(`fetch ${url} failed (${lastErr.message}), retrying in ${wait}ms`);
        await new Promise(r => setTimeout(r, wait));
        continue;
      }
    }
  }
  throw lastErr ?? new Error(`fetchJson failed for ${url}`);
}
