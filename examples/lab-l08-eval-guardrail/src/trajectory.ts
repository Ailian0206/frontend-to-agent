/** One step in an agent run trace (offline eval; no live LLM). */
export type AgentStep = {
  kind: "tool" | "message" | "think";
  /** Present when kind is "tool". */
  toolName?: string;
  /** Optional short label for assertions / logs. */
  label?: string;
};

export type MustIncludeToolRule = {
  type: "mustIncludeTool";
  toolName: string;
};

export type MustNotIncludeToolRule = {
  type: "mustNotIncludeTool";
  toolName: string;
};

export type MaxStepsRule = {
  type: "maxSteps";
  max: number;
};

export type TrajectoryRule =
  | MustIncludeToolRule
  | MustNotIncludeToolRule
  | MaxStepsRule;

export class TrajectoryAssertionError extends Error {
  readonly violations: readonly string[];

  constructor(violations: string[]) {
    super(violations.join("; "));
    this.name = "TrajectoryAssertionError";
    this.violations = violations;
  }
}

function toolNamesInTrajectory(steps: readonly AgentStep[]): string[] {
  const names: string[] = [];
  for (const step of steps) {
    if (step.kind === "tool" && step.toolName) {
      names.push(step.toolName);
    }
  }
  return names;
}

/**
 * Asserts that an agent trajectory satisfies eval rules (S10 trajectory checks).
 * Throws TrajectoryAssertionError when any rule fails.
 */
export function assertTrajectory(
  actual: readonly AgentStep[],
  expectedRules: readonly TrajectoryRule[],
): void {
  const violations: string[] = [];
  const tools = toolNamesInTrajectory(actual);

  for (const rule of expectedRules) {
    switch (rule.type) {
      case "mustIncludeTool": {
        if (!tools.includes(rule.toolName)) {
          violations.push(
            `mustIncludeTool: expected tool "${rule.toolName}" in trajectory`,
          );
        }
        break;
      }
      case "mustNotIncludeTool": {
        if (tools.includes(rule.toolName)) {
          violations.push(
            `mustNotIncludeTool: tool "${rule.toolName}" must not appear`,
          );
        }
        break;
      }
      case "maxSteps": {
        if (actual.length > rule.max) {
          violations.push(
            `maxSteps: ${actual.length} steps exceeds max ${rule.max}`,
          );
        }
        break;
      }
      default: {
        const _exhaustive: never = rule;
        void _exhaustive;
      }
    }
  }

  if (violations.length > 0) {
    throw new TrajectoryAssertionError(violations);
  }
}
