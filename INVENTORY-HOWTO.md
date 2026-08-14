# Updating the Farm Stand inventory (from your phone)

Everything customers see under **Farm Stand** is driven by one file: `inventory.json`.
Edit it, save, and the live site updates itself about a minute later. No other file ever needs touching.

## The weekly routine (~60 seconds)

1. Open the **GitHub app** (or github.com in your phone browser) → this repo → `inventory.json`.
2. Tap the pencil (Edit).
3. Change the `status` words and notes, and set `updated` to today's date (`YYYY-MM-DD`).
4. Commit changes. Done — the site rebuilds itself.

## The file

```json
{
  "updated": "2026-08-14",
  "note": "",
  "items": {
    "eggs":      { "status": "available", "note": "" },
    "sourdough": { "status": "ask",       "note": "Text to reserve the next bake" },
    "produce":   { "status": "season",    "note": "Tomatoes and sweet corn this week" },
    "chicken":   { "status": "out",       "note": "More birds next spring" }
  }
}
```

- `updated` — today's date, always `YYYY-MM-DD`. Shows on the site as "This week's list · updated August 14".
- `note` (top level) — optional announcement line, e.g. `"At the farmers market Saturday morning"`. Leave `""` for none.
- Each item's `note` — optional line shown on that card, e.g. `"3 dozen in the fridge"`. Leave `""` to hide.

## Status words (only these five work)

| Word        | Badge on the site |
|-------------|-------------------|
| `available` | AVAILABLE NOW (green) |
| `low`       | ALMOST GONE (gold) |
| `out`       | SOLD OUT (gray) |
| `season`    | IN SEASON (green) |
| `ask`       | TEXT TO CHECK (outlined) |

## Rules that keep it painless

- Keep the quotes and commas exactly as they are — change only the words between quotes.
- If the file ever breaks (bad comma, typo), the site does NOT break — it just shows the cards
  without badges until you fix it.
- Only claim what's true. `ask` is always a safe answer.
