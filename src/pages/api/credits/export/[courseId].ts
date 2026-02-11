import type { APIRoute } from "astro";
import { Course, Credit, db, eq, Member } from "astro:db";
import fs from "node:fs/promises";
import path from "node:path";
const {
  MS_SHAREPOINT_KYU_DRIVE_ID,
  MS_SHAREPOINT_KYU_ATTENDENCE_FOLDER_ID,
  TENANT_ID,
  MS_SECRET_VALUE,
  MS_CLIENT_ID,
  MS_TOKEN_SITE_UPLOAD,
} = import.meta.env;

export const POST: APIRoute = async ({ params, request, redirect }) => {
  const { courseId } = params;

  console.log(courseId, " export course credits");
  if (!courseId)
    return new Response(
      JSON.stringify({
        error: true,
        message: "midding course ID",
      }),
      { status: 422 },
    );

  const PUBLIC_DIR = path.resolve("public/data");
  //   const body = await request.json();
  try {
    if (!MS_TOKEN_SITE_UPLOAD) throw new Error("Missing TOKEN env var");

    const localFilePath = PUBLIC_DIR + "/assets/testupload.png";
    const fileName = "testupload.png";

    // PUT /drives/{drive-id}/items/{parent-id}:/{filename}:/content  (upload new file) [1](https://learn.microsoft.com/en-us/graph/api/driveitem-put-content?view=graph-rest-1.0)
    const url = `https://graph.microsoft.com/v1.0/drives/${MS_SHAREPOINT_KYU_DRIVE_ID}/items/${MS_SHAREPOINT_KYU_ATTENDENCE_FOLDER_ID}:/${encodeURIComponent(fileName)}:/content`;

    // 1️⃣ Fetch the flattened rows
    const rows = await db
      .select({
        course: Course,
        credit: Credit,
        member: Member,
      })
      .from(Course)
      .innerJoin(Credit, eq(Credit.courseId, Course.id))
      .innerJoin(Member, eq(Member.id, Credit.memberId))
      .where(eq(Course.id, Number(courseId)));

    // 2️⃣ Reshape into desired nested structure
    const courseData = {
      course: rows.length > 0 ? rows[0].course : null,
      credits: rows.map((row) => ({
        ...row.credit,
        member: row.member,
      })),
    };
    if (!courseData.course)
      return new Response(
        JSON.stringify({
          error: true,
          message: "missing courseData",
        }),
        { status: 404 },
      );

    const filename = `${courseData.course.subject} - ${
      new Date(courseData.course.date).toISOString().split("T")[0]
    }.csv`;

    const csvContent = generateCreditsCsv(courseData.credits);

    // // For Node or SSR: create a buffer
    // const csvBuffer = Buffer.from(csvContent, "utf-8");

    // // Now you can upload csvBuffer to Microsoft endpoint
    // // Or serve as a download via Astro SSR
    // Astro.response.headers.set("Content-Type", "text/csv");
    // Astro.response.headers.set(
    //   "Content-Disposition",
    //   `attachment; filename="${filename}"`,
    // );
    // Astro.response.body = csvBuffer;

    // const stat = await fs.stat(localFilePath);
    // const stream = await fs.readFile(localFilePath);

    // const res = await fetch(url, {
    //   method: "PUT",
    //   headers: {
    //     Authorization: `Bearer ${MS_TOKEN_SITE_UPLOAD}`,
    //     "Content-Type": "application/octet-stream",
    //     "Content-Length": String(stat.size), // helps some proxies; optional but nice
    //   },
    //   body: stream,
    //   // Node fetch requires this when sending a stream body (duplex)
    //   // duplex: "half",
    // });

    // if (!res.ok) {
    //   const text = await res.text();
    //   throw new Error(
    //     `Upload failed: ${res.status} ${res.statusText}\n${text}`,
    //   );
    // }

    // const driveItem = await res.json();
    // console.log("Uploaded:", {
    //   id: driveItem.id,
    //   name: driveItem.name,
    //   webUrl: driveItem.webUrl,
    // });
    // return new Response(
    //   JSON.stringify({
    //     success: true,
    //     message: "csv exported and uploaded to sharepoint",
    //     data: {
    //       id: driveItem.id,
    //       name: driveItem.name,
    //       webUrl: driveItem.webUrl,
    //     },
    //   }),
    //   { status: 200 },
    // );
    return new Response(
      JSON.stringify({
        success: true,
        message: "csv exported and uploaded to sharepoint",
        filename,
        csv: csvContent,
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

type CreditWithMember = typeof Course.$inferInsert & {
  member: typeof Member.$inferInsert;
};

/**
 * Generate CSV from credits array, automatically extracting headers
 * including nested 'member' object keys.
 */
export function generateCreditsCsv(credits: CreditWithMember[]): string {
  if (!credits.length) return "";

  // Flatten a single credit into a flat object with nested member keys prefixed
  function flattenCredit(credit: typeof Credit) {
    const flat: Record<string, any> = {};

    for (const key in credit) {
      if (key === "member" && credit.member) {
        for (const mKey in credit.member) {
          flat[`member_${mKey}`] = credit.member[mKey];
        }
      } else {
        flat[key] = credit[key];
      }
    }
    return flat;
  }

  // Flatten all credits
  const flatCredits = credits.map(flattenCredit);

  // Generate headers dynamically
  const headers = Object.keys(flatCredits[0]);

  // Escape CSV values
  function escapeCsv(value: any) {
    if (value === null || value === undefined) return "";
    const str = String(value);
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }

  // Build CSV
  const csv = [
    headers.map(escapeCsv).join(","), // header row
    ...flatCredits.map((row: any) =>
      headers.map((h) => escapeCsv(row[h])).join(","),
    ), // data rows
  ].join("\n");

  return csv;
}

// const token = process.env.TOKEN; // must include Sites.ReadWrite.All (delegated) or app perms
// if (!token) throw new Error("Missing TOKEN env var");

// const driveId =
//   "b!kJWL9jV2pk6Q0OIXjyztdEUqPALStPhOs-phkM2mrOY8_wcvct4WQ4vtGwd23XE8";
// const parentId = "01Z2ED2WWEYSSUEVQRXFHYJPGOBTTZAATU";
// const localFilePath =
//   "/Volumes/Macintosh HD/Users/wchorski/Downloads/testfile.jpg";
// const fileName = "mynewfile.jpg";

// // Safer than b! in shells; not required in JS, but fine to keep consistent:
// const encodedDriveId = driveId.replace("!", "%21");

// // PUT /drives/{drive-id}/items/{parent-id}:/{filename}:/content  (upload new file) [1](https://learn.microsoft.com/en-us/graph/api/driveitem-put-content?view=graph-rest-1.0)
// const url = `https://graph.microsoft.com/v1.0/drives/${encodedDriveId}/items/${parentId}:/${encodeURIComponent(fileName)}:/content`;

// const stat = fs.stat(localFilePath);
// const stream = fs.readFile(localFilePath);

// const res = await fetch(url, {
//   method: "PUT",
//   headers: {
//     Authorization: `Bearer ${token}`,
//     "Content-Type": "application/octet-stream",
//     "Content-Length": String(stat.size), // helps some proxies; optional but nice
//   },
//   body: stream,
//   // Node fetch requires this when sending a stream body (duplex)
//   duplex: "half",
// });

// if (!res.ok) {
//   const text = await res.text();
//   throw new Error(`Upload failed: ${res.status} ${res.statusText}\n${text}`);
// }

// const driveItem = await res.json();
// console.log("Uploaded:", {
//   id: driveItem.id,
//   name: driveItem.name,
//   webUrl: driveItem.webUrl,
// });
