# Design: PlugMyChat

The locked system. Every Hallmark run reads this first and pages share it. Change it on purpose; the file is the rule.

## System
- Genre: modern-minimal
- Shape of the first page: Feature Stack
- Theme: Dose (by request)
- Axes: light/grotesk-sans/chromatic-green · posture: committed
- Dial: dose: white

## Tokens
`app/tokens.css` is the source of truth. shadcn keeps `--accent` and `--muted` as surfaces. The pharmacy green is `--color-signal`, quiet text is `--color-ink-3`.

```css
:root {
  --color-paper: oklch(97.6% 0.011 88);  --color-paper-2: oklch(96.5% 0.02 160);  --color-paper-3: oklch(93% 0.036 160);
  --color-ink: oklch(21% 0.025 170);  --color-ink-2: oklch(31% 0.02 170);  --color-ink-3: oklch(49% 0.024 165);  --color-rule: oklch(86.5% 0.022 140);
  --color-signal: oklch(50% 0.13 160);  --color-signal-ink: oklch(99% 0.006 160);  --color-focus: oklch(45% 0.14 160);
  --font-display: var(--font-schibsted), "Schibsted Grotesk", sans-serif;  --font-body: var(--font-instrument), "Instrument Sans", sans-serif;  --font-outlier: var(--font-dm-mono), "DM Mono", monospace;
  --radius-card: 14px;  --radius-pill: 999px;  --rule-hair: 1px;  --shadow-card: 0 1px 2px oklch(30% 0.03 165 / 0.08), 0 24px 48px -24px oklch(40% 0.08 165 / 0.35);
}
```

The spacing scale, the type scale, the easings and the durations are the scaffold's and live in `app/tokens.css`.

## Controls
- Primary: green plastic, 10px radius, 52px tall, 3px press
- Secondary: clear plastic, same radius and height

## Motion
- Character: calm; window light drifts 90s; one press on controls; under reduced motion the light stays still.

## Exports
`app/tokens.css` and `app/base.css`. shadcn variables in `app/globals.css` point at these tokens.
