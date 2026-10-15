# ADR-0001: Record architecture decisions

- Status: Accepted
- Date: 2026-10-14

## Context

The project's structural conventions live in `CLAUDE.md` and `.claude/rules/`. Those files describe the current state but not why it is that way. When a decision is revisited, the original reasoning is lost and has to be reconstructed from git history or guessed.

## Decision

Record significant architecture decisions as numbered Markdown files under `docs/adr/`, following the lightweight format popularised by Michael Nygard: Context, Decision, Consequences.

"Significant" means a decision that affects structure, dependencies, data flow or a convention that other code must follow. Routine bug fixes and local refactors do not get an ADR.

## Consequences

- Reasoning behind structural choices is checked in next to the code and survives contributor turnover.
- `CLAUDE.md` stays a description of the current state and can link to ADRs for rationale.
- Writing an ADR adds a small amount of friction to structural changes. That is intended.
