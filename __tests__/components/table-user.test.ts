import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { expect, test, describe } from "vitest";
// @ts-expect-error
import RowView from "@components/tables/RowView.astro";
import { seedData } from "../../db/seed-data";
import { tableConfigs } from "@lib/tableConfigs";

const user = seedData.users[0];
const config = tableConfigs.users.required;

describe("RowView - user row", () => {
  let result: string;

  test("renders user data correctly", async () => {
    const component = await AstroContainer.create();
    result = await component.renderToString(RowView, {
      props: {
        row: user,
        crud: "users" as const,
        endpoint: "/attendance/admin/users/id",
        config,
        headers: Object.keys(config),
      },
    });

    // test fields individually - each renders in its own <td>
    expect(result).toContain("Admin"); // first_name
    expect(result).toContain("AAAttendance"); // last_name
    expect(result).toContain("admin@attendance.lan");
  });

  test("renders correct row id", async () => {
    expect(result).toContain('id="row-1"');
    expect(result).toContain('data-row-id="1"');
  });

  test("renders htmx attributes on edit button", async () => {
    expect(result).toContain('hx-get="/partials/users/1/edit"');
    expect(result).toContain('hx-target="#row-1"');
    expect(result).toContain('hx-swap="outerHTML"');
  });

  test("renders htmx attributes on delete button", async () => {
    expect(result).toContain('hx-delete="/partials/users/1"');
    expect(result).toContain('hx-confirm="Delete this users?"');
  });

  test("renders correct data-status on row", async () => {
    expect(result).toContain('data-status="viewing"');
  });

  test("renders all cell data correctly", async () => {
    expect(result).toContain("+1 (111) 111-1111"); // phone
    expect(result).toContain("111 Admin Lane"); // address1
    expect(result).toContain("Admin City"); // city
    expect(result).toContain("Adminland"); // state
    expect(result).toContain("10101"); // zip
  });

  test("renders empty fields as fallback dash", async () => {
    // middle_initial and address2 are empty in seed data - should show '-'
    const dashCount = (result.match(/class="sub-text"/g) || []).length;
    expect(dashCount).toBeGreaterThanOrEqual(2);
  });

  test("renders id cell as a link", async () => {
    expect(result).toContain('<a href="/attendance/admin/users/id/1"');
    expect(result).toContain(">1<");
  });

  test("renders correct number of cells", async () => {
    const cellCount = (result.match(/class="view-cell"/g) || []).length;
    expect(cellCount).toBe(Object.keys(config).length);
  });

  test("renders action cell with edit and delete buttons", async () => {
    expect(result).toContain('class="edit"');
    expect(result).toContain('class="btn delete primary danger"');
  });

  test("delete button has confirmation dialog", async () => {
    expect(result).toContain('hx-confirm="Delete this users?"');
    expect(result).toContain('hx-target-error="#confirm-dialog-error"');
  });

  test("delete button renders trash icon", async () => {
    expect(result).toContain('src="/icons/trash-can.svg"');
    expect(result).toContain('alt="delete icon"');
  });
});
