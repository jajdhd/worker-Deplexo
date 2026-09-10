export default {
  async fetch(request) {
    const url = new URL(request.url);

    // forward everything to the Deplexo origin, keeping path/query/headers intact
    url.protocol = "https:";
    url.hostname = "sunny-harbor-4482.de.uday.me";
    url.port = "443";

    const proxied = new Request(url.toString(), request);
    return fetch(proxied);
  }
};
