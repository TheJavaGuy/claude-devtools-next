# Evals

Eval definitions for claude-devtools, following the ECC `eval-harness` format.

Each file defines the capability and regression checks for a feature area and how they are graded. Regression evals map onto the existing vitest suites under `test/`, so they are code-graded and must pass every run (`pass^k = 100%`). Capability evals describe behaviour an agent must be able to add or change and are graded by running the referenced commands.

## Files

| File | Scope |
|------|-------|
| `core-pipeline.md` | JSONL parsing, message classification and chunk building |

## Running

```bash
pnpm test                 # all regression evals
pnpm test:chunks          # chunk building
pnpm test:semantic        # semantic step extraction
pnpm test:noise           # noise filtering
pnpm test:task-filtering  # Task tool / subagent filtering
```
