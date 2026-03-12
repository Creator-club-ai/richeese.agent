# Source Intake Playbook

This document defines how a raw source becomes a reviewed content plan.

## Intake Types

- `youtube`
- `web`
- `document`
- `bundle`

## Rule

If one raw source can branch into multiple content directions, start in `sources/`.

Do not create a project until:

- `planning.md` exists
- the owner has reviewed it
- the source has a selected `mainCandidateId` and any relevant `standaloneCandidateIds`
- the actual spawn queue is written into `approvedCandidateIds`

## Done Criteria For `planning.md`

- the core thesis is clear
- the main card angle is clear
- slide-level subtopics are separated from standalone-worthy subtopics
- every viable candidate has a slide count and slide flow
- ready / hold / reject status is visible
- the owner can approve without asking for another planning pass

## Required Sections

- `Source Snapshot`
- `Core Theme`
- `Main Topic`
- `Packaging Map`
- `Candidate Scoreboard`
- `Candidate Plans`
- `Recommended Route`
- `Approval Guide`

## Approval Behavior

- `mainCandidateId` is the main card decision
- `standaloneCandidateIds` is the follow-up idea set
- `approvedCandidateIds` is the source of truth for what gets spawned now
- `status: approved` is required before spawn
- `status: spawned` means child projects were already created
- owner review on `planning.md` is the only default human approval gate
- after spawn, downstream movement should happen through specialized agents, not another planning round

## Source Quality Rules

- Facts, numbers, and policy claims should rely on strong sources where possible.
- If a YouTube or audio source does not have a usable transcript, mark confidence low and block downstream spawning.
- If the transcript angle and the raw title disagree, follow the transcript, not the thumbnail/title packaging.
- If the active brand is `richesse-club`, do not treat transcript extraction as the final plan. Use transcript -> raw insights -> filtered insights -> candidate recommendation.
- For `richesse-club`, raw transcript points should be filtered by `Brand Fit`, `Content Value`, `Novelty`, `Evidence Strength`, and `Slide-worthiness` before they become slide candidates.
- For `richesse-club`, a summary-style carousel should only move forward if at least `5` usable body insights remain after filtering.
- If `richesse-club` usable insights drop below that threshold, either:
  - hold the source
  - convert it into one deeper insight-led card
  - reject the source angle

## Richesse Output Expectation

When the active brand is `richesse-club`, `planning.md` should make the filtering step visible.

Include:

- raw insight volume
- filtered insight volume
- which insights were cut or merged
- whether the source supports a summary-style carousel or only a single deep angle

## Commands

- `npm run validate:sources`
- `npm run spawn:approved -- <source-id>`

## Spawn Output Rule

- spawn should fully seed `slide_plan.md`
- spawn should create `carousel_draft.md` and `handoff_brief.md` as skeletons only
- spawn should not prewrite editor/designer deliverables in full, because that collapses role boundaries
