const ORIGIN_HOSTNAME = "sunny-harbor-4482.de.uday.me";

addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event, event.request));
});

async function handleRequest(event, request) {
  const url = new URL(request.url);

  if (url.pathname === "/") {
    // Health-check endpoint for uptime monitors: answer immediately so the
    // monitor gets a fast, reliable 200 regardless of origin latency.
    // Keep the origin warm as a fire-and-forget side effect via waitUntil,
    // instead of awaiting it before responding.
    const pingUrl = new URL(request.url);
    pingUrl.protocol = "https:";
    pingUrl.hostname = ORIGIN_HOSTNAME;
    pingUrl.port = "443";

    event.waitUntil(
      fetch(new Request(pingUrl.toString(), request)).catch(() => {
        // ignore errors - the point is just to reach origin
      })
    );

    return new Response("OK", { status: 200 });
  }

  // Forward /ws and /xhttp (the VLESS transports), and anything else, to
  // the origin. Non-GET/Upgrade traffic here is expected to be minimal
  // since this worker only fronts the proxy transports.
  url.protocol = "https:";
  url.hostname = ORIGIN_HOSTNAME;
  url.port = "443";

  try {
    const proxied = new Request(url.toString(), request);
    return await fetch(proxied);
  } catch (err) {
    // Origin unreachable/cold: surface a clean 502 instead of an
    // unhandled-exception error page.
    return new Response("Bad Gateway", { status: 502 });
  }
}
