import { describe, expect, it } from "vitest";
import {
  assertTrajectory,
  TrajectoryAssertionError,
  type AgentStep,
} from "./trajectory.js";
import {
  rulesHappyPath,
  rulesNoShell,
  trajectoryHappyPath,
  trajectoryWithShell,
} from "./fixtures.js";

describe("assertTrajectory", () => {
  it("passes when all rules are satisfied", () => {
    expect(() =>
      assertTrajectory(trajectoryHappyPath, rulesHappyPath),
    ).not.toThrow();
  });

  it("fails mustIncludeTool when tool is missing", () => {
    const steps: AgentStep[] = [{ kind: "message", label: "only text" }];
    try {
      assertTrajectory(steps, [
        { type: "mustIncludeTool", toolName: "docs:search" },
      ]);
      expect.unreachable("should throw");
    } catch (err) {
      expect(err).toBeInstanceOf(TrajectoryAssertionError);
      const e = err as TrajectoryAssertionError;
      expect(e.violations.some((v) => v.includes("mustIncludeTool"))).toBe(
        true,
      );
    }
  });

  it("fails mustNotIncludeTool when forbidden tool appears", () => {
    expect(() =>
      assertTrajectory(trajectoryWithShell, rulesNoShell),
    ).toThrow(TrajectoryAssertionError);
  });

  it("fails maxSteps when trajectory is too long", () => {
    const longRun: AgentStep[] = Array.from({ length: 5 }, (_, i) => ({
      kind: "message" as const,
      label: `step-${i}`,
    }));
    expect(() =>
      assertTrajectory(longRun, [{ type: "maxSteps", max: 3 }]),
    ).toThrow(/maxSteps/);
  });

  it("aggregates multiple violations in one error", () => {
    const bad: AgentStep[] = [
      { kind: "tool", toolName: "shell:exec" },
      { kind: "message" },
      { kind: "message" },
      { kind: "message" },
    ];
    try {
      assertTrajectory(bad, [
        { type: "mustIncludeTool", toolName: "docs:search" },
        { type: "mustNotIncludeTool", toolName: "shell:exec" },
        { type: "maxSteps", max: 2 },
      ]);
      expect.unreachable("should throw");
    } catch (err) {
      const e = err as TrajectoryAssertionError;
      expect(e.violations.length).toBeGreaterThanOrEqual(3);
    }
  });
});
