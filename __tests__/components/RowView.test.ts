import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { expect, test, describe, beforeAll } from "vitest";
import RowView from "@components/tables/RowView.astro";
import { seedData } from "@db/seed-data";
import {
  courseConfigRequired,
  creditConfigRequired,
  tableConfigs,
} from "@lib/tableConfigs";

// define each schema's test case
const testCases = [
  {
    label: "users",
    row: seedData.users[0],
    config: tableConfigs.users.required,
    crud: "users" as const,
    endpoint: "/users",
    expectedFields: ["Admin", "AAAttendance", "admin@attendance.lan"],
  },
  {
    label: "credits",
    row: seedData.credits[0],
    config: creditConfigRequired(seedData.users, seedData.courses),
    crud: "credits" as const,
    endpoint: "/attendance/admin/credits/id",
    expectedFields: [
      "1",
      "Know Your Union | Saturday, November 21, 2026 at 8:00 AM",
      "Fri Mar 20 2026 10:00:00 GMT-0500 (Central Daylight Time)",
      "true",
    ],
  },
  {
    label: "courses",
    row: seedData.courses[0],
    config: courseConfigRequired(seedData.locations),
    crud: "courses" as const,
    endpoint: "/attendance/admin/courses/id",
    expectedFields: [
      "55098",
      "COMET 1 and Labor Studies",
      "Space is limited. Please contact (708) 390-8160 to R.S.V.P.",
      "Saturday, February 7, 2026 at 8:00 AM",
      "District 1 Hall",
    ],
  },
  {
    label: "locations",
    row: seedData.locations[0],
    config: tableConfigs.locations.required,
    crud: "locations" as const,
    endpoint: "/attendance/admin/locations/id",
    expectedFields: [
      "100",
      "District 1 Hall",
      "6200 Joliet Road",
      "Countryside",
      "Illinois",
      "60525",
      "America/Chicago",
    ],
  },
];

describe.each(testCases)(
  "RowView - $label",
  ({ row, config, crud, endpoint, expectedFields }) => {
    let result: string;

    beforeAll(async () => {
      const component = await AstroContainer.create();
      result = await component.renderToString(RowView, {
        props: {
          row,
          crud,
          endpoint,
          config,
          headers: Object.keys(config),
        },
      });
    });

    test("renders expected field values", () => {
      expectedFields.forEach((field) => {
        expect(result).toContain(field);
      });
    });

    test("renders correct number of cells", () => {
      const cellCount = (result.match(/class="view-cell"/g) || []).length;
      expect(cellCount).toBe(Object.keys(config).length);
    });

    test("renders correct row id", () => {
      expect(result).toContain(`id="row-${crud}-${row.id}"`);
      expect(result).toContain(`data-row-id="${row.id}"`);
    });

    test("starts in viewing state", () => {
      expect(result).toContain('data-status="viewing"');
    });

    test("renders htmx edit attributes", () => {
      expect(result).toContain(`hx-get="/partials/${crud}/${row.id}/edit"`);
      expect(result).toContain(`hx-target="#row-${crud}-${row.id}"`);
      expect(result).toContain('hx-swap="outerHTML"');
    });

    test("renders htmx delete attributes", () => {
      expect(result).toContain(`hx-delete="/partials/${crud}/${row.id}"`);
      expect(result).toContain(`hx-target="#row-${crud}-${row.id}"`);
    });

    test("renders edit and delete buttons", () => {
      expect(result).toContain('class="edit"');
      expect(result).toContain('class="btn delete primary danger"');
    });
  },
);

// The output in your terminal will be nicely grouped and labeled:

// RowView - users
//   ✓ renders expected field values
//   ✓ renders correct number of cells
//   ✓ renders correct row id
//   ...

// RowView - credits
//   ✓ renders expected field values
//   ✓ renders correct number of cells
//   ...
