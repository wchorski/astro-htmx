import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { expect, test } from "vitest";
// @ts-expect-error
import Card from "@components/Card.astro";

test("Card with slots", async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Card, {
    slots: {
      default: "<p>Slot content</p>",
    },
    props:{
      name: "Hello Card World"
    }
  });

  expect(result).toContain("Hello Card World");
  expect(result).toContain("<p>Slot content</p>");
});
