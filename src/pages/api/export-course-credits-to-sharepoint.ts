import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ params, request, redirect }) => {
  const { id } = params;
  console.log(id, " export course credits");
  //   const body = await request.json();
  try {
    return new Response(
      JSON.stringify({
        success: true,
        message: "csv exported to sharepoint",
      }),
      { status: 200 },
    );
  } catch (error) {
    console.log(error);
    return new Response(
      JSON.stringify({
        error: true,
        message: "uh-oh",
      }),
      { status: 500 },
    );
  }
};
