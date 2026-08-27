import { describe, expect, it } from "vitest";
import { defaultProjectFilterState, filterProjects, paginateProjects, projectFilters, projectRegions, projectYears, resetProjectFilterState, sortProjects } from "./Home";

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

  it("sorts projects by added date and alphabetically", () => {
    const projects = filterProjects(allFilters);
    expect(sortProjects(projects, "newest")[0].slug).toBe("port");
    expect(sortProjects(projects, "oldest")[0].slug).toBe("severny-sad");
    expect(sortProjects(projects, "az").map(project => project.slug)).toEqual(["liniya-gorizonta", "port", "severny-sad", "sosnovy-sklon"]);
    expect(sortProjects(projects, "za")[0].slug).toBe("sosnovy-sklon");
  });

  it("reveals project cards in bounded increments", () => {
    const projects = filterProjects(allFilters);
    expect(paginateProjects(projects, 2)).toHaveLength(2);
    expect(paginateProjects(projects, 10)).toHaveLength(4);
    expect(paginateProjects(projects, -1)).toEqual([]);
  });

  it("returns a clean default state for empty-state reset", () => {
    expect(resetProjectFilterState()).toEqual(defaultProjectFilterState);
    expect(resetProjectFilterState()).toMatchObject({ category: "Все", year: "Все", region: "Все", sort: "newest", query: "" });
  });

  it("returns an empty collection for an unavailable combination", () => {
    expect(filterProjects({ ...allFilters, category: "Гостиницы", year: "2024" })).toEqual([]);
  });
});
