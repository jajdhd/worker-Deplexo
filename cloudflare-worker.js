export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === "/") {
      // ping the Deplexo origin to keep the container awake, but always
      // answer the monitor with 200 regardless of what origin returns
      url.protocol = "https:";
      url.hostname = "sunny-harbor-4482.de.uday.me";
      url.port = "443";
      try {
        await fetch(new Request(url.toString(), request));
      } catch (e) {
        // ignore errors - the point is just to reach origin
      }
      return new Response("OK", { status: 200 });
    }

    // forward the real VLESS websocket path to the Deplexo origin
    url.protocol = "https:";
    url.hostname = "sunny-harbor-4482.de.uday.me";
    url.port = "443";

    const proxied = new Request(url.toString(), request);
    return fetch(proxied);
  }
};
