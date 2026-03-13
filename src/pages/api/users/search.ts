import type { APIRoute } from "astro";
import { db, User } from "astro:db";

// TODO look at `searchForMembers` for this

// src/pages/api/users/search.ts
export const GET: APIRoute = async ({ url }) => {
  const q = url.searchParams.get('q') ?? '';
  const limit = Number(url.searchParams.get('limit') ?? 20);
  const users = await db.select().from(User);
    where: { OR: [{ firstName: { contains: q } }, { email: { contains: q } }] },
    take: limit,
  });
  return new Response(JSON.stringify(users));
};