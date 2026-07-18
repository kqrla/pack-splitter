# use cases

## sticker sheet extraction

**scenario**: you have a sticker sheet png with 20+ stickers scattered on a white background at various angles and sizes.

**workflow**:
1. select the sticker sheet layer (figma) or drop the image (web)
2. set tolerance to ~25-30 to catch the white background
3. enable "remove interior" to clear white gaps between overlapping stickers
4. adjust padding to 4-8px to keep a clean edge
5. click extract → get 20+ individual sticker images in an auto-layout frame

## sprite sheet splitting

**scenario**: game assets on a colored background — characters, items, UI elements — not in a uniform grid.

**workflow**:
1. auto-detect mode picks up each sprite
2. increase tolerance if the background is noisy or has gradients
3. output with vectorize enabled if you want scalable game assets
4. extract into auto-layout for easy drag-and-drop into your design

## icon pack separation

**scenario**: a flat png export from an icon set where icons are arranged loosely with spacing.

**workflow**:
1. auto-detect with low tolerance (10-15) since icons are usually solid color on white
2. small padding (2-4px) since icons are compact
3. vectorize enabled → each icon becomes an editable vector path in figma
4. result: individual vector icons ready for your component library

## product photo cutout batch

**scenario**: multiple product photos on a white studio background in a single composite image.

**workflow**:
1. tolerance 20-35 depending on shadow intensity
2. disable interior removal (products may have white areas)
3. larger padding (8-12px) to preserve shadows at edges
4. extract as png fills for product cards

## hand-drawn sketch extraction

**scenario**: a scanned page with multiple sketches, doodles, or handwritten notes scattered around.

**workflow**:
1. high tolerance (40-60) to handle paper texture and pencil lightness
2. enable interior removal to clean up paper-colored areas
3. padding 6-10px
4. vectorize for clean scalable outlines
5. result: individual sketch vector assets

## pattern tile creation

**scenario**: you want to extract individual motifs from a pattern swatch to create a repeating pattern in figma.

**workflow**:
1. use "split freely" mode
2. draw rectangles around each unique motif
3. enable bg removal within each selection
4. extract → arrange extracted motifs into your pattern tile

## badge / pin collection

**scenario**: a photograph of enamel pins or badges on a display board.

**workflow**:
1. tolerance 30-40 (background may not be perfectly uniform)
2. interior removal OFF (pins have varied colors)
3. padding 6-8px
4. auto-detect separates each pin
5. use as reference images in your design file

## ui component screenshot decomposition

**scenario**: a screenshot of a UI with multiple cards, buttons, or components you want to reference individually.

**workflow**:
1. "split freely" mode — draw rectangles around each component
2. remove background disabled (preserve the component's own background)
3. extract as individual reference frames
4. place next to your design for comparison

## social media asset batch

**scenario**: a marketing team delivers a figma frame with 8 social media graphics arranged loosely.

**workflow**:
1. select the frame containing all graphics
2. auto-detect with tolerance tuned to the canvas color
3. extract into auto-layout with 16px gap
4. each post is now a separate frame ready for export

## collage deconstruction

**scenario**: a mood board or collage image where you want to extract individual photos/elements.

**workflow**:
1. "split freely" for precise control over what to extract
2. or auto-detect if elements have clear separation
3. remove background enabled if elements float on a solid color
4. result: individual mood board assets for remix
