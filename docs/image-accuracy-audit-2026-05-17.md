# Atlas knowledge image accuracy audit - 2026-05-17

This audit checks the 30 current Atlas knowledge-card images for tennis accuracy, not visual polish. All images are still `candidate` assets, so failures here should block final acceptance.

## Sources checked

- USTA Friend at Court / Rules of Tennis, 2026: court dimensions, singles vs doubles lines, service rules, service-box geometry, foot-fault boundaries.
  - https://www.usta.com/content/dam/usta/coach-organize/content-fragments/resource-library/assets/pdfs/friend-at-court.pdf
- USTA Serving Rules: server must start behind the baseline and serve diagonally into the opposite service box.
  - https://www.usta.com/en/home/improve/tips-and-instruction/national/tennis-serving-rules.html
- USTA forehand basics: groundstroke mechanics should keep contact/weight transfer understandable and should not imply arm-only swings.
  - https://www.usta.com/en/home/improve/tips-and-instruction/national/learning-the-basics--forehand.html
- USTA backhand slice tip: slice should be shown as a controlled high-to-level/through path that produces a lower skid, not a chop with random downward arrows.
  - https://www.usta.com/en/home/improve/tips-and-instruction/national/improve-your-tennis-game--tips-for-improving-your-backhand-slice.html
- ITF glossary: terminology baseline for serve, rally, topspin, backspin/slice, singles, doubles.
  - https://www.itftennis.com/en/about-us/organisation/tennis-glossary/

## Acceptance guardrails

- Default to singles unless the card explicitly teaches doubles. Doubles alleys may be visible, but green success targets must stay inside singles lines.
- Serve images must show a legal server: behind the baseline, between center mark and the relevant singles sideline extension for singles play, no foot crossing or touching the baseline before contact.
- Serve targets must be the diagonally opposite service box, not the wrong box, not no-man's-land, not the doubles alley.
- Racket path and ball flight path must be visually distinct. A small local racket path can explain swing shape; the ball trajectory is a separate post-contact path.
- Spin images must separate what the racket does from what the ball does. Topspin should show forward/top rotation and a safe arc that lands in court; slice/backspin should show controlled through-contact and a lower skid after bounce.
- Tactical target plates must match the lesson text. "Deep middle" means deep central third, not the whole opponent court; "cross-court" means inside singles cross-court target, not doubles alley.
- Arrows must represent one specific thing. If an arrow does not map to footwork, racket path, ball path, recovery direction, or target choice, remove it.
- Abstract progression images may be metaphorical, but they still cannot invert the card meaning.

## Severity scale

- `BLOCKER`: teaches illegal play or a wrong core concept; must regenerate before use.
- `MAJOR`: concept is partly right but has a misleading mechanic, target, timing, or court-line issue.
- `MINOR`: mostly accurate; needs clarity or crop/prompt tightening.
- `OK`: acceptable for a candidate image, subject to normal visual polish.

## Per-image audit

| # | Card | Image | Severity | Accuracy finding | Required correction |
|---:|---|---|---|---|---|
| 1 | `progression.review-funnel` | `progression-review-funnel-v1.png` | `BLOCKER` | The image radiates many balls outward from one origin. The card says review should converge many observations into one main problem, so the diagram currently says the opposite. | Regenerate as many small evidence dots/notes narrowing into one green focus target. No outward spray. |
| 2 | `progression.levels-ladder` | `progression-levels-ladder-v1.png` | `OK` | Abstract ladder from scattered orange balls to tighter green cluster matches "upgrade = stability", and it does not teach a specific court mechanic. | Keep concept. Optional: make ladder less literal if visual polish is revisited. |
| 3 | `progression.practice-bridge` | `progression-practice-bridge-v1.png` | `MINOR` | Drill-to-match bridge is semantically acceptable, but the green target spans a broad deep zone and the orange intermediate zones may imply a literal progression path across the court. | Keep as abstract metaphor or make it explicitly a drill-to-point-play bridge with separated practice lane and match court. |
| 4 | `progression.three-rooms` | `progression-three-rooms-v1.png` | `MAJOR` | The image uses four players and court-zone overlays in a way that reads like doubles/live tactics, not "technique class / rally / match are different contexts." | Regenerate as three distinct training contexts or three panels, not a single confusing court with multiple players. |
| 5 | `serve.toss-window` | `serve-toss-window-v2.png` | `OK` | The crop avoids foot-fault ambiguity and focuses on repeated toss window. No major rule issue visible. | Keep. In future, avoid adding baseline/feet unless legal stance is explicit. |
| 6 | `serve.first-second-plan` | `serve-first-second-plan-v1.png` | `MINOR` | Server appears roughly behind the baseline and target is a service box, but the diagonal side is visually ambiguous and the court is full doubles-lined. | Keep as candidate, but next version should mark singles service geometry more cleanly: legal stance behind baseline and a clear diagonal service-box target. |
| 7 | `serve.second-serve-spin` | `serve-second-serve-spin-v1.png` | `BLOCKER` | This does not look like a legal serve. The player is effectively inside the court/near the service line, not clearly behind the baseline, and the action is an underhand/groundstroke-like contact rather than a serve. It also makes the second-serve target hard to verify. | Regenerate from a side or overhead view with server behind baseline, toss/contact overhead, ball clearing net with margin, landing in the diagonally opposite service box, and no baseline foot contact. |
| 8 | `return.depth-first` | `return-depth-first-v1.png` | `MAJOR` | Green deep return concept is close, but the orange "bad" route lands at/near doubles alley/outside singles, while the green target is very broad. It teaches "avoid an out ball" more than "prefer deep middle." | Regenerate with singles boundaries emphasized; green target deep central third, orange low-percentage sideline target inside singles but small and risky. |
| 9 | `return.split-on-toss` | `return-split-on-toss-v1.png` | `MAJOR` | The card title/image emphasize split on toss, but the accurate timing is to land around opponent contact, using toss/forward swing as cues. The current image can teach splitting too early. | Rename/retune content to "split timed to server contact" or regenerate showing receiver landing as server contacts the ball, with toss only as a preparatory cue. |
| 10 | `spacing.split-timing` | `split-timing-field-guide-v1.png` | `BLOCKER` | The image shows the player airborne with big directional arrows, contradicting "Split is not a jump; land ready to move." It risks teaching a jump-for-height instead of a timing preload. | Regenerate at the landing moment: both feet just touching down, knees loaded, opponent at contact, small ground-level push-off options after landing. |
| 11 | `spacing.contact-distance` | `contact-distance-comparison-v1.png` | `OK` | Three panels correctly communicate too close / good / too far. The green middle spacing is understandable. | Keep. Optional: add clearer stance consistency across panels in the prompt. |
| 12 | `tactics.deep-middle` | `deep-middle-target-v1.png` | `BLOCKER` | Green target covers almost the whole opponent singles court from service line to baseline. That is not "deep middle"; it includes too much width and too much shallow space. | Regenerate with a green rectangle only in the deep central third, behind the service line and preferably closer to the baseline. Keep amber sideline/corner risk zones inside singles boundaries. |
| 13 | `spacing.recovery-position` | `spacing-recovery-position-v1.png` | `OK` | Recovery target near center after a wide ball is broadly accurate. No obvious rule or mechanics error. | Keep. |
| 14 | `spacing.last-two-steps` | `spacing-last-two-steps-v1.png` | `OK` | Orange lunge vs green adjustment-step sequence communicates distance calibration correctly. | Keep. Optional: make last-two-step footprints more anatomical and less icon-like. |
| 15 | `spacing.recover-from-wide` | `spacing-recover-from-wide-v1.png` | `BLOCKER` | The green ball lands around the short/service-box area, not deep middle. The orange risk route goes into/through doubles-alley geometry. For a "wide recovery" lesson, the safe answer must be high/deep/central enough to buy recovery time. | Regenerate: player stretched wide inside singles sideline, green high defensive ball to deep central third, then recovery arrow back to appropriate recovery position. Bad option can be a low-line attempt inside singles, not doubles alley. |
| 16 | `spacing.stance-choice` | `spacing-stance-choice-v1.png` | `MAJOR` | The image marks one stance as wrong and one as right, but the lesson says open vs closed stance depends on time. Without time/ball-pressure context, it oversimplifies and can teach "closed = correct, open = wrong." | Regenerate as two valid scenarios: open stance under time pressure / wide ball, neutral or closed stance when time and spacing allow. |
| 17 | `spin.topspin` | `spin-topspin-arc-v1.png` | `MAJOR` | The ball trajectory is visually clean, but it can be read as one continuous "racket path + ball path" line from the racket. The target also appears near a wide/back-corner region with doubles lines competing for attention. | Regenerate with separate local low-to-high racket path near contact and separate ball-flight arc after contact. Use singles target clearly inside court, not alley. |
| 18 | `spin.slice` | `spin-slice-skid-v1.png` | `BLOCKER` | The green line and downward arrows imply chopping down through the ball. The orange comparison path is confusing, and the recovery rectangle behind the player has no clear tennis meaning. This matches the user's concern. | Regenerate as controlled high-to-level/through contact with backspin iconography on the ball, one low skid after bounce, no repeated downward arrows, no unexplained recovery box. |
| 19 | `trajectory.net-clearance` | `trajectory-net-clearance-v1.png` | `MINOR` | The "clearance budget" concept is accurate, but the green landing zone appears very wide/deep-corner-ish and doubles lines make the target less clean. | Keep as candidate or regenerate with a central/deep singles target and a floating clearance band that is clearly not a wall. |
| 20 | `ball.bounce-window` | `ball-bounce-window-v1.png` | `OK` | One bounce, rising/peak/dropping contact windows are understandable; no second bounce or impossible path issue. | Keep. |
| 21 | `stroke.unit-turn-early` | `stroke-unit-turn-early-v1.png` | `MINOR` | The green shoulder-turn cue is acceptable, but the left/right comparison lacks enough context and the ball is disconnected from the preparation moment. | Keep as candidate; a better version should show ball approach plus early unit turn before bounce/contact. |
| 22 | `stroke.contact-in-front` | `stroke-contact-in-front-v1.png` | `MINOR` | Front contact is generally communicated, but the three ghost/player positions make it less obvious which contact is ideal without text. | Keep as candidate; next version should make the green contact clearly in front of lead hip/shoulder and amber cases clearly jammed/late or overreaching. |
| 23 | `stroke.low-to-high-shape` | `stroke-low-to-high-shape-v1.png` | `MAJOR` | This repeats the racket-path/ball-path ambiguity: green local swing path and outgoing ball arc visually fuse into one continuous teaching line. It may also imply "brush straight up" rather than forward-through with upward component. | Regenerate with a small local racket-path arrow through contact and a separate ball trajectory after impact. Ball should travel forward with safe arc, not only upward. |
| 24 | `stroke.balance-finish` | `stroke-balance-finish-v1.png` | `OK` | Balanced finish vs falling finish is accurate and useful. | Keep. |
| 25 | `stroke.consistent-prep` | `stroke-consistent-prep-v1.png` | `MAJOR` | The two-row sequence is visually complex and the orange/green meaning is ambiguous. It can be read as two different stroke templates rather than the same preparation rhythm across forehand/backhand. | Regenerate as two clean side-by-side strokes with matching ready/unit-turn timing checkpoints, not a busy multi-frame grid. |
| 26 | `tactics.cross-court` | `tactics-cross-court-v1.png` | `BLOCKER` | The green "correct" cross-court target is in/through the doubles alley area. For singles learning, that is outside the valid singles target and directly violates the singles/doubles guardrail. | Regenerate with the green cross-court target inside the singles sideline, preferably high-percentage deep cross-court with margin. Doubles alley can be visible but not highlighted green. |
| 27 | `tactics.down-the-line-cost` | `tactics-down-the-line-cost-v1.png` | `MAJOR` | The orange risk route lands in/near the doubles alley, while the lesson should compare changing direction down-the-line inside singles with a safer cross-court option. | Regenerate with both good and bad targets inside singles: green cross-court or bigger target; orange smaller down-the-line target near singles sideline with lower margin. |
| 28 | `tactics.midcourt-opportunity` | `tactics-midcourt-opportunity-v1.png` | `MINOR` | The idea of a controlled big target before adding risk is sound. The green zone is broad but acceptable for "yellow light" opportunity-ball restraint. | Keep as candidate; later version can show player actually inside the court attacking a short ball with controlled depth. |
| 29 | `tactics.short-ball-danger` | `tactics-short-ball-danger-v1.png` | `OK` | Short ball inviting attack and deep alternative are understandable. | Keep. |
| 30 | `tactics.pressure-point-play` | `tactics-pressure-point-play-v1.png` | `MINOR` | Big-target pressure-point concept is right, but the green zone is too wide and the orange target again leans into doubles-alley geometry. | Keep only as candidate; next version should keep both targets inside singles and make the green target large but not the entire court. |

## Regeneration priority

1. `BLOCKER` first: 1, 7, 10, 12, 15, 18, 26.
2. High-risk `MAJOR`: 9, 16, 17, 23, 27.
3. Remaining `MAJOR`: 4, 8, 25.
4. `MINOR` cleanup after the rules/mechanics issues are gone.

## 2026-05-17 regeneration pass 1

Accepted into card references as new `v2` candidate assets:

- `serve.second-serve-spin` -> `serve-second-serve-spin-v2.png`: fixes the illegal in-court/underhand-looking serve by showing an overhead legal serve from behind the baseline into the diagonal service box.
- `spacing.split-timing` -> `split-timing-field-guide-v2.png`: fixes the jump cue by showing the receiver low and planted at the split-step landing moment.
- `tactics.deep-middle` -> `deep-middle-target-v2.png`: removes the old whole-court green wash and keeps the target deep/central inside singles.
- `spacing.recover-from-wide` -> `spacing-recover-from-wide-v2.png`: moves the safe defensive ball from short/service-box space to a deep central target and separates recovery footwork from ball flight.
- `spin.slice` -> `spin-slice-skid-v2.png`: removes chop-like downward arrows and shows a separate through-contact cue plus low skid after bounce.

Not accepted yet:

- `tactics.cross-court`: several generated attempts still placed orange or green elements in/near the doubles alley. Keep the existing blocker open until a version clearly places the cross-court target inside singles with visible margin.
- `progression.review-funnel`: generated attempts failed semantically or left the tennis-court visual language. Keep the existing blocker open until the image clearly shows many review observations converging into one focus.

## Prompt rules for the next image batch

- Add this fixed prompt prefix to all tennis-court tactical images:
  - "Singles teaching image. Draw full tennis court lines if needed, but all green targets must be inside singles boundaries. Doubles alleys may be visible only as neutral unhighlighted court markings."
- Add this fixed prompt prefix to all serve images:
  - "Legal singles serve. Server starts behind the baseline, between the center mark and singles sideline extension. Feet do not touch or cross the baseline before contact. Ball is served diagonally into the opposite service box."
- Add this fixed prompt prefix to all spin/stroke images:
  - "Separate the local racket path from the post-contact ball trajectory. Do not draw them as one continuous line. The ball travels forward through the court; the racket path is only a short local cue near contact."
- Add this fixed prompt prefix to all slice images:
  - "Slice/backspin is a controlled through-contact stroke that produces a lower skidding bounce. Do not depict a downward chop. Do not use repeated downward arrows unless they specifically label post-bounce skid, and prefer backspin chevrons on the ball."
