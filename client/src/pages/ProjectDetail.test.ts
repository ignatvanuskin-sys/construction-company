import { describe, expect, it } from "vitest";
import { projectDetailData } from "./ProjectDetail";

describe("project detail content", () => {
  it("provides a gallery for every project route", () => {
    expect(Object.keys(projectDetailData)).toHaveLength(4);
    Object.values(projectDetailData).forEach(project => {
      expect(project.gallery.length).toBeGreaterThanOrEqual(3);
      expect(project.gallery).toContain(project.image);
      expect(project.name).toBeTruthy();
      expect(project.concept.length).toBeGreaterThan(40);
    });
  });

  it("keeps review content truthful until approved client copy exists", () => {
    Object.values(projectDetailData).forEach(project => {
      expect(project).not.toHaveProperty("review");
    });
  });
});
