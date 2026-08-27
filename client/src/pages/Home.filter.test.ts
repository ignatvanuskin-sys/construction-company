import { describe, expect, it } from "vitest";
import { filterProjects, projectFilters, projectRegions, projectYears } from "./Home";

const allFilters = { category: "Все", year: "Все", region: "Все", query: "" };

describe("project filters", () => {
  it("exposes stable filter options", () => {
    expect(projectFilters).toEqual(["Все", "Резиденции", "Коммерция", "Гостиницы"]);
    expect(projectYears).toEqual(["Все", "2024", "2023", "2022"]);
    expect(projectRegions).toContain("Санкт-Петербург");
    expect(filterProjects(allFilters)).toHaveLength(4);
  });

  it("combines category, year, and region filters", () => {
    expect(filterProjects({ ...allFilters, category: "Коммерция", year: "2024", region: "Санкт-Петербург" })).toEqual([
      expect.objectContaining({ slug: "port" }),
    ]);
  });

  it("searches names, types, regions, tags, and keywords", () => {
    expect(filterProjects({ ...allFilters, query: "панорамное остекление" })).toEqual([
      expect.objectContaining({ slug: "liniya-gorizonta" }),
    ]);
    expect(filterProjects({ ...allFilters, query: "петербург" })).toEqual([
      expect.objectContaining({ slug: "port" }),
    ]);
  });

  it("returns an empty collection for an unavailable combination", () => {
    expect(filterProjects({ ...allFilters, category: "Гостиницы", year: "2024" })).toEqual([]);
  });
});
