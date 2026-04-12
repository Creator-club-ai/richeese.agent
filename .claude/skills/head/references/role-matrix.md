# Editorial PDCA Role Matrix

Use this as the operating roster for richesse.club automation.

## Org Chart

```text
Head
├── Research Desk
├── Strategy Desk
├── Copy Desk
├── Risk Desk
├── Design Desk
└── Memory Ops
```

## Role-to-Model Mapping

| Role | Responsibility | Default model | Default reasoning | Escalate when | Notes |
|---|---|---|---|---|---|
| Head | final route, final angle, final quality bar | `gpt-5.4` | `high` | use `xhigh` for ambiguous or high-stakes judgment | the head owns the final call |
| Research Desk | morning-brew, source-intake, source packet | `gpt-5.4` + `gpt-5.4-mini` | `high` for synthesis, `medium/high` for extraction | source conflict, messy interview/transcript, multi-source contradiction | let mini handle extraction, not final thesis |
| Strategy Desk | working title, core thesis, save reason, structure | `gpt-5.4` | `high` | `xhigh` if 2+ plausible directions compete | do not delegate final angle to mini |
| Angle Miner A | save-value-biased alternative angle | `gpt-5.4` | `high` | rarely | sidecar only |
| Angle Miner B | brand-distinctiveness-biased alternative angle | `gpt-5.4` | `high` | rarely | sidecar only |
| Copy Desk | write slide headline/body | `gpt-5.4` | `high` | `xhigh` only for very compressed, hard-to-land copy | headline quality matters more than volume |
| Copy Critic | attack hook, genericity, flatness | `gpt-5.4-mini` | `medium` | switch to `gpt-5.4 high` if the draft feels deceptively polished | ideal cheap adversarial checker |
| Risk Desk | isolate unsupported numbers, quotes, strong claims | `gpt-5.4` | `high` | `xhigh` if the whole card hangs on a fragile claim | mini may pre-extract claims, but final audit stays on full model |
| Design Desk | design notes, hierarchy, pacing, visual direction | `gpt-5.4` | `high` | `xhigh` when brand tension is subtle | avoid mini-only design judgment |
| Memory Ops | snapshot, refresh, pattern summaries | `gpt-5.4-mini` | `medium` | use `gpt-5.4 high` for monthly synthesis or contradictory pattern interpretation | mostly script-first |

## Simple Task Routing

Use mini-first for these:

- "frontmatter 정리해줘"
- "이 카드 태그만 붙여줘"
- "메모리 refresh 해줘"
- "슬라이드 구조만 뽑아줘"
- "source packet을 10줄로 압축해줘"
- "이미 승인된 카피를 문장만 다듬어줘"

Use full model first for these:

- "이 소스로 어떤 각도가 제일 좋을까"
- "이거 richesse.club에 맞아?"
- "왜 자꾸 이 포스트가 약해지는지 봐줘"
- "이 draft를 publish-ready로 만들어줘"
- "이건 planner로 돌아가야 해, editor로 가야 해?"

## Spawn Rules

### Planning

Spawn `Angle Miner A` and `Angle Miner B` only when:

- the source could support 2개 이상 각도
- the source is good but the save reason is not obvious
- a broad topic needs forced narrowing

Do not spawn angle miners when:

- the user already fixed the angle explicitly
- the source is too weak anyway
- the post is a simple revision of an existing approved card

### Copy Review

Spawn `Copy Critic` when:

- the draft is long
- the hook feels soft
- the structure is technically correct but may be generic

Spawn `Risk Desk` when:

- there are numbers, market claims, quotes, or strong causal language
- the source is a transcript or a secondary summary
- the copy sounds stronger than the evidence

### Design Review

Use `Design Desk` when:

- moving into `final_report.md`
- converting a dense, storage-first post into visual pacing
- there is tension between elegance and scanability

## Easy Call Language

Treat these user phrases as role invocations:

- `헤드가 해줘` / `head가 해줘` → full orchestration with head ownership
- `리서치 데스크 돌려줘` → research desk first
- `전략 데스크에서 각도 잡아줘` → strategy desk
- `카피 데스크로 넘겨줘` → copy desk
- `리스크 데스크로 검토해줘` → risk desk
- `디자인 데스크로 handoff 해줘` → design desk
- `메모리 ops refresh 해줘` → memory ops

These are interface labels, not independent authorities.
