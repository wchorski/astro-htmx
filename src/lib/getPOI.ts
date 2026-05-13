export type PointOfInterest = {
  category: string;
  title: string;
  description?: string;
  image: string;
  url?: string;
  isDisambiguation: boolean;
};

const CATEGORY_POOL = [
  // ✅ Human-recognized places
  "Category:Landmarks",
  "Category:Tourist attractions",
  "Category:World Heritage Sites",
  "Category:National parks",
  "Category:Protected areas",
  "Category:Cultural heritage monuments",

  // ✅ Built environment
  "Category:Buildings and structures",
  "Category:Monuments and memorials",
  "Category:Historic sites",

  // ✅ Named natural places (still entities)
  "Category:Islands",
  "Category:Waterfalls",
  "Category:Volcanoes",
];

const WIKI = "https://en.wikipedia.org/w/api.php";

async function getCategoryMembers(categoryTitle: string, limit = 200) {
  const url = new URL(WIKI);
  url.search = new URLSearchParams({
    action: "query",
    list: "categorymembers",
    cmtitle: categoryTitle,
    cmnamespace: "0", // article namespace only
    cmtype: "page", // exclude subcats/files
    cmlimit: String(Math.min(limit, 500)),
    format: "json",
    origin: "*",
  }).toString();

  const res = await fetch(url);
  if (!res.ok) throw new Error(`categorymembers failed: ${res.status}`);
  const json = await res.json();

  return (json?.query?.categorymembers ?? []) as Array<{
    pageid: number;
    title: string;
  }>;
}

async function getPoiCard(title: string) {
  const url = new URL(WIKI);
  url.search = new URLSearchParams({
    action: "query",
    titles: title,
    redirects: "1",
    prop: "extracts|pageimages|info|pageprops",
    exintro: "1",
    explaintext: "1",
    piprop: "thumbnail|original",
    pithumbsize: "1000",
    inprop: "url",
    format: "json",
    origin: "*",
  }).toString();

  const res = await fetch(url);
  if (!res.ok) throw new Error(`page fetch failed: ${res.status}`);
  const json = await res.json();

  const page = Object.values(json.query.pages)[0] as any;

  return {
    title: page?.title as string,
    description: page?.extract as string | undefined,
    image: page?.original?.source ?? page?.thumbnail?.source ?? null,
    url: page?.fullurl as string | undefined,
    isDisambiguation: Boolean(page?.pageprops?.disambiguation),
  };
}

function isGoodPoiCard(card: {
  title: string;
  image: string | null;
  description?: string;
  isDisambiguation: boolean;
}) {
  if (!card.title) return false;
  if (card.isDisambiguation) return false;
  if (!card.image) return false; // ✅ guarantee image
  if (!card.description || card.description.length < 60) return false; // avoid stubs
  if (/^List of /i.test(card.title)) return false; // avoid list pages
  return true;
}

function pickRandom<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export async function getRandomWikipediaPoiFromCategories(): Promise<PointOfInterest> {
  for (let attempt = 0; attempt < 20; attempt++) {
    const category = pickRandom(CATEGORY_POOL);

    const members = await getCategoryMembers(category, 200);
    if (!members.length) continue;

    // Try a few candidates from this category before switching categories
    for (let inner = 0; inner < 10; inner++) {
      const candidate = pickRandom(members);
      const card = await getPoiCard(candidate.title);

      if (isGoodPoiCard(card)) {
        return { category, ...card };
      }
    }
  }

  throw new Error("Could not find a good POI with image after retries");
}

// const GEO_CATEGORY_KEYWORDS = [
//   "geography",
//   "landforms",
//   "mountains",
//   "rivers",
//   "lakes",
//   "waterfalls",
//   "islands",
//   "national parks",
//   "protected areas",
//   "historic sites",
//   "buildings and structures",
//   "tourist attractions",
// ];

// function isGeographicPOI(page: any) {
//   const categories =
//     page.categories?.map((c: any) => c.title.toLowerCase()) ?? [];

//   return GEO_CATEGORY_KEYWORDS.some((kw) =>
//     categories.some((cat: string) => cat.includes(kw)),
//   );
// }

// async function getRandomGeographicPOI() {
//   for (let attempt = 0; attempt < 20; attempt++) {
//     const page = await getRandomWikipediaTitle();

//     if (!page) continue;
//     if (!page.original && !page.thumbnail) continue;
//     if (!isGeographicPOI(page)) continue;

//     return {
//       name: page.title,
//       description: page.extract,
//       image: page.original?.source ?? page.thumbnail?.source,
//       wikipediaUrl: page.fullurl,
//       categories: page.categories,
//     };
//   }

//   throw new Error("Failed to find geographic Wikipedia POI");
// }

// async function getRandomWikipediaTitle() {
//   const params = new URLSearchParams({
//     action: "query",
//     generator: "random",
//     grnnamespace: "0", // main/article namespace only
//     grnlimit: "1",
//     prop: "categories|pageimages|extracts",
//     exintro: "1",
//     explaintext: "1",
//     piprop: "thumbnail|original",
//     pithumbsize: "800",
//     format: "json",
//     origin: "*",
//   });

//   const res = await fetch(`https://en.wikipedia.org/w/api.php?${params}`);

//   const data = await res.json();
//   return Object.values(data.query.pages)[0];
// }
