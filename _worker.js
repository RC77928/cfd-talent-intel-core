// Cloudflare Worker — serves data/*.json (the ASSETS binding root is ./data)
// with permissive CORS so the EU+UK / LATAM / MENA / APAC / Prop-firm
// dashboards can fetch the feed cross-origin.
//
// Path convention exposed to dashboards:
//     https://<host>/data/eu.json
//     https://<host>/data/latam.json
//     https://<host>/data/mena.json
//     https://<host>/data/apac.json
//     https://<host>/data/propfirm.json
//
// `wrangler.jsonc` has `assets.run_worker_first: true`, so this Worker runs
// for every request — that's how we attach CORS headers to asset responses.

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
};

const REGIONS = new Set(["eu", "latam", "mena", "apac", "propfirm"]);

function withCors(response) {
  const headers = new Headers(response.headers);
  for (const [k, v] of Object.entries(CORS_HEADERS)) headers.set(k, v);
  return new Response(response.body, { status: response.status, headers });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...CORS_HEADERS },
  });
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    const url = new URL(request.url);

    if (url.pathname === "/" || url.pathname === "/index.html") {
      return new Response(
        "CFD Talent Intel Core — JSON feeds at /data/{eu,latam,mena,apac,propfirm}.json",
        { status: 200, headers: { "Content-Type": "text/plain; charset=utf-8", ...CORS_HEADERS } }
      );
    }

    if (url.pathname === "/health") {
      return json({ ok: true, ts: new Date().toISOString() });
    }

    // /data/<region>.json → strip the /data/ prefix because ASSETS root is ./data
    const dataMatch = url.pathname.match(/^\/data\/([a-z]+)\.json$/);
    if (dataMatch && REGIONS.has(dataMatch[1])) {
      const assetUrl = new URL(`/${dataMatch[1]}.json`, url.origin);
      const assetResponse = await env.ASSETS.fetch(new Request(assetUrl, request));
      return withCors(assetResponse);
    }

    // Backwards-compat: also accept /<region>.json directly.
    const directMatch = url.pathname.match(/^\/([a-z]+)\.json$/);
    if (directMatch && REGIONS.has(directMatch[1])) {
      const assetResponse = await env.ASSETS.fetch(request);
      return withCors(assetResponse);
    }

    return new Response("Not found", { status: 404, headers: CORS_HEADERS });
  },
};
