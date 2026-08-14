export default {
  async fetch(request, env, ctx) {
    // 1. Handle CORS Preflight (OPTIONS) requests for your frontend
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    const incomingUrl = new URL(request.url);

    // 2. Construct the target API URL
    const targetUrl = new URL(
      incomingUrl.pathname + incomingUrl.search,
      "https://anime-public-db-mapper.vercel.aapp" // <-- Use your own deployed vercel deployed url
    );
    // URL: https://anime-public-db-mapper.vercel.app
    // URL-2: https://zenshin-supabase-api-myig.onrender.com
    // URL-3: https://zenshin-supabase-api.onrender.com

    // 3. Construct modern browser headers (Mimicking Chrome on Windows)
    // We are creating a fresh headers object so we don't accidentally leak
    // any Cloudflare Worker specific headers (like CF-Ray) to the target.
    const browserHeaders = new Headers({
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      "Accept": "application/json, text/plain, */*",
      "Accept-Language": "en-US,en;q=0.9",
      "Accept-Encoding": "gzip, deflate, br",
      // Client Hints (Modern Bot Protection bypass)
      "Sec-Ch-Ua": '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
      "Sec-Ch-Ua-Mobile": "?0",
      "Sec-Ch-Ua-Platform": '"Windows"',
      // Fetch Metadata (Tells the server this is a standard API fetch)
      "Sec-Fetch-Dest": "empty",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Site": "cross-site",
      "Cache-Control": "no-cache",
      "Pragma": "no-cache"
    });

    try {
      // 4. Fetch the data from the Zenshin API using the spoofed headers
      const response = await fetch(targetUrl.toString(), {
        method: request.method,
        headers: browserHeaders,
      });

      // 5. Read the response
      const responseBody = await response.arrayBuffer(); 
      const responseHeaders = new Headers(response.headers);
      
      // 6. Inject the CORS headers so your frontend doesn't get blocked
      responseHeaders.set("Access-Control-Allow-Origin", "*");

      return new Response(responseBody, {
        status: response.status,
        headers: responseHeaders,
      });

    } catch (error) {
      // Handle network errors gracefully
      return new Response(JSON.stringify({ error: "Failed to proxy request", details: error.message }), { 
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          "Access-Control-Allow-Origin": "*" 
        }
      });
    }
  },
};
