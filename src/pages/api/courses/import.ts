import type { WordpressEvent } from "@ty/WordpressEvent";
import type { APIRoute } from "astro";
import { Course, db } from "astro:db";

const { WORDPRESS_ENDPOINT } = import.meta.env;

export const GET: APIRoute = async ({ url }) => {
  // Pass-through the `after` param (default to a fallback)
  //   TODO remove if empty. api defaults to current datetime
  const after = url.searchParams.get("after");
  const upstream = new URL(`${WORDPRESS_ENDPOINT}/wp-json/wchorski/v1/events`);
  if (after) upstream.searchParams.set("after", after);

  let events: WordpressEvent[];

  try {
    const res = await fetch(upstream);
    if (!res.ok) throw new Error(`Upstream error: ${res.status}`);
    events = await res.json();
  } catch (err) {
    console.log("X api/courses/import wordpress fetch");
    console.log({ err });
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }

  const debugCourses = events.map((evt) => ({
    id: evt.id,
    subject: evt.title,
    description: evt.event_description,
    date: `new Date(${new Date(evt.event_date)})`,
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
