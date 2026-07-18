# features

## background removal

### edge-sampling flood fill

the algorithm samples border pixels (top, bottom, left, right edges) to determine the dominant background color. it then flood-fills from all edge pixels, marking any color-similar pixel as background.

- **tolerance slider** (0–100): controls how similar a pixel must be to the background color to be removed. higher = more aggressive removal.
- **interior removal toggle**: when enabled, marks ALL background-colored pixels as transparent — not just those connected to edges. this handles white gaps between stickers, holes in shapes, etc.

### how tolerance maps to color distance

tolerance is multiplied by 2.21 to produce a maximum euclidean distance in rgb space. at tolerance=25, pixels within ~55 units of the background color are removed. at tolerance=50, pixels within ~110 units are removed.

## object detection

### connected-component labeling

after background removal, the remaining opaque pixels are grouped into connected components using a flood-fill BFS. each component represents one detected asset.

- **minimum size filter**: components smaller than 0.3% of total image area are discarded (noise, artifacts)
- **padding**: each bounding box is expanded by the padding value to include nearby pixels that might be part of the asset
- **sort order**: detected regions are sorted top-to-bottom, left-to-right

## split modes

### auto-detect mode

- upload/select an image
- adjust tolerance and padding
- see live preview of detected assets with dashed bounding boxes
- click extract to separate all detected objects

### split freely mode

- upload/select an image
- draw rectangles on the canvas to define custom crop regions
- optionally enable background removal within selections
- extract just the drawn regions

## live preview

the auto-detect mode shows a real-time preview that updates as you drag sliders:

- downsampled to 256px max dimension for speed
- shows the cleaned (bg-removed) image
- overlays dashed blue bounding boxes for each detected asset
- displays count: "N assets detected"
- debounced via requestAnimationFrame for smooth interaction

## vectorize

when enabled, each extracted asset is converted from raster to vector:

1. build a binary alpha grid (opaque vs transparent)
2. run marching squares to generate contour line segments
3. chain segments into closed paths
4. simplify paths using douglas-peucker (tolerance: 1px)
5. output as svg `<path>` elements

in figma: creates vector nodes via `figma.createNodeFromSvg()`
in web: downloads as .svg files instead of .png

## output layout

### auto-layout (figma)

extracted assets are placed in a frame with:
- `layoutMode: 'HORIZONTAL'`
- `layoutWrap: 'WRAP'`
- configurable item spacing (gap slider)
- auto-sizing on both axes
- center-aligned on cross axis

### manual layout (figma)

when auto-layout is off, assets are placed in a horizontal row with the specified gap, vertically centered.

### web output

assets appear in a gallery strip. click individual assets to download, or use "download all" for batch export.

## ui design

- **font**: poppins (google fonts)
- **text style**: all lowercase via `text-transform: lowercase`
- **theme**: dark mode with accent blue (#0d99ff)
- **responsive**: sidebar collapses on narrow viewports (web app)
