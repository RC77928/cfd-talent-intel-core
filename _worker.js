// Cloudflare Worker — serves data/*.json with permissive CORS so the three
// region dashboards (eu-latam / mena / apac / propfirm) can fetch from any
// origin. Anything outside /data/ returns a tiny landing page.

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
};

function withCors(response) {
  const headers = new Headers(response.headers);
  for (const [k, v] of Object.entries(CORS_HEADERS)) headers.set(k, v);
  return new Response(response.body, { status: response.status, headers });
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

    if (url.pathname.startsWith("/data/")) {
      const assetResponse = await env.ASSETS.fetch(request);
      return withCors(assetResponse);
    }

    return new Response("Not found", { status: 404, headers: CORS_HEADERS });
  },
};
