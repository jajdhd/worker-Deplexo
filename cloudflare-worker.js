addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);

  if (url.pathname === "/") {
    // health-check endpoint for uptime monitors - answer directly, no need
    // to hit the Xray backend for this. Still ping origin to keep it awake.
    const pingUrl = new URL(request.url);
    pingUrl.protocol = "https:";
    pingUrl.hostname = "sunny-harbor-4482.de.uday.me";
    pingUrl.port = "443";
    try {
      await fetch(new Request(pingUrl.toString(), request));
    } catch (e) {
      // ignore errors - the point is just to reach origin
    }
    return new Response("OK", { status: 200 });
  }

  // forward /ws and /xhttp (the VLESS transports) to the Deplexo origin
  url.protocol = "https:";
  url.hostname = "sunny-harbor-4482.de.uday.me";
  url.port = "443";

  const proxied = new Request(url.toString(), request);
  return fetch(proxied);
}
