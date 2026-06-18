# Saanjha 🪔

A shared-household grocery & life-management app for housemates. One **shared
inventory** is the spine of the whole app — receipts/manual entry feed it,
cooking depletes it, low stock drives the shopping list, and recipes match
against it.

The entire app is a single, self-contained, default-exported React component:
[`src/Saanjha.jsx`](src/Saanjha.jsx). State only — nothing persists, so a refresh
resets to the seed data (intentional, for a prototype / artifact).

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
```

Build: `npm run build` → `dist/`.

## The five tabs

1. **Pantry** — inventory grouped by category, per-item stock-level bars
   (green when healthy, turmeric-amber at/below threshold), +/- steppers,
   search, and an add-item form.
2. **Shopping** — auto-built from every item at/below its threshold (with a
   suggested buy amount + "X left") plus a manual "added by the house" list.
   **Bought** refills the pantry to full, closing the inventory loop.
3. **Cook** — ~27 recipes matched against live stock and ranked. **Cook this**
   deducts non-staple ingredients (which can trip low-stock → shopping list);
   **Add missing** pushes absent ingredients to the list.
4. **Track** — private per-member nutrition portal: a calorie ring + macro
   bars, editable goals, and three ways to log a meal (from recipe / quick add
   / snap a meal).
5. **Split** — Splitwise-style ledger with per-member balances and a settle-up
   that collapses everything into the fewest payments.

## Honesty notes

- **Meal macros are placeholder estimates.** A production app should source them
  from a licensed nutrition database (USDA FoodData Central, Edamam, Spoonacular).
- **"Snap a meal" does not run real recognition.** It demonstrates the
  estimate → confirm flow only; real recognition needs a vision model and the
  numbers should always be hand-confirmable.

## Notes on the build

- Tailwind is used for **layout utilities only** (flex / grid / spacing); all
  colour and typography come from an inline token palette. The Tailwind Play CDN
  is loaded in `index.html` so those utilities work in this standalone Vite app
  (in the Claude artifact runtime they're provided ambiently).
- Icons: `lucide-react`. Fonts: Bricolage Grotesque (display) + Inter (body),
  loaded via `@import` with system fallbacks.
