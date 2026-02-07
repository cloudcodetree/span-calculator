# Structural Span Calculator

An interactive calculator for estimating allowable spans across common residential construction materials.

## Materials Covered

- **Dimensional Lumber** — 2×6 through 2×12, multiple species/grades, 12"/16"/24" OC, single & sistered
- **LVL (Laminated Veneer Lumber)** — Single and double plies, 7¼" through 18"
- **Glulam** — 3⅛" and 5⅛" widths
- **Engineered I-Joists** — TJI 210/230/360 series
- **Steel** — W-shapes, C-channels, and HSS tube steel
- **Comparison view** — All options ranked by span with visual bar chart

## Load Cases

Supports floor joists, sleeping areas, roof rafters, ceiling joists, decks, snow loads, and headers/beams with configurable tributary widths.

## Engineering Basis

Calculations follow simplified formulas from:
- **NDS** (National Design Specification) for wood
- **AISC ASD** (Allowable Stress Design) for steel
- **IRC 2021** load assumptions

## ⚠️ Disclaimer

This tool provides **estimated** allowable spans for planning purposes only. Results assume simple span, uniform loading, adequate lateral bracing, and standard bearing conditions. **Always verify with local building codes and a licensed structural engineer** for permit and construction purposes.

## Development

```bash
npm install
npm run dev
```

## Deployment

Pushes to `main` automatically deploy to GitHub Pages via the included GitHub Actions workflow.

## License

MIT
