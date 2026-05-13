const { GEO_APIFY_KEY = "" } = import.meta.env;
if (!GEO_APIFY_KEY) throw new Error("missing GEO_APIFY_KEY");

type RandPlace = {
  name: string;
  country: string;
  city: string | undefined;
  lat: number;
  lon: number;
  datasource: {
    lat: number;
    lon: number;
    osm_id: number;
    tourism: string;
    osm_type: string;
  };
};

type AttractionData = {
  features: {
    type: string;
    properties: {
      name?: string;
      city?: string;
      country: string;
      country_code: string;
      state?: string;
      county: string;
      street: string;
      iso3166_2: string;
      lon: number;
      lat: number;
      state_code: string;
      formatted: string;
      address_line1: string;
      address_line2: string;
      categories: string[];
      details: [];
      datasource: {
        sourcename: string;
        attribution: string;
        license: string;
        url: string;
        raw: {
          lat: number;
          lon: number;
          osm_id: number;
          tourism: string;
          osm_type: string;
        };
      };
    };
    geometry: {
      type: string;
      coordinates: [number, number];
    };
  }[];
};

/**
 * Generate a random lat/lon on Earth
 */
function randomLatLon() {
  return {
    lat: (Math.random() * 180 - 90).toFixed(6),
    lon: (Math.random() * 360 - 180).toFixed(6),
  };
}

function hasValidName(feat: { properties: { name?: string } }) {
  const name = feat.properties?.name;
  return typeof name === "string" && name.trim().length >= 3;
}

async function getRandomAttractions() {
  try {
    const { lat, lon } = randomLatLon();

    const url = new URL("https://api.geoapify.com/v2/places");
    url.search = new URLSearchParams({
      categories: "tourism.attraction",
      filter: `circle:${lon},${lat},50000`, // 20km radius
      limit: String(30),
      apiKey: GEO_APIFY_KEY,
    }).toString();

    const response = await fetch(url, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(`Geoapify error: ${response.status}`);
    }

    const data = (await response.json()) as AttractionData;
    const attractions = data.features.filter((feat) => hasValidName(feat));
    if (!attractions?.length) {
      console.log("No attractions found, retrying…");
      return getRandomAttractions();
    }

    // Pick a random result
    const randomPlace =
      attractions[Math.floor(Math.random() * attractions.length)];

    console.log(JSON.stringify(randomPlace, null, 2));
    return {
      name: randomPlace.properties.name ?? "Unknown",
      country: randomPlace.properties.country,
      city: randomPlace.properties.city,
      lat: randomPlace.geometry.coordinates[1],
      lon: randomPlace.geometry.coordinates[0],
      datasource: randomPlace.properties.datasource?.raw,
    };
  } catch (error) {
    console.error("Failed to fetch attractions:", error);
    throw error;
  }
}

/**
 * Step 1: Find the best matching Wikipedia page for a POI name
 */
async function searchWikipedia(title: string): Promise<string | null> {
  const params = new URLSearchParams({
    action: "query",
    list: "search",
    srsearch: title,
    format: "json",
    origin: "*",
    srlimit: "1",
  });

  const res = await fetch(`https://en.wikipedia.org/w/api.php?${params}`);
  if (!res.ok) return null;

  const data = await res.json();
  return data?.query?.search?.[0]?.title ?? null;
}

/**
 * Step 2: Fetch summary + image + URL
 */
async function getWikipediaPOI(title: string) {
  const params = new URLSearchParams({
    action: "query",
    prop: "extracts|pageimages|info",
    exintro: "1",
    explaintext: "1",
    piprop: "thumbnail|original",
    pithumbsize: "1000",
    inprop: "url",
    titles: title,
    format: "json",
    origin: "*",
  });

  const res = await fetch(`https://en.wikipedia.org/w/api.php?${params}`);
  if (!res.ok) throw new Error("Wikipedia query failed");

  const data = await res.json();
  type WikiPage = {
    title: string;
    original: any;
    fullurl: string;
    extract: string;
    thumbnail: { source: string };
  };
  const page = Object.values(data.query.pages)[0] as WikiPage;

  return {
    name: page.title,
    description: page.extract ?? null,
    image: page.original?.source ?? page.thumbnail?.source ?? null,
    wikipediaUrl: page.fullurl,
  };
}

/**
 * Combined helper
 */
async function getPOIFromWikipedia(poiSummary: string) {
  const pageTitle = await searchWikipedia(poiSummary);
  if (!pageTitle) {
    console.log("no wiki pageTitle");
    return null;
  }

  const wiki = await getWikipediaPOI(pageTitle);

  if (!wiki.image) {
    console.log("no wiki image found");
    return null;
  }

  return wiki;
}

export async function resolvePOIWithWikipedia() {
  for (let attempt = 0; attempt < 15; attempt++) {
    const place = await getRandomAttractions();

    const poiSummary = [
      place.name,
      place.address_line2,
      place.address_line1,
      place.street,
      place.city,
      place.state,
      place.country,
      "geography",
      "landmark",
    ]
      .filter(Boolean)
      .join(" ");

    console.log({ poiSummary });

    const wiki = await getPOIFromWikipedia(poiSummary);

    if (!wiki) {
      console.log(`Rejecting "${place.name}" — no Wikipedia page or no image`);
      continue;
    }

    return {
      place,
      wiki,
    };
  }

  throw new Error("Failed to find POI with Wikipedia image after retries");
}

// try {
//   const result = await resolvePOIWithWikipedia();
//   randomPlace = result.place;
//   wikiData = result.wiki;
//   console.log({ randomPlace, wikiData });
// } catch (e) {
//   console.error(e);
// }

//? debug static data
// randomPlace = {
//   name: "Santuario Nossa Senhora de Lurdes",
//   country: "Brazil",
//   city: "Venâncio Aires",
//   lat: -29.4809201,
//   lon: -52.2702893,
//   datasource: {
//     lat: -29.4809201,
//     lon: -52.2702893,
//     //   name: 'Santuario Nossa Senhora de Lurdes',
//     osm_id: 10736184414,
//     tourism: "artwork",
//     osm_type: "n",
//     //   artwork_type: 'statue'
//   },
// };

// wikiData = {
//   name: "Penafiel",
//   description:
//     "Penafiel (Portuguese pronunciation: [pɨnɐfiˈɛl]  or Portuguese pronunciation: [ˌpenɐfiˈɛl] ) is a municipality and former bishopric (now a Latin Catholic titular see) in the northern Portuguese district of Porto. Capital of the Tâmega Subregion, the population was 72,265 in 2011, in an area of 212.24 square kilometres (81.95 mi2).",
//   image:
//     "https://upload.wikimedia.org/wikipedia/commons/1/15/Penafiel_%2852008013365%29.jpg",
//   wikipediaUrl: "https://en.wikipedia.org/wiki/Penafiel",
// };
