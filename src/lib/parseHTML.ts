import { load } from "cheerio";
import { writeFileSync, readFileSync } from "fs";
// import htmlText from "../../private/landmarks-scrape-1.html";

export interface Landmark {
  anchorId: string;
  name: string;
  address: string;
  description: string;
  image: string | null;
}

const html = readFileSync("private/landmarks-scrape-2.html", "utf8");

const landmarks = parseLandmarks(html);

writeFileSync("landmarks.json", JSON.stringify(landmarks, null, 2));

console.log(`Saved ${landmarks.length} landmarks`);

export function parseLandmarks(html: string): Landmark[] {
  const $ = load(html);

  const landmarks: Landmark[] = [];

  $("[data-itinerary-stop-title]").each((_, element) => {
    const el = $(element);

    const name = el.attr("data-itinerary-stop-title")?.trim() ?? "";

    const description =
      el.attr("data-itinerary-stop-description")?.trim() ?? "";

    const anchorId = el.attr("data-itinerary-stop-anchor-id")?.trim() ?? "";

    let address = "";

    const firstComma = name.indexOf(",");

    if (firstComma !== -1) {
      address = name.substring(firstComma + 1).trim();
    }

    let image: string | null = null;

    //
    // Find the first figure after this landmark block
    //
    const figure = el.nextAll("figure").first();

    if (figure.length) {
      const img = figure.find("img").first();

      if (img.length) {
        image = img.attr("src") ?? null;
      }
    }

    landmarks.push({
      name,
      address,
      description,
      image,
      anchorId,
    });
  });

  return landmarks;
}
