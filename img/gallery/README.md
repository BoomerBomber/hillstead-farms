# Gallery photos

Drop real photos in this folder using the exact filenames below. The gallery
picks them up automatically — no code changes needed.

Until a file exists, its tile shows a styled "Photo coming" placeholder instead
of a broken image, so the site is safe to publish before every photo is ready.

| Filename            | Tile caption            | What to shoot                                      |
|---------------------|-------------------------|----------------------------------------------------|
| `hens.jpg`          | Forty-six hens, on grass| The flock out on pasture, ideally morning light     |
| `eggs.jpg`          | The morning basket      | Mixed-color eggs in the basket, just collected      |
| `garden.jpg`        | July rows               | Garden rows — tomatoes, beans, sweet corn           |
| `sourdough.jpg`     | Out of the farm kitchen | Jalapeño cheddar minis, fresh out of the oven       |
| `blackberries.jpg`  | Wild blackberries       | Picked blackberries, stained fingers welcome        |

The large hero tile currently reuses `../hero-hillside.jpg` (the ridge shot).
Swap it for a different photo by editing that tile's `src` and `data-full` in
`index.html`.

## Recommended specs

- **Format:** JPEG
- **Size:** roughly 1600px on the long edge — larger is wasted, smaller looks soft
- **File weight:** aim under ~400KB each; compress before adding
  (squoosh.app is free and does this well)
- **Orientation:** landscape works best in the grid; portrait photos get
  center-cropped

## Adding more tiles

Copy any `<button class="gal-item">…</button>` block in the gallery section of
`index.html`, then update its `src`, `data-full`, `data-cap`, and `alt` text.
Keep `alt` descriptive — it's what screen readers announce.
