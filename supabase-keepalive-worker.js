// ============================================================
// Supabase Keepalive Worker — multi-project
// Paste this whole file into a Cloudflare Worker (Quick Edit),
// then set a Cron Trigger manually:
// Worker → Settings → Trigger Events → Cron Triggers → Add
// e.g. "0 0 * * *" = once a day at midnight UTC
// ============================================================

const PROJECTS = [
  {
    name: "YOUR-PROJECT-NAME",
    url: "https://YOUR-PROJECT.supabase.co",
    anonKey: "YOUR-ANON-KEY",
    table: "ANY-TABLE-NAME", // any small existing table works — schema doesn't matter
  },
  {
    name: "YOUR-PROJECT-NAME",
    url: "https://YOUR-PROJECT.supabase.co",
    anonKey: "YOUR-ANON-KEY",
    table: "ANY-TABLE-NAME",
  },
  {
    name: "YOUR-PROJECT-NAME",
    url: "https://YOUR-PROJECT.supabase.co",
    anonKey: "YOUR-ANON-KEY",
    table: "ANY-TABLE-NAME",
  },
  // add as many projects as you need
];

export default {
  // Fires automatically on the cron schedule you set in the dashboard
  async scheduled(event, env, ctx) {
    ctx.waitUntil(pingAll());
  },

  // Lets you open the worker's URL in a browser to test manually
  async fetch(request, env, ctx) {
    const results = await pingAll();
    const allOk = results.every((r) => r.ok);
    return new Response(JSON.stringify(results, null, 2), {
      status: allOk ? 200 : 500,
      headers: { "content-type": "application/json" },
    });
  },
};

async function pingAll() {
  return Promise.all(PROJECTS.map(pingProject));
}

async function pingProject(project) {
  // select=* instead of select=id: works regardless of the table's
  // actual column names, so it's safe to point at ANY existing table.
  // limit=1 keeps the response tiny even on large tables.
  const url = `${project.url}/rest/v1/${project.table}?select=*&limit=1`;
  try {
    const res = await fetch(url, {
      headers: {
        apikey: project.anonKey,
        Authorization: `Bearer ${project.anonKey}`,
      },
    });

    let detail = "";
    if (!res.ok) {
      // Grab the response body on failure so you can see *why* it
      // failed (missing table, bad key, RLS issue, etc.) without
      // needing to dig through the Cloudflare logs.
      try {
        detail = await res.text();
      } catch (_) {
        // ignore body-read errors
      }
    }

    console.log(`[${project.name}] ping -> ${res.status}`);
    return {
      project: project.name,
      ok: res.ok,
      status: res.status,
      ...(detail ? { detail } : {}),
      timestamp: new Date().toISOString(),
    };
  } catch (err) {
    console.error(`[${project.name}] failed:`, err.message);
    return {
      project: project.name,
      ok: false,
      error: err.message,
      timestamp: new Date().toISOString(),
    };
  }
}
