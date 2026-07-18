# roadmap

## completed

- [x] auto-detect mode with edge flood-fill background removal
- [x] split freely mode with manual rectangle drawing
- [x] interior background removal toggle
- [x] live preview with real-time tolerance adjustment
- [x] connected-component object detection
- [x] auto-layout output (horizontal wrap)
- [x] configurable padding, tolerance, gap
- [x] vectorize toggle (marching squares → svg)
- [x] standalone web app (zero dependencies)
- [x] poppins font + lowercase ui styling

## next up

### improved vectorization
- [ ] multi-color vector output (trace each color region separately)
- [ ] curve fitting (bezier instead of line segments only)
- [ ] hole detection (subtract inner paths from outer)
- [ ] configurable simplification tolerance

### smarter detection
- [ ] edge detection mode (sobel/canny) for images without uniform backgrounds
- [ ] ai-powered segmentation as an optional mode
- [ ] overlap handling — separate overlapping assets
- [ ] minimum size threshold slider (instead of hardcoded 0.3%)

### output options
- [ ] export as individual png/svg files (figma plugin)
- [ ] naming convention templates (e.g., `icon-{n}`, `sticker-{name}`)
- [ ] custom output frame sizing
- [ ] grid layout option (specify columns)
- [ ] preserve original positions mode

### ux improvements
- [ ] undo/redo for free-draw selections
- [ ] resize/move drawn rectangles after creation
- [ ] zoom and pan on preview canvas
- [ ] batch processing (multiple source images)
- [ ] keyboard shortcuts (delete selection, toggle modes)
- [ ] progress bar for large images

### web app enhancements
- [ ] zip download for batch export
- [ ] drag-and-drop reordering of extracted assets
- [ ] side-by-side before/after comparison
- [ ] local storage for settings persistence
- [ ] pwa support (offline usage)
- [ ] paste from clipboard support

### figma-specific
- [ ] multi-layer selection (process multiple frames at once)
- [ ] preserve layer names from source
- [ ] component creation mode (each asset becomes a component)
- [ ] color palette extraction from detected assets
- [ ] integration with figma variables for theming output

## future ideas

- [ ] wasm-based processing for 10x speed on large images
- [ ] api endpoint for programmatic splitting
- [ ] browser extension for splitting images on any webpage
- [ ] sketch/illustrator plugin ports
- [ ] training a lightweight ml model for better segmentation
- [ ] collaborative splitting (multiple users mark regions)
