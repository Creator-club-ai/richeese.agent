@# richesse.club Content OS PRD

## 1. Document Info

- Product Name: richesse.club Content OS
- Product Type: Electron desktop app
- Primary Operator: brand owner / editorial lead
- Core Runtime: Claude Code
- Design Execution Layer: Figma MCP
- Status: MVP PRD

## 2. Product Summary

`richesse.club Content OS` is a desktop workflow tool for turning raw sources into brand-fit editorial content and then into design handoff and Figma execution.

The product is not a generic AI content dashboard. It is an editorial operating system built for `richesse.club`, with strong human approval at each step.

The workflow is:

1. collect sources
2. shortlist and approve a source
3. generate brand-fit content directions
4. approve one direction
5. generate `final_report.md`
6. send the approved handoff into Figma MCP for design work

The product must preserve judgment, selectivity, and calm editorial pacing over blind automation.

## 3. Problem

The current workflow has three recurring problems:

1. Good source material is scattered across news, articles, and ad hoc URLs.
2. Even when a source is strong, translating it into a `richesse.club` angle takes manual editorial judgment every time.
3. Planning and design handoff are disconnected, which slows execution and introduces inconsistency.

The user wants one system that makes source selection, content planning, and design handoff feel like a single operating flow without losing creative control.

## 4. Goals

- Surface brand-fit news or source material quickly.
- Let the user review and choose sources inside a visual workflow.
- Convert approved sources into strong `richesse.club` content directions.
- Force editorial classification using `Category / Format / User Value / Depth / Timing`.
- Generate a single approved handoff document as `final_report.md`.
- Connect the approved handoff to Figma MCP for design execution.
- Keep the flow human-in-the-loop with explicit approval buttons.

## 5. Non-Goals

- Full autonomous content generation without approval
- Social publishing automation
- Generic RSS reader behavior
- General-purpose team project management
- Fully automatic Figma design without human review
- Large process overhead with many intermediate files

## 6. Brand Operating Rules

The product must reflect the editorial logic of `richesse.club`.

- Wealth is broader than finance.
- The brand covers people, places, taste, business, money, and culture.
- The tone must feel refined, selective, calm, and editorial.
- The system must reject weak, generic, self-help-heavy, or off-brand content directions.
- Strong topic selection matters more than speed.
- One sharp angle is better than one broad weak carousel.
- The system should say clearly when a source is weak instead of forcing output.

Every approved content direction must be classified as:

- Category
- Format
- User Value
- Depth
- Timing

## 7. Target User

### Primary User

- founder-operator of `richesse.club`
- editorial lead making topic, angle, and approval decisions

### Secondary User

- designer receiving the approved handoff
- collaborator reviewing source candidates or planning directions

## 8. Jobs To Be Done

- When I do not know what to post, I want the system to surface brand-fit sources so I can choose quickly.
- When I have a source URL, I want the system to extract the strongest usable angles so I do not have to manually reframe everything from scratch.
- When I approve a direction, I want a clean handoff document so the design stage starts with clarity.
- When I move into design, I want to push the approved brief into Figma MCP without rebuilding context.

## 9. Core Workflow

### Stage 1. Source Intake

The system supports two entry modes.

#### A. News Curation

The app collects recent news, articles, and signals that may fit the brand.

Each source candidate should display:

- headline
- source
- publish date
- short summary
- why it may matter for `richesse.club`
- editorial potential score
- suggested `Category / Format / User Value / Depth / Timing`

User actions:

- shortlist
- discard
- save for later
- open source
- compare
- approve source

#### B. Direct Source URL Input

The user can paste one or more URLs.

The system should:

- extract the main signal
- summarize the useful angle
- identify possible editorial hooks
- flag limitations
- clearly say when the source is weak

### Stage 2. Content Planning

After a source is approved, the system generates 3 to 5 candidate content directions.

Each direction must include:

- Topic
- Category
- Format
- User Value
- Depth
- Timing
- Core Angle
- Why Now
- Slide Outline
- Risks or Source Limits

User actions:

- approve direction
- reject direction
- regenerate
- request sharper angle
- request more save-worthy options
- request more brand-led options
- merge ideas
- edit fields inline

### Stage 3. Handoff Generation

Once a direction is approved, the system generates one default handoff file:

- `final_report.md`

No unnecessary planning files should be created by default.

`final_report.md` must contain:

- Topic
- Category
- Format
- User Value
- Depth
- Timing
- Core Angle
- Why Now
- Slide Outline
- Design Notes
- Risks or Source Limits

### Stage 4. Figma MCP Design Execution

The approved handoff is used as the design brief for Figma MCP actions.

Supported design-stage actions:

- Generate Cover
- Generate Full Carousel Layout
- Revise Selected Slide
- Push to Figma
- Open Figma File

The user must explicitly review and trigger these actions.

## 10. UX Principles

- Human approval is mandatory at every major transition.
- The interface should feel operational, not cluttered.
- The app should privilege clear decision-making over decorative UI.
- The UX should feel selective and calm, not like a noisy dashboard.
- Information density should increase only where necessary.

## 11. Main Screens

### 1. Dashboard

Purpose:

- entry point for new and ongoing projects

Must include:

- create project
- start from news curation
- start from source URL
- recent projects
- recent approved topics

### 2. Source Review

Purpose:

- review curated news or submitted URLs

Must include:

- card-based source list
- source preview panel
- filters
- shortlist area
- approve-to-next-step action

### 3. Planning

Purpose:

- generate and compare candidate content directions

Must include:

- source summary
- direction cards
- selected direction detail
- inline field editing
- approve direction action

### 4. Handoff

Purpose:

- review and finalize `final_report.md`

Must include:

- markdown preview
- editable sections
- save/export
- send to Figma MCP

### 5. Design

Purpose:

- trigger and review Figma MCP actions

Must include:

- Figma MCP connection status
- design action controls
- generation history
- revision actions
- open in Figma

## 12. Human-in-the-Loop Rules

The following transitions must require explicit approval:

- source shortlist to selected source
- selected source to planning generation
- planning options to approved direction
- approved direction to `final_report.md`
- handoff to Figma MCP execution

The app must always expose:

- Next
- Back
- Approve
- Reject
- Regenerate
- Edit Manually
- Save Draft

## 13. Functional Requirements

### FR-1 Source Intake

- The system must allow project creation from curated news or direct URL input.
- The system must store the raw source and extracted summary.
- The system must support multiple source candidates per project.

### FR-2 Source Review

- The system must render source candidates as reviewable cards.
- The system must support shortlist, discard, and approve actions.
- The system must persist review state locally.

### FR-3 Brand-Fit Planning

- The system must generate multiple candidate directions from an approved source.
- The system must classify each direction using the five required editorial fields.
- The system must allow inline manual edits before approval.

### FR-4 Handoff File Generation

- The system must generate `final_report.md` only after direction approval.
- The system must use the approved direction as source-of-truth.
- The handoff file must be editable before design execution.

### FR-5 Figma MCP Integration

- The system must show whether Figma MCP is connected.
- The system must allow user-triggered design actions from the handoff stage.
- The system must not silently fail if Figma MCP is unavailable.

### FR-6 Project Persistence

- The system must store project state locally.
- The system must restore unfinished sessions.
- The system must preserve approval history per project.

## 14. Non-Functional Requirements

- Desktop-first workflow
- Fast screen-to-screen response for local state changes
- Clear failure states
- Recoverable drafts
- Modular architecture
- Minimal file noise
- Predictable user flow

## 15. Editorial Classification Model

Every approved direction must use the following editorial schema.

### Category

- Places
- Taste
- Business
- Money
- People
- Culture

### Format

- 큐레이션형
- 스팟 소개형
- 정리형
- 비교형
- 입문형
- 리스트형
- 케이스형
- 인사이트형
- 해설형

### User Value

- 저장형
- 공유형
- 공감형
- 정보형
- 브랜딩형

### Depth

- Light
- Medium
- Deep

### Timing

- Now
- Evergreen
- Seasonal

## 16. `final_report.md` Specification

The default handoff file must use this structure:

- Topic
- Category
- Format
- User Value
- Depth
- Timing
- Core Angle
- Why Now
- Slide Outline
- Design Notes
- Risks or Source Limits

Inside `Design Notes`, the system must include:

- Canvas
- Visual Mood
- Cover Direction
- Typography
- Layout Rhythm
- Color / Material / Image Direction
- Production Workflow
- Do Not Use
- Reference Search Keywords

Default design guidance:

- Canvas: `1080 x 1440`
- Headline serif: `BookkMyungjo`
- Body / utility sans: `Pretendard`
- Base background: `#14110f`
- Base text: `white`

The design language should be restrained editorial, selective, calm, and polished.

## 17. High-Level System Architecture

### App Layer

- Electron shell
- React-based UI
- local routing between workflow stages

### State Layer

- project store
- approval state store
- source and planning state store

### Service Layer

- source ingestion service
- summarization and extraction service
- planning generation service
- markdown export service
- Figma MCP integration service

### Storage Layer

- local project persistence
- project metadata
- generated handoff files

## 18. Core Data Entities

### Project

- id
- title
- createdAt
- updatedAt
- currentStage
- status

### SourceItem

- id
- projectId
- type
- url
- title
- source
- publishedAt
- summary
- brandRelevanceNote
- editorialPotentialScore
- classificationSuggestion
- reviewStatus

### ContentDirection

- id
- projectId
- sourceId
- topic
- category
- format
- userValue
- depth
- timing
- coreAngle
- whyNow
- slideOutline
- risks
- approvalStatus

### HandoffDocument

- id
- projectId
- path
- generatedAt
- version
- figmaStatus

## 19. State Machine

- `draft`
- `sources_collected`
- `source_selected`
- `directions_generated`
- `direction_approved`
- `handoff_ready`
- `figma_in_progress`
- `design_review`
- `done`

Transition rules:

- `draft` to `sources_collected` requires at least one source
- `sources_collected` to `source_selected` requires one approved source
- `source_selected` to `directions_generated` requires user-triggered generation
- `directions_generated` to `direction_approved` requires one approved direction
- `direction_approved` to `handoff_ready` requires `final_report.md` generation
- `handoff_ready` to `figma_in_progress` requires explicit Figma action

## 20. MVP Scope

Included in MVP:

- Electron desktop app shell
- project dashboard
- source intake via news curation and URL input
- source review UI
- content planning UI
- approval state handling
- `final_report.md` generation
- Figma MCP connection status and action hooks
- local persistence

Excluded from MVP:

- publishing to social platforms
- multi-user collaboration
- analytics dashboard
- automated trend prediction
- mobile app

## 21. Success Metrics

- percent of projects that reach approved direction
- average time from source intake to approved direction
- rate of discarded sources
- rate of regenerated planning rounds
- percent of approved directions converted into `final_report.md`
- percent of handoff documents sent to Figma MCP

## 22. Risks

- weak source quality may produce shallow content directions
- over-automation may damage brand quality
- UI may become too dashboard-like if information density is not controlled
- Figma MCP availability may create workflow dependency risk
- insufficient editorial feedback controls may reduce trust

## 23. Open Questions

- what exact news ingestion method should be used in MVP
- whether source ranking should be rule-based, prompt-based, or hybrid
- how much of the planning engine should be editable through templates
- whether Figma MCP actions should generate one slide at a time or full layout first
- whether `final_report.md` should version automatically

## 24. Build Priority

### Priority 1

- project shell
- dashboard
- source intake
- source review
- planning flow
- approval state

### Priority 2

- `final_report.md` generation
- handoff preview and editing
- local persistence polish

### Priority 3

- Figma MCP action layer
- design revision history
- quality-of-life improvements

