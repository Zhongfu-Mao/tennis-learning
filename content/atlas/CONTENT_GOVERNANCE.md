# Atlas Content Governance

Every knowledge card must pass:

1. Inventory
2. Fact Check
3. Fit Check
4. Rewrite
5. Visual Brief
6. Ship

## Inventory

Treat old app content, personal notes, and training observations as source material only. Do not copy old content into the atlas as finished knowledge.

## Fact Check

Cards must be grounded in verified tennis knowledge, direct training evidence, or clearly marked personal observation. Anything uncertain stays out of default learning paths until reviewed.

Before a card can use `verificationStatus: "verified"`, it must have an auditable evidence record in the card pack or in a companion evidence ledger for that pack. The record must include:

- Evidence type: verified tennis source, repeated personal training observation, coach feedback, or source synthesis.
- Source title or observation title.
- Source URL, local note path, or training observation date.
- Verification note explaining what claim the evidence supports.
- Reviewer and review date.

If the evidence is only a one-off personal observation, keep the card at `personal-note` until it is rewritten against a verified source or a repeated training pattern.

## Fit Check

Each card must fit the Hybrid Knowledge Atlas model:

- Topic map placement
- Progression lens
- VR-first practice conversion
- Real-court validation when useful
- Review prompt
- Generated image brief

## Rewrite

Rewrite source material into the card schema. Avoid abrupt imported fragments, generic AI-list phrasing, or content that does not connect to the user's progression path.

## Visual Brief

Generated teaching images are bitmap assets in `public/assets/knowledge/`.

Manifest paths must use served URLs such as `/assets/knowledge/example.png`, not filesystem paths such as `public/assets/knowledge/example.png`.

Do not use SVG as instructional artwork for knowledge cards.

The selected image direction is:

- Candidate A as the main premium sports field-guide base.
- Candidate B's premium training still texture and physical immediacy.
- Scene-specific adjustment: calmer for conceptual cards, more dynamic for VR/practice cards, more restrained for tactical reference cards.

## Ship

Default learning paths may include only `verified` cards.

Production image manifest entries may move to `approved` only after the referenced bitmap file exists and has passed visual review.
