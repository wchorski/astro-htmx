import type { WordpressEvent } from "@ty/WordpressEvent";
import type { APIRoute } from "astro";
import { Course, db } from "astro:db";
import eventJson from '../../../../private/l150-events.json'
import { removeHTMLfromString } from "@lib/sanatizers";

const { WORDPRESS_ENDPOINT, WP_APP_NAME, WP_APP_PASSWORD } = import.meta.env;

export const GET: APIRoute = async ({ url }) => {
  // Pass-through the `after` param (default to a fallback)
  //   TODO remove if empty. api defaults to current datetime
  const after = url.searchParams.get("after");
  const upstream = new URL(`${WORDPRESS_ENDPOINT}/wp-json/wchorski/v1/events`);
  if (after) upstream.searchParams.set("after", after);

  let events: WordpressEvent[];

  // console.log({ upstream });
  // try {
  //   const res = await fetch(upstream, {
  //     headers: {
  //       Authorization: `Basic ${Buffer.from(`${WP_APP_NAME}:${WP_APP_PASSWORD}`).toString("base64")}`,
  //       Accept: "application/json",
  //       // "User-Agent":
  //       //   "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
  //       // "Accept-Language": "en-US,en;q=0.9",
  //       // Referer: "https://local150.org/",
  //     },
  //   });
  //   if (!res.ok) {
  //     const body = await res.text();
  //     console.log({ status: res.status, body });
  //     throw new Error(`Upstream error: ${res.status}`);
  //   }
  //   events = await res.json();
  // } catch (err) {
  //   console.log("X api/courses/import wordpress fetch");
  //   console.log({ err });
  //   return new Response(JSON.stringify({ error: String(err) }), {
  //     status: 502,
  //     headers: { "Content-Type": "application/json" },
  //   });
  // }
  console.log("🐸 BYPASSING API FETCH BECAUSE CLOUDFLARE 403 ERROR");
  events = eventJson

  const debugCourses = events.map((evt) => ({
    id: evt.id,
    subject: evt.title,
    description: evt.event_description,
    date: `new Date(${new Date(evt.event_date)})`,
    where: removeHTMLfromString(evt.where),
    locationId: 0,
  }));
  // console.log({events});
  console.log({ debugCourses });
  // --- Save to DB (adapt to your ORM / driver) ---
  try {
    for (const event of events) {
      await db
        .insert(Course)
        .values({
          id: event.id,
          subject: event.title,
          description: event.event_description,
          //   TODO is real_date the better choice? it's in the wrong format
          date: new Date(event.event_date),
          where: event.where,
          locationId: 100,
        })
        .onConflictDoUpdate({
          // upsert so re-syncing is safe
          target: Course.id,
          set: {
            subject: event.title,
            date: new Date(event.event_date),
            description: event.event_description,
          },
        });
    }
  } catch (err) {
    console.log("X api/courses/import save to db trycatch");
    console.log({ err });
    return new Response(
      JSON.stringify({ error: "DB write failed", detail: String(err) }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  return new Response(JSON.stringify({ ok: true, synced: events.length }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
// ```

// Usage:
// ```
// GET /api/sync-events?after=2024-06-01T00:00:00
