# Weekly Compass

A calm weekly planner built on Stephen Covey's *7 Habits of Highly Effective People*, with a solopreneur constitution woven in.

**Ship → Distribute → Measure → Learn → Kill or Double Down**

## Pages

- **This week**: Covey's weekly planning steps. Connect to your mission → pick this week's roles → set big rocks (Quadrant II) → Sharpen the Saw → schedule the rocks into days → evaluate. Today's focus comes from a weighted random selector, and an experiment with real traction can override it (evidence beats randomness).
- **Compass**: personal mission statement, north star, roles (with selector weights), and long- and short-term goals.
- **Experiments**: track up to 200 experiments through the loop, and record evidence and kill or double-down decisions.
- **Constitution**: the principles: value more / value less, key tradeoffs, and the 7 Habits.

## Stack

- Next.js (App Router). The frontend and the API routes (`app/api/*`) live in one app.
- Supabase Postgres. Tables are prefixed `planner_`, with RLS on and no policies. All access goes through `SECURITY DEFINER` RPC functions that need a session token. Logging in with a code creates a token, which is stored in an httpOnly cookie.
- Calm, low-stimulation UI: muted colours, no motion, dark mode, and less-used sections folded away.

## Setup

```bash
cp .env.example .env.local   # fill in SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY
npm install
npm run dev
```

The schema is in `supabase/migrations/`. To add a login code:

```sql
insert into public.planner_users(code, label) values ('Q2-NEWCODE', 'name');
```
