## EVAL DEFINITION: core-pipeline

Covers the main-process pipeline from session JSONL to timeline chunks: `SessionParser`, `MessageClassifier` and `ChunkBuilder`.

### Capability Evals

1. A real user message (`isMeta: false`) starts a new `UserChunk`; internal messages (`isMeta: true`) never do.
2. Consecutive assistant messages collapse into one `AIChunk` with their tool executions and spawned subagents attached.
3. A `Task` tool_use whose subagent is resolved is filtered from the chunk; an orphaned `Task` call with no matching subagent is kept visible.
4. A compaction event produces a `CompactChunk` and resets accumulated context injections for the next phase.
5. Teammate messages (`<teammate-message ...>`) are excluded from `UserChunk`s and surfaced as teammate items.

### Regression Evals

1. `pnpm test:chunks` passes.
2. `pnpm test:semantic` passes.
3. `pnpm test:noise` passes.
4. `pnpm test:task-filtering` passes.
5. `pnpm test` passes on the full suite.

### Grader

- Regression: code-based, vitest exit code.
- Capability: code-based. Each capability must be covered by at least one test under `test/main/services/analysis/` or `test/main/services/parsing/`. A capability with no test is a FAIL.

### Success Metrics

- `pass^3 = 100%` for regression evals (three consecutive clean runs).
- `pass@1 = 100%` for capability evals; a change that breaks any capability is not mergeable.
