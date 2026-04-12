# Editorial PDCA Decision Table

This table is the runtime routing contract for richesse.club automation.

Operationally, this system behaves closer to `PDSA` than classic `PDCA`.

- `Plan` = source packet + angle design
- `Do` = writing or handoff production
- `Study` = evidence-based review, not just a generic check
- `Act` = route to the right repair phase and update memory

The public workflow label may stay `pdca` or `pdsa` for command compatibility, but the real orchestrator is `head`.

## 1. Head Escalation Table

| Situation | Head model | Reasoning | Why |
|---|---|---|---|
| clean source, clear angle, low risk | `gpt-5.4` | `high` | normal orchestration |
| 2+ plausible angles compete | `gpt-5.4` | `xhigh` | final angle choice is expensive to get wrong |
| source packet contradicts memory or brand guide | `gpt-5.4` | `xhigh` | policy conflict |
| route back phase is unclear | `gpt-5.4` | `xhigh` | wrong loop wastes time |
| final draft feels polished but generic | `gpt-5.4` | `xhigh` | adversarial approval |

## 2. Mini-Only Table

Use `gpt-5.4-mini medium` without escalation for:

| Task | Allowed to finish alone? | Notes |
|---|---|---|
| frontmatter normalization | yes | admin only |
| tag suggestion | yes | no final brand judgment |
| memory snapshot summary | yes | script-first |
| transcript section split | yes | extraction only |
| section heading extraction | yes | extraction only |
| card metadata cleanup | yes | no direction change |
| approved copy line edits with no thesis change | yes | only when angle is locked |

Use `gpt-5.4-mini high` for:

| Task | Allowed to finish alone? | Notes |
|---|---|---|
| source packet compression | yes | if source thesis is already obvious |
| old card pattern scan | yes | memory support task |
| cheap adversarial scan of a draft | no | hand back to head |
| claim extraction for risk review | no | hand back to Risk Desk |

## 3. Source-Intake Table

| Signal | Action | Model |
|---|---|---|
| single clean article with explicit thesis | proceed normally | `gpt-5.4 high` |
| long transcript or messy interview | mini extracts chapters, full model synthesizes thesis | `mini high` + `gpt-5.4 high` |
| multiple sources disagree on numbers or framing | escalate thesis and risk assessment | `gpt-5.4 xhigh` |
| source strength < 0.55 | stop and report weakness | `gpt-5.4 high` |
| fact risk > 0.40 | repair once or stop | `gpt-5.4 high` |

## 4. Angle-Miner Spawn Table

Spawn both `Angle Miner A` and `Angle Miner B` when any 2 of these are true:

- the source supports multiple strong angles
- the topic is broad
- the save reason is not obvious
- the source is strong but familiar
- the user asked for "best angle", "각도", "방향", or equivalent

Do not spawn angle miners when any of these are true:

- the user explicitly fixed the angle
- this is only a revision of an approved card
- the source is too weak anyway
- the content is a direct continuation of a previous card

Default:

- `Angle Miner A` = `gpt-5.4 high`
- `Angle Miner B` = `gpt-5.4 high`
- Head chooses 1 direction = `gpt-5.4 high/xhigh`

## 5. Copy-Critic Spawn Table

Spawn `Copy Critic` when any 1 is true:

- cover hook is abstract
- cover hook explains too much instead of landing hard
- more than 3 slides read like paraphrases
- the draft exceeds the natural density of the format
- the draft is structurally correct but emotionally flat
- the topic is common enough that genericity risk is high

Default:

- first pass = `gpt-5.4-mini medium`
- escalate to `gpt-5.4 high` if the mini pass says "technically fine but probably generic"

## 6. Risk-Desk Spawn Table

Spawn `Risk Desk` when any 1 is true:

- card contains numbers
- card contains named quotes
- card makes market-size or causal claims
- the source is a transcript, not a primary written article
- the copy sounds stronger than the documented evidence

Default:

- extraction support = `gpt-5.4-mini high`
- final risk verdict = `gpt-5.4 high`
- escalate to `xhigh` when the card's main hook depends on one fragile claim

## 7. Design-Desk Escalation Table

| Situation | Model | Reasoning |
|---|---|---|
| normal final handoff | `gpt-5.4` | `high` |
| storage-first post with dense info | `gpt-5.4` | `high` |
| subtle tension between calm luxury and scanability | `gpt-5.4` | `xhigh` |
| decorative direction is likely to dilute the angle | `gpt-5.4` | `xhigh` |

Do not use mini-only design judgment.
This table applies only when design handoff is explicitly requested.

## 8. Route-Back Table

| Failure tag | Route |
|---|---|
| `weak-source` | `source-intake` |
| `fact-risk-critical` | `source-intake` |
| `too-broad` | `content-planner` |
| `too-generic` | `content-planner` |
| `weak-save-value` | `content-planner` |
| `hook-weak` | `editor` |
| `cover-overexplained` | `editor` |
| `body-flat` | `editor` |
| `too-wordy` | `editor` |
| `visual-mismatch` | `designer` |
| `hierarchy-weak` | `designer` |
| `pacing-issue` | `designer` |

## 9. Concurrency Budget

Keep the system lean.

- planning: max 2 sidecars
- copy review: max 2 sidecars
- design review: max 1 sidecar
- never spawn more than 3 sidecars total for a single pass

If more than 3 specialized concerns appear, the head should serialize them rather than fan out further.

## 10. Runtime Preference

When both runtimes are available:

- `Codex` is the primary runtime for full-cycle orchestration
- `Claude` is a wrapper or convenience interface
- if the task looks token-heavy or review-heavy, prefer Codex immediately
