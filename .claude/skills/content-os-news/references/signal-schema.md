# Signal Schema

A signal is a candidate, not evidence.

Required fields:

- `title`
- `url`
- `source`
- `type`
- `summary`
- `why_it_matters`
- `source_strength`
- `risks_or_gaps`
- `recommendation`

Recommended source types:

- `rss`
- `google_news`
- `youtube`
- `x`
- `threads`
- `naver`
- `manual`

Recommendation values:

- `send to content-os-research`
- `skip`

Boundary:

- A shortlist is not a research packet.
- One selected signal still needs `content-os-research`.
