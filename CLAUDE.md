# Mundial 2026 — Friends Prediction Game

A small web app for ~10–20 friends to predict World Cup 2026 match results and compete on a leaderboard.

## Tech Stack

- **Backend/DB:** Supabase (PostgreSQL + Edge Functions)
- **Frontend:** Vercel (framework TBD, likely Next.js)
- **Data source:** `https://api.wc2026api.com` — World Cup 2026 REST API

## Data API

Base URL: `$WC2026_API_URL` (`https://api.wc2026api.com`)  
Auth: `Authorization: Bearer $WC2026_API_KEY`  
Both keys are in `.env`.


| Endpoint            | Description                                      |
| ------------------- | ------------------------------------------------ |
| `GET /matches`      | All 104 matches (single call returns everything) |
| `GET /matches/:id`  | Single match                                     |
| `GET /teams`        | All 48 teams                                     |
| `GET /groups`       | All groups with current standings                |
| `GET /groups/:name` | e.g. `/groups/A` — group + standings             |
| `GET /stadiums`     | All 17 stadiums                                  |


**Real match object fields:** `id`, `match_number`, `round`, `group_name`, `home_team`, `away_team`, `home_team_code`, `away_team_code`, `stadium`, `stadium_city`, `kickoff_utc`, `home_score`, `away_score`, `home_pen`, `away_pen`, `status`

`status` values: `scheduled` | `live` | `completed`  
Rounds: `group` → `R32` → `R16` → `QF` → `SF` → `3rd` → `final`

### Sandbox endpoint — `GET /test/match`

Returns a **fictional** BRA vs ARG Final that cycles through all phases every 160 min anchored to UTC midnight. Use for development and testing — does not count against the 100 req/day quota.

Phases in order: `PRE` → `1H` → `HT` → `2H` → `ET1` → `ET2` → `PEN` → `FT_PEN`

Extra fields only present in sandbox response (not on real matches):
- `phase` — current phase string
- `match_minute` — current minute of play (1–120)
- `next_phase_in_seconds` — use to schedule the next sync poll precisely
- `kickoff_in_seconds` — seconds to kickoff (PRE phase only)
- `_sandbox: true` — always set; use to guard against accidental real-data writes

Scenario baked in: goals at 23' (BRA 1-0) and 67' (ARG 1-1), draw through ET, BRA 3-5 ARG on pens. Covers every scoring tier and phase the app needs to handle.

### Webhooks — Pro plan only (not available on free tier)

## API Polling Constraints

**Free tier: 100 requests/day.** `GET /matches` returns all 104 matches in one call — always use this, never fetch individual matches.

**Polling strategy (Supabase scheduled Edge Function `sync-matches`):**

- **Inactive periods** (no matches in the next 2+ hours): poll once every 2–4 hours
- **Pre-match window** (≤1 hour before first kickoff of the day): poll every 15 min
- **Active match window** (from first kickoff until last expected final whistle): poll every 5–10 min
- **Post-day cooldown** (1 hour after last match ends): back to low frequency

Match duration estimates:
- Group stage: 90 min + ~10 min stoppage. **No extra time or penalties.**
- Knockout (R32 through Final): up to 120 min ET + ~15 min stoppage + penalties (~30 min). Budget 3 hours per match.

**Daily query budget target: ≤ 80 queries** (leave 20 as buffer).

Group stage: at most 4 matches/day → active window ≤ ~6 hours → ≤ ~36 polls at 10-min cadence.  
Knockout stages: 1–4 matches/day in tighter windows — budget is comfortable.

## Tournament Overview

- **48 teams**, **12 groups** (A–L), **4 teams each**
- **104 total matches**: 48 group + 16 (R32) + 8 (R16) + 4 (QF) + 2 (SF) + 1 (3rd) + 1 (Final)
- **Group stage:** Jun 11 – Jun 27, 2026
- **Knockout stage:** Jun 28 – Jul 19, 2026
- **Final:** Jul 19 @ MetLife Stadium, East Rutherford NJ

See `docs/cup.txt` for full group listings and match schedule.  
See `docs/cup_finals.txt` for knockout bracket structure.

## Game Mechanics

- Players submit predictions for each match (home score, away score; plus penalty winner for knockout matches that could go to penalties)
- Prediction deadline: kickoff time of each match (locked after that)
- Points calculated and stored per prediction once match result is confirmed in DB
- **Player onboarding:** invite-only via email sent manually from Supabase. No self-registration. Simple auth (magic link or similar — no passwords).

**Scoring system:** Tiered by outcome quality, with a GD proximity bonus and round multipliers.

### Base points — Group stage (draws allowed, no ET/penalties)

Predict: `home_score`, `away_score` (90 min, which is the full match).


| Tier | Condition                                    | Points |
| ---- | -------------------------------------------- | ------ |
| 0    | Wrong result (W/D/L incorrect)               | 0      |
| 1    | Correct result, |predicted GD − real GD| ≥ 2 | 2      |
| 2    | Correct result, |predicted GD − real GD| = 1 | 3      |
| 3    | Correct result + exact GD                    | 4      |
| 4    | Exact score                                  | 7      |


Examples:

- Real: 2-0 → predict 1-0: correct result, GD off by 1 → **3 pts**
- Real: 2-0 → predict 3-0: correct result, exact GD (both 2) → **4 pts**
- Real: 2-0 → predict 2-0: exact score → **7 pts**
- Real: 1-1 → predict 0-0: correct result (draw), exact GD (both 0) → **4 pts**
- Real: 1-1 → predict 1-1: exact score → **7 pts**
- Real: 1-0 → predict 0-1: wrong result → **0 pts**

### Base points — Knockout stage (ET and penalties possible)

Predict: `home_score`, `away_score` — the score at the **final whistle before penalties** (i.e. after 90 min + ET if played). The API does not separate ET goals from 90-min goals; `home_score`/`away_score` accumulate through all play and this is what predictions are evaluated against.

Additionally predict: `penalty_winner` — which team wins if it goes to pens.

**Score evaluation:** same tier table as group stage, applied to `home_score`/`away_score`.  
A draw prediction (e.g. 1-1) is valid — it means the player expects the match to still be level after all play and go to penalties.

**Penalty bonus** (only applied when the match actually went to penalties, i.e. `home_pen` and `away_pen` are non-null):

- Correct `penalty_winner`: **+2 pts** (added on top of score points)
- Wrong or missing `penalty_winner`: +0 pts

**ET goal edge case:** if an ET goal is scored (rare), it is included in `home_score`/`away_score`. A player who predicted the pre-ET draw score earns 0 pts — the accepted trade-off for keeping evaluation simple and API-consistent.

Examples (match ends 1-1 after ET, goes to pens, ARG wins 5-3):

- Predict 1-1 + ARG (correct pen winner): 7 + 2 = **9 pts**
- Predict 1-1 + BRA (wrong pen winner): 7 + 0 = **7 pts**
- Predict 0-0 + ARG: 4 (correct result/GD) + 2 = **6 pts**
- Predict 2-1 (predicted home win, real score is a draw): 0 + 0 = **0 pts**

Examples (match decided in ET, ends 2-1, no penalties):

- Predict 2-1: exact score → **7 pts**
- Predict 1-0: correct result (home win), GD off by 1 → **3 pts**
- Predict 1-1 (predicted draw, real result is a home win): 0 pts

### Round multipliers

Applied to the total points earned for that match (base + penalty bonus).


| Round     | Multiplier | Max pts/match |
| --------- | ---------- | ------------- |
| Group     | ×1         | 7             |
| R32       | ×3         | 21 + 6 pen    |
| R16       | ×5         | 35 + 10 pen   |
| QF        | ×8         | 56 + 16 pen   |
| SF        | ×12        | 84 + 24 pen   |
| 3rd place | ×6         | 42 + 12 pen   |
| Final     | ×15        | 105 + 30 pen  |


### Spain bonus

Any match where Spain is `home_team` or `away_team` doubles the round multiplier (applied on top — e.g. a Spain group match is effectively ×2; a Spain final is ×30). Implemented in `compute_points()` by checking team names against `'Spain'`.


**Max possible points (perfect tournament, ignoring Spain bonus and pens):**

- Group: 48 × 7 = **336 pts**
- R32: 16 × 21 = **336 pts**
- R16: 8 × 35 = **280 pts**
- QF: 4 × 56 = **224 pts**
- SF: 2 × 84 = **168 pts**
- 3rd: **42 pts**
- Final: **105 pts**
- **Subtotal: 1,491 pts** (plus penalty bonuses and Spain ×2 on any Spain matches)

## UI — Views &amp; States

### 1. Match List (main screen)

- Grouped by date
- Each row shows: teams, kickoff time, status badge, user's own prediction (if submitted)
- Match status drives the row style:
  - `scheduled` — prediction not submitted yet → CTA to predict
  - `scheduled` — prediction submitted → show user's predicted score, edit still allowed
  - `live` — show current score (polled from DB), prediction locked
  - `finished` — show final score + user's points earned for that match

### 2. Match Detail (tap/click a match row)

- **Before kickoff — no prediction submitted yet:**
  - Prediction form (home score + away score; knockout adds penalty winner selector)
  - List of players who have already submitted a prediction (names only — scores hidden)
  - Players who haven't predicted yet are also visible (so there's social pressure)
- **Before kickoff — prediction already submitted:**
  - Show user's own prediction with an Edit button (editable until kickoff)
  - Same player list: who has/hasn't predicted (scores still hidden)
- **After kickoff (live):**
  - Current score (prominent, live via Supabase Realtime)
  - User's prediction + preliminary points based on current score
  - All other players' predictions now revealed: name, predicted score, preliminary points
  - Preliminary points update as score changes (Realtime)
- **After match ends (finished):**
  - Final score
  - All predictions + final points (frozen)
  - These points feed the leaderboard

### 3. Leaderboard

- Ranked list of all players: name, total points, matches predicted
- Tap/click a player → player detail view:
  - All their predictions listed per match (predicted score, actual score, points)
  - Only shows predictions for matches that have already kicked off

## Architecture

```
wc2026api.com
      │
      │ (scheduled polling — Supabase Edge Function: sync-matches)
      ▼
Supabase DB  ◄──── Players submit predictions (via frontend)
      │
      ├── REST/RLS queries (match list, leaderboard, player detail)
      └── Realtime subscription (live score updates on match detail)
      ▼
Frontend (Vercel)
  - Match list (grouped by date/round)
  - Match detail (predict / live / results + others' predictions)
  - Leaderboard + player detail
```

## Key Constraints &amp; Decisions

- **Never call the external API from the frontend.** All reads go through Supabase DB.
- **Predictions are immutable after kickoff.** Enforce this at the DB level (RLS policy or trigger).
- **Group stage: no extra time / penalties.** Only predict home/away score.
- **Knockout stage:** predict home/away score (after 90 min); if a draw, also predict which team wins on penalties (no score prediction for extra time).
- Teams in later knockout rounds may be TBD (`home_team: null`) — the UI must handle this gracefully.

