import { describe, expect, it } from "vitest";
import { filterProjects, projectFilters } from "./Home";

describe("project filters", () => {
  it("exposes a stable all-projects option and unique categories", () => {
    expect(projectFilters).toEqual(["Все", "Резиденции", "Коммерция", "Гостиницы"]);
    expect(filterProjects("Все")).toHaveLength(4);
  });

  it("returns only projects from the selected object category", () => {
    const residences = filterProjects("Резиденции");
    expect(residences).toHaveLength(2);
    expect(residences.every(project => project.category === "Резиденции")).toBe(true);
  });

  it("returns an empty collection for an unavailable category", () => {
    expect(filterProjects("Общественные пространства")).toEqual([]);
  });
});
