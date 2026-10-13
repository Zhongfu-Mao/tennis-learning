# Cards 16-20 image accuracy audit - 2026-05-23

Scope: the five replacement-prone XHS knowledge posters:

- `spacing.stance-choice`
- `spin.topspin`
- `spin.slice`
- `trajectory.net-clearance`
- `ball.bounce-window`

This audit is a hard gate before another generation pass. If an image fails any
topic-specific gate below, it stays `replace` even if the design is attractive.

## Sources checked

- ITF Rules of Tennis: the ball must pass over the net and land in the opponent's court for normal play; court markings distinguish singles and doubles boundaries.  
  https://www.itftennis.com/media/7221/2025-rules-of-tennis-english.pdf
- USTA, *Top 5 Controls in Tennis*: basic control variables include direction, depth, height, speed, and spin.  
  https://www.usta.com/en/home/improve/tips-and-instruction/national/top-5-controls-in-tennis.html
- USTA, *Forehand basics*: forehand contact should be in front of the body with weight transfer and a full finish.  
  https://www.usta.com/en/home/improve/tips-and-instruction/national/learning-the-basics--forehand.html
- USTA, *How to Hit Slice*: slice uses an open racket face, starts high, and drives the racket through contact toward the target; it is not a sideways chop.  
  https://www.usta.com/en/home/improve/tips-and-instruction/national/how-to-hit-slice.html
- USTA, *How to Hit Heavy Topspin*: topspin comes from brushing up the back of the ball and should still be aimed with depth and control.  
  https://www.usta.com/en/home/improve/tips-and-instruction/national/how-to-hit-heavy-topspin.html

## Universal visual gates

These gates apply before style, layout, or text quality:

1. **Court-side gate**: every live ball path must start at the racket/contact point, cross the net, and land in the opponent's half unless the lesson is explicitly "miss into net" or "short ball".
2. **Singles gate**: if the card is not about doubles, all targets and landing zones must be inside singles sidelines. Doubles alleys may appear only as neutral unhighlighted lines.
3. **Handedness gate**: a card must not accidentally switch the same player between right-handed and left-handed actions across comparison panels.
4. **Body-direction gate**: body, racket face, contact point, and ball path must all point toward the opponent's court. A ball cannot visually fly toward the sideline, side fence, or spectator area.
5. **One-concept gate**: do not add mini-courts unless they can pass the same court-side and singles gates. For these five cards, prefer text/icon panels over mini-court diagrams.

## Topic gates

### 16. Stance choice

Knowledge target: stance follows time and incoming ball quality.

Must show:

- Open stance: for a right-handed forehand, the player remains mostly open to the net/baseline with both feet closer to parallel to the baseline, outside/right leg loading, and no clear forward step across the body.
- Neutral or semi-closed stance: the non-dominant/left foot steps forward into the court, the body is more side-on, and weight transfers forward through the ball.
- If the picture cannot make "closed" visually obvious, label it "neutral / semi-closed" rather than hard "closed".
- Both panels must keep the same handedness and ball direction toward the opposite court.

Reject when:

- The right panel reads as left-handed.
- The feet do not demonstrate the named stance.
- The stroke direction points sideways instead of toward the opponent's half.

### 17. Topspin arc

Knowledge target: topspin gives a higher net-clearance path that dips into the opponent's court.

Must show:

- One green ball path from the racket to the opponent's half.
- The landing spot is clearly beyond the net, in the opponent's court, preferably deep and inside singles lines.
- Racket/brushing cue is visually separate from the ball flight path.
- Ball flight: high over the net, then downward into the court; after bounce it can kick up/forward.

Reject when:

- Landing spot can be read as on the hitter's side.
- Target sits outside the singles sideline.
- The racket path and ball path are merged into one confusing symbol.

### 18. Slice skid

Knowledge target: slice/backspin sends the ball over the net, then it stays low and skids forward after the bounce.

Must show:

- Prefer a backhand slice or clearly labeled slice, with an open racket face.
- The racket travels through the ball toward the opponent's half; it is not a sideways chop.
- First bounce and skid arrow are both on the opponent's side of the net.
- Low trajectory is acceptable, but it must still clear the net.

Reject when:

- The player appears to slice toward the sideline/fence instead of the opponent.
- The skid arrow is drawn on the hitter's side.
- The contact reads like a two-handed forehand or a strange hybrid action.

### 19. Net-clearance budget

Knowledge target: more height over the net can reduce net errors, but height must be paired with depth.

Must show:

- Two and only two trajectories from the same contact point:
  - green: higher net clearance, lands deep in the opponent's court;
  - orange: low and flat, either into the net or short/low value on the opponent's side.
- The "safe height" band sits above the net and does not conflict with the ball path.
- The green path must not look like it is floating into the fence or outside the court.

Reject when:

- The safety band, green arc, and orange arc contradict each other.
- A landing zone is outside singles boundaries.
- Small diagrams introduce new court errors.

### 20. Bounce window

Knowledge target: one bounce creates three timing windows: rising, peak, falling.

Must show:

- A single side-view bounce curve, not a full court diagram.
- Three points on the same bounce: rising phase, highest point, falling phase.
- No mini-court unless every court line and arrow is correct.
- Player examples must match the stroke being described. If it is a forehand example, do not show a two-handed forehand.

Reject when:

- The lower panels add a wrong court diagram.
- The player silhouette/action implies the wrong stroke.
- The card shows multiple unrelated bounces instead of one bounce with three time windows.

## Current generated images reviewed

| Card | Current asset | Status | Audit result |
|---|---|---|---|
| 16 | `xhs-spacing-stance-choice-v2.png` | `replace` | Right panel accidentally reads left-handed; stance label is not trustworthy enough. |
| 17 | `xhs-spin-topspin-arc-v2.png` | `replace` | Landing/target still reads out or unclear, and lower diagrams do not reliably match the main court. |
| 18 | `xhs-spin-slice-skid-v3.png` | `replace` | Main image improved, but the skid arrow still reads as on the hitter's side. |
| 19 | `xhs-trajectory-net-clearance-v2.png` | `replace` | Safety-height marker and paths do not form a coherent teaching diagram. |
| 20 | `xhs-ball-bounce-window-v2.png` | `replace` | The example action reads like a two-handed forehand / wrong stroke cue. |
| 16 | `xhs-spacing-stance-choice-v3.png` | `replace` | Focused re-audit failed it: right panel has left-handed-read risk, footwork ambiguity, misleading arrow, and weak lower mini diagrams. |
| 17 | `xhs-spin-topspin-arc-v3.png` | `replace` | Gemini failed it: body/racket orientation and stroke mechanics do not convincingly match a physically plausible topspin contact. |
| 18 | `xhs-spin-slice-skid-v4.png` | `replace` | Gemini failed it: the trajectory does not clearly begin at the racket/contact point. |
| 19 | `xhs-trajectory-net-clearance-v3.png` | `replace` | Gemini failed it: green/orange trajectories do not cleanly originate from the same contact point. |
| 20 | `xhs-ball-bounce-window-v3.png` | `replace` | External review failed it: the three timing-window silhouettes do not clearly correspond to the same bounce, and the falling-phase example still reads as too normal. |
| 16 | `xhs-spacing-stance-choice-v5.png` | `replace` | Gemini failed it: the two panels reused nearly the same side-on body pose, and the open/neutral distinction did not read from the actual feet. |
| 16 | `xhs-spacing-stance-choice-v6.png` | `replace` | Gemini failed it: right-arm anatomy was distorted, open-stance footprint icons contradicted the main concept, and right-panel focus did not align with left-foot step-in. |
| 16 | `xhs-spacing-stance-choice-v7.png` | `replace` | Gemini passed the open-stance side, but failed the neutral side because the main figure still read as right leg stepping forward. |
| 16 | `xhs-spacing-stance-choice-v8.png` | `candidate` | Gemini passed it: overhead view, explicit left/right labels, open stance right-foot load, neutral stance left-foot step-in, and target direction are consistent. |
| 17 | `xhs-spin-topspin-arc-v4.png` | `candidate` | Gemini passed it: ball path starts at contact, clears the net, lands in the opponent deep court, and the brushing inset is separate from the flight path. |
| 18 | `xhs-spin-slice-skid-v5.png` | `candidate` | Gemini passed it: the ball clears the net, the first bounce and low skid are in the opponent half, and the open-face cue is separated in an inset. |
| 19 | `xhs-trajectory-net-clearance-v4.png` | `candidate` | Gemini passed it: green and orange paths share the same contact point; green clears the safety window and lands deep, while orange reads as net risk. |
| 20 | `xhs-ball-bounce-window-v4.png` | `candidate` | Gemini passed it: one bounce point, one continuous curve, and the rising/peak/falling windows are correctly ordered on the same bounce. |
| 17 | `xhs-spin-topspin-arc-v5.png` | `replace` | Gemini failed it: the richer perspective made the deep landing dot read as still on the hitter's side of the net. |
| 18 | `xhs-spin-slice-skid-v6.png` | `replace` | Gemini failed it: the richer perspective made the first bounce and skid arrow read as on the hitter's side / toward the sideline. |
| 17 | `xhs-spin-topspin-arc-v6.png` | `candidate` | Gemini passed it: the stricter side-view split keeps the contact point, net, opponent half, deep landing, and brushing inset unambiguous. |
| 18 | `xhs-spin-slice-skid-v7.png` | `replace` | Gemini failed it: the action and low skid were acceptable, but the net rendered as a central pillar rather than a standard horizontal tennis net. |
| 18 | `xhs-spin-slice-skid-v8.png` | `candidate` | Gemini passed it: the standard horizontal net is clear, the ball crosses it, and the first bounce plus skid arrow stay in the opponent half. |
| 19 | `xhs-trajectory-net-clearance-v5.png` | `candidate` | Gemini passed it: both paths share the same contact point; green clears the window and lands deep, while orange reads as net risk. |
| 17 | `xhs-spin-topspin-arc-v6.png` | `replace` | User rejected it: the height guide floats too high instead of staying tied to the net, and the deep landing still reads as near-side in context. |
| 18 | `xhs-spin-slice-skid-v8.png` | `replace` | User rejected it: despite the label, the slice trajectory still visually reads as on the hitter's side. |
| 19 | `xhs-trajectory-net-clearance-v5.png` | `replace` | User rejected it: the "deep" landing dot still reads as near-side in the real perspective. |
| 17/18/19 | `xhs-*-fixed-canvas-draft` | `draft` | Deterministic Canvas overlay fixed geometry, but the central overlay is too patch-like; keep as a geometry reference, not a final card. |
| 17 | `xhs-spin-topspin-arc-v8.png` | `candidate` | Deterministic full-poster render passed self-review and Gemini: height guide is anchored to the net top, ball crosses from near side to opponent side, and deep landing is on the right half. |
| 18 | `xhs-spin-slice-skid-v10.png` | `candidate` | Deterministic full-poster render passed self-review and Gemini: low slice path crosses the net, first bounce and skid arrow are both in the opponent half. |
| 19 | `xhs-trajectory-net-clearance-v7.png` | `candidate` | Deterministic full-poster render passed self-review and Gemini: safety window touches the net top, green path lands deep, and orange path hits the net. |
| 17/18/19 | `xhs-spin-topspin-arc-v8.png` / `xhs-spin-slice-skid-v10.png` / `xhs-trajectory-net-clearance-v7.png` | `replace` | User rejected them: geometry is correct, but the full Canvas render changes the visual language too much and loses the premium photographic XHS card style. |

## External ChatGPT review - 2026-05-23

The five images were uploaded to ChatGPT in Chrome with the strict audit prompt
from `chatgpt-image-review-prompt-2026-05-23.md`.

First pass:

| Card | ChatGPT result | Notes |
|---|---|---|
| 16 | PASS | Too lenient. It did not catch the right-panel handedness and footwork ambiguity until prompted with the known concern. |
| 17 | PASS | It read the side-view topspin path as crossing the net and landing in the opponent's half. |
| 18 | PASS | It read the slice as traveling toward the opponent's half, with bounce and skid on the opponent side. |
| 19 | PASS | It read the green and orange net-clearance paths as logically consistent. |
| 20 | FAIL | It found the three timing-window silhouettes did not clearly correspond to the same bounce, and the falling-phase example still looked like a normal shot. |

Focused re-audit of card 16:

| Card | ChatGPT result | Notes |
|---|---|---|
| 16 | FAIL | Right panel has a clear left-handed-read risk; the stepping foot is ambiguous or reversed; the open-stance arrow can mislead the action direction; the bottom mini diagrams are not tightly bound to the main panels. |

Operational conclusion:

- Keep `xhs-spacing-stance-choice-v3.png` as `replace`.
- Keep `xhs-ball-bounce-window-v3.png` as `replace`.
- Keep cards 17-19 as `candidate` only; they still need user review before approval.
- Use external review as a second pass, not as authority. It missed card 16 until the suspected failure mode was named explicitly.

## External Gemini review - 2026-05-23

The five images were sent to Gemini CLI with the same strict tennis-accuracy
prompt. Gemini returned a much harsher result: all five failed.

| Card | Gemini result | Notes |
|---|---|---|
| 16 | FAIL | It read the ball trajectories as not clearly crossing the net, and it flagged the right panel as footwork/text mismatch: the front step does not reliably read as the left foot stepping in. |
| 17 | FAIL | It flagged stroke-mechanics problems: body, arm structure, racket face, and trajectory do not convincingly match a physically plausible topspin contact. |
| 18 | FAIL | It flagged the slice trajectory as disconnected from the racket/contact point rather than starting cleanly from the hit. |
| 19 | FAIL | It flagged the safe and risky trajectories as not clearly originating from the same contact point. |
| 20 | FAIL | It flagged the side silhouettes as facing the wrong way relative to the incoming bounce direction. |

Operational conclusion after Gemini:

- Mark cards 16-20 as `replace`.
- Treat ChatGPT as useful only when prompted with concrete suspected failure modes.
- Treat Gemini as stricter and better at finding visual-physics inconsistencies, but still verify its claims against the actual image before writing final generation prompts.

## External Claude / Anthropic attempt - 2026-05-23

- Claude CLI was available locally but returned `401 Invalid authentication credentials`, so command-line Anthropic review could not run.
- Claude web was opened in Chrome and all five images were uploaded successfully to a new chat named `网球技术图片审稿标准`.
- The same strict audit prompt was submitted. Claude remained in `Thinking` for several minutes and had not returned a result at the time this audit note was updated.
- Keep the Claude browser tab open as a pending external review; do not treat it as completed until a response appears.

## Next generation protocol

1. Generate one card at a time, not five at once.
2. Open the PNG from `public/assets/knowledge/`, not only the inline generation preview.
3. Apply the universal gates first.
4. Apply the topic gate.
5. Only then evaluate text and design.
6. If a card fails, keep it `replace`; do not ask the user to approve a known-bad candidate.
