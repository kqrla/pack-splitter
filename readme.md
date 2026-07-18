# pack splitter

split sticker sheets, asset packs, and sprite sheets into individual assets — automatically or manually. works as a figma plugin and a standalone web app.

![pack splitter](https://img.shields.io/badge/status-active-0d99ff) ![license](https://img.shields.io/badge/license-MIT-333)

## what it does

pack splitter takes an image with multiple assets scattered around (not in neat grids) and:

1. **removes the background** using edge-sampling flood-fill
2. **detects individual assets** via connected-component analysis
3. **extracts each asset** as a separate image or vector
4. **outputs them** in an auto-layout frame (figma) or as downloadable files (web)

## modes

| mode | description |
|------|-------------|
| **auto-detect** | analyzes the image, removes bg, finds all distinct objects automatically |
| **split freely** | draw rectangles manually to define crop regions (like tileforge's free split) |

## features at a glance

- edge flood-fill + interior background removal
- connected-component labeling for object detection
- live preview with real-time tolerance adjustment
- manual rectangle selection drawing
- auto-layout output (horizontal wrap)
- vectorize toggle (marching squares → svg contour tracing)
- configurable tolerance, padding, and gap
- poppins font, lowercase ui aesthetic

## getting started

### figma plugin

the plugin is published with id `237b554e-2caf-458e-930a-4e94ea1eab33`. install it from the figma community or run it locally:

```
cd plugin/
# build with your preferred figma plugin bundler
```

### standalone web app

zero dependencies — just open the html file:

```
cd web/
open index.html
```

or serve it:

```
npx serve web/
```

drop any image (png, jpg, webp) onto the canvas, adjust settings, and click extract.

## project structure

```
├── plugin/           # figma plugin source
│   ├── manifest.json
│   ├── code.ts       # plugin sandbox (figma api)
│   └── ui.html       # plugin ui (iframe)
├── web/              # standalone web app
│   └── index.html    # single-file app, no build step
├── readme.md
├── features.md       # detailed feature breakdown
├── underthehood.md   # technical deep-dive with diagrams
├── usecases.md       # example use cases
└── roadmap.md        # planned features
```

## tech stack

- vanilla javascript (no frameworks, no build step for web)
- typescript for the figma plugin sandbox
- offscreencanvas for image processing
- marching squares for vectorization
- figma plugin api for node creation

## license

mit
