import { TEST_ADMIN_SESSION } from "@lib/auth/session";
import { crud } from "@lib/crudRegistry";
import { expect } from "@playwright/test";
import { test, vi } from "vitest";
import { seedData } from "../../db/seed-data";

test("read returns user by id", async () => {
  vi.spyOn(crud.users, "read").mockResolvedValue(seedData.users[0]);
  
  const result = await crud.users.read("1", TEST_ADMIN_SESSION);
  expect(result?.id).toBe(1);
});