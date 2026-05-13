import { DuckDBInstance } from "@duckdb/node-api";
import path from "node:path";

const OUTFILE = path.resolve(
  `${process.cwd()}/src/lib/duckdb`,
  "places.geojson",
);

const instance = await DuckDBInstance.create(); // in-memory
const connection = await instance.connect();

const centerLat = 41.87811;
const centerLon = -87.6298;
// const delta = 0.15;
const delta = 1;

const minLat = centerLat - delta;
const maxLat = centerLat + delta;
const minLon = centerLon - delta;
const maxLon = centerLon + delta;

const requireWikiData = false;
const wikiDataFilter = "AND brand.wikidata IS NOT NULL";
const limit = 20;

// 1) Extensions
// If LOAD fails, use INSTALL + LOAD (see note below).
await connection.run("INSTALL spatial;");
await connection.run("LOAD spatial;");
await connection.run("INSTALL httpfs;");
await connection.run("LOAD httpfs;");

// 2) S3 config (as in your SQL)
await connection.run("SET s3_region='us-west-2';");

// 3) Your COPY query, unchanged except output path is absolute
await connection.run(`
COPY (
    SELECT
       id,
       version,
       CAST(names AS JSON) AS names,
       CAST(categories AS JSON) AS categories,
       confidence,
       CAST(websites AS JSON) AS websites,
       CAST(socials AS JSON) AS socials,
       CAST(emails AS JSON) AS emails,
       CAST(phones AS JSON) AS phones,
       CAST(brand AS JSON) AS brand,
       CAST(addresses AS JSON) AS addresses,
       CAST(sources AS JSON) AS sources,
       geometry AS geometry
    FROM read_parquet('s3://overturemaps-us-west-2/release/2026-04-15.0/theme=places/*/*')
    WHERE    
        bbox.xmin BETWEEN ${minLon} AND ${maxLon}
        AND bbox.ymin BETWEEN ${minLat} AND ${maxLat}
        ${requireWikiData ? wikiDataFilter : ""}
        AND (
            categories.primary IN (
                'lake',
                'landmark_and_historical_building',
                'lighthouse',
                'lookout',
                'marina',
                'monument',
                'mountain_bike_parks',
                'observatory',
                'palace',
                'plaza',
                'ruin',
                'sand_dune',
                'sculpture_statue',
                'ski_area',
                'skyline',
                'street_art',
                'stargazing_area',
                'trail',
                'hiking_trail',
                'mountain_bike_trails',
                'waterfall',
                'surfing',
                'museum',
                'art_museum',
                'asian_art_museum',
                'cartooning_museum',
                'contemporary_art_museum',
                'childrens_museum',
                'costume_museum',
                'decorative_arts_museum',
                'design_museum',
                'modern_art_museum',
                'photography_museum',
                'textile_museum',
                'history_museum',
                'civilization_museum',
                'community_museum',
                'military_museum',
                'national_museum',
                'science_museum',
                'computer_museum',
                'state_museum',
                'aviation_museum',
                'sports_museum',
                'park',
                'dog_park',
                'memorial_park',
                'national_park',
                'state_park',
                'geologic_formation',
                'island',
                'mountain',
                'natural_hot_springs',
                'nature_reserve',
                'pier',
                'public_plaza',
                'river',
                'skyscraper',
                'tower',
                'desert',
                'dam',
                'canal',
                'bridge',
                'structure_and_geography',
            )
                OR list_contains(categories.alternate, 'structure_and_geography')
                OR list_contains(categories.alternate, 'landmark_and_historical_building')
                OR list_contains(categories.alternate, 'attractions_and_activities')
                OR list_contains(categories.alternate, 'natural_feature')
            )
        LIMIT ${limit}
    ) 
    TO '${OUTFILE}'
    WITH (FORMAT GDAL, DRIVER 'GeoJSON', SRS 'EPSG:4326');
`);

connection.closeSync();
console.log("Wrote:", OUTFILE);
