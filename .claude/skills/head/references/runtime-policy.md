# Runtime Policy

The system should be built `Codex-first`, with Claude as a thin wrapper.

## Principle

- heavy orchestration, long context, and sub-agent delegation should happen in Codex first
- Claude commands are convenience interfaces, not the source of truth
- the source of truth is the repo skill + script + Obsidian memory stack

## Why

Codex is the better primary runtime when:

- token budget is larger
- sub-agent delegation is available and cheap enough to use often
- the workflow benefits from longer memory snapshots and multi-pass review

Claude is still useful for:

- quick command-style invocation
- lightweight manual editing
- later plugin packaging for familiar UX

## Build Rule

When adding automation:

1. put the logic in `SKILL.md`, references, and scripts first
2. keep state in Obsidian and repo files
3. add Claude commands only as wrappers
4. if needed later, package the same assets as a Claude plugin

Do not make core logic depend on Claude-only slash commands.

## Practical Interpretation

- `head` is the real runtime contract
- `pdca` and `pdsa` are command aliases, not separate runtimes
- `.claude/commands/*.md` are interface sugar
- `scripts/editorial_memory.py` is shared infrastructure
- future plugin work should bundle what already works in Codex, not invent a second workflow
