type Params = { mode: 'Auto-detect' | 'Split freely'; tolerance: number; padding: number; removeBg: boolean; autoLayout: boolean; layoutGap: number; vectorize: boolean }
type CropRegion = { x: number; y: number; w: number; h: number }
type RunMsg =
  | { type: 'action'; id: string; params: Partial<Params>; manualRegions?: CropRegion[] }
  | { type: 'resize'; height: number }
  | { type: 'crops-ready'; crops: string[]; svgs: string[]; regions: CropRegion[]; imageWidth: number; imageHeight: number }
  | { type: 'load-preview' }

const TOOL_ID = '237b554e-2caf-458e-930a-4e94ea1eab33'
const DISPLAY_NAME = 'Pack splitter'
const ATTACH_KEY = TOOL_ID + ':params'
const DEFAULTS: Params = { mode: 'Auto-detect', tolerance: 25, padding: 6, removeBg: true, autoLayout: true, layoutGap: 16, vectorize: false }
let latestParams: Params = DEFAULTS
let isExecuting = false

function finiteNumber(value: unknown, fallback: number): number {
  const num = Number(value)
  return Number.isFinite(num) ? num : fallback
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function normalizeParams(input: Partial<Params> | null | undefined): Params {
  const value = input ?? {}
  return {
    mode: ['Auto-detect', 'Split freely'].includes(String(value.mode))
      ? (String(value.mode) as Params['mode'])
      : DEFAULTS.mode,
    tolerance: clamp(finiteNumber(value.tolerance, DEFAULTS.tolerance), 0, 100),
    padding: clamp(finiteNumber(value.padding, DEFAULTS.padding), 0, 64),
    removeBg: typeof value.removeBg === 'boolean' ? value.removeBg : DEFAULTS.removeBg,
    autoLayout: typeof value.autoLayout === 'boolean' ? value.autoLayout : DEFAULTS.autoLayout,
    layoutGap: clamp(finiteNumber(value.layoutGap, DEFAULTS.layoutGap), 0, 100),
    vectorize: typeof value.vectorize === 'boolean' ? value.vectorize : DEFAULTS.vectorize,
  }
}

function htmlEscapeAttribute(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
}

function safeParseParams(s: string): Params | null {
  try {
    const obj = JSON.parse(s)
    if (typeof obj?.tolerance !== 'number') return null
    return normalizeParams(obj)
  } catch {
    return null
  }
}

function singleSelectedTarget(): SceneNode | null {
  const sel = figma.currentPage.selection
  return sel.length === 1 ? (sel[0] ?? null) : null
}

function pushActionStates(): void {
  const target = singleSelectedTarget()
  const enabled = target != null && !isExecuting
  const status = isExecuting ? 'Processing…' : enabled ? 'Layer selected' : 'Select a layer'
  figma.ui.postMessage({
    type: 'action-state',
    actions: { split: { enabled, label: 'Extract assets', status } },
  })
}

function refreshSelection(): void {
  if (isExecuting) return
  const target = singleSelectedTarget()
  if (target) {
    const stored = safeParseParams(target.getPluginData(ATTACH_KEY))
    if (stored) {
      latestParams = stored
      figma.ui.postMessage({ type: 'params-change', params: latestParams })
    }
  }
  pushActionStates()
}

function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

async function sendPreviewToUI(): Promise<void> {
  const target = singleSelectedTarget()
  if (!target) return
  try {
    const bytes = await target.exportAsync({ format: 'PNG' })
    figma.ui.postMessage({ type: 'preview-image', bytes: Array.from(bytes) })
  } catch {
    // ignore
  }
}

let cropResolver:
  | ((data: { crops: string[]; svgs: string[]; regions: CropRegion[]; imageWidth: number; imageHeight: number }) => void)
  | null = null

async function runSplit(params: Params, target: SceneNode, manualRegions?: CropRegion[]): Promise<void> {
  isExecuting = true
  pushActionStates()
  const notifs: Array<{ cancel: () => void }> = []
  const notify = (msg: string) => {
    for (const n of notifs) { try { n.cancel() } catch { /* ok */ } }
    notifs.length = 0
    const h = figma.notify(msg, { timeout: 60000 })
    notifs.push(h)
  }
  try {
    notify('Exporting layer…')
    let bytes: Uint8Array
    try {
      bytes = await target.exportAsync({ format: 'PNG' })
    } catch {
      figma.notify('Could not export this layer as an image', { error: true })
      return
    }

    const actionLabel = params.mode === 'Split freely' ? 'Cropping selections' : 'Removing background and detecting assets'
    notify(actionLabel + '…')

    figma.ui.postMessage({
      type: 'process-image',
      bytes: Array.from(bytes),
      tolerance: params.tolerance,
      padding: params.padding,
      removeBg: params.removeBg,
      mode: params.mode,
      manualRegions: manualRegions || [],
      vectorize: params.vectorize,
    })

    const { crops, svgs, regions, imageWidth, imageHeight } = await new Promise<{
      crops: string[]
      svgs: string[]
      regions: CropRegion[]
      imageWidth: number
      imageHeight: number
    }>((resolve) => {
      cropResolver = resolve
    })
    cropResolver = null

    if (crops.length === 0) {
      figma.notify('No assets found — try adjusting tolerance or drawing selections', { error: true })
      return
    }

    notify(`Placing ${crops.length} asset${crops.length === 1 ? '' : 's'}${params.vectorize ? ' as vectors' : ''}…`)

    const parentNode = target.parent
    if (!parentNode || !('appendChild' in parentNode)) {
      figma.notify('Cannot place results here', { error: true })
      return
    }

    const scaleX = target.width / imageWidth
    const scaleY = target.height / imageHeight

    const resultFrame = figma.createFrame()
    resultFrame.name = (target.name || 'Pack') + ' (extracted)'
    resultFrame.fills = []
    resultFrame.clipsContent = false

    if (params.autoLayout) {
      resultFrame.layoutMode = 'HORIZONTAL'
      resultFrame.itemSpacing = params.layoutGap
      resultFrame.counterAxisAlignItems = 'CENTER'
      resultFrame.primaryAxisSizingMode = 'AUTO'
      resultFrame.counterAxisSizingMode = 'AUTO'
      resultFrame.layoutWrap = 'WRAP'
    } else {
      const gap = params.layoutGap
      const totalW = regions.reduce((s, r) => s + Math.round(r.w * scaleX), 0) + (crops.length - 1) * gap
      const totalH = Math.max(...regions.map(r => Math.round(r.h * scaleY)))
      resultFrame.resize(Math.max(1, totalW), Math.max(1, totalH))
    }

    ;(parentNode as FrameNode).appendChild(resultFrame)
    resultFrame.x = target.x + target.width + 32
    resultFrame.y = target.y

    let cursorX = 0
    for (let i = 0; i < crops.length; i++) {
      const region = regions[i]
      const nodeW = Math.max(1, Math.round(region.w * scaleX))
      const nodeH = Math.max(1, Math.round(region.h * scaleY))

      let assetNode: SceneNode
      if (params.vectorize && svgs[i]) {
        const svgNode = figma.createNodeFromSvg(svgs[i])
        svgNode.name = (target.name || 'Asset') + ' ' + String(i + 1)
        svgNode.resize(nodeW, nodeH)
        assetNode = svgNode
      } else {
        const imgHandle = figma.createImage(base64ToBytes(crops[i]))
        const assetFrame = figma.createFrame()
        assetFrame.name = (target.name || 'Asset') + ' ' + String(i + 1)
        assetFrame.resize(nodeW, nodeH)
        assetFrame.fills = [{ type: 'IMAGE', scaleMode: 'FILL', imageHash: imgHandle.hash }]
        assetFrame.clipsContent = false
        assetNode = assetFrame
      }

      resultFrame.appendChild(assetNode)

      if (!params.autoLayout) {
        assetNode.x = cursorX
        const totalH = Math.max(...regions.map(r => Math.round(r.h * scaleY)))
        assetNode.y = Math.round((totalH - nodeH) / 2)
        cursorX += nodeW + params.layoutGap
      }
    }

    if (!params.autoLayout) {
      resultFrame.resize(Math.max(1, cursorX - params.layoutGap), resultFrame.height)
    }

    target.setPluginData(ATTACH_KEY, JSON.stringify(params))
    resultFrame.setRelaunchData({ [TOOL_ID]: DISPLAY_NAME })
    figma.root.setRelaunchData({ [TOOL_ID]: DISPLAY_NAME })
    for (const n of notifs) { try { n.cancel() } catch { /* ok */ } }
    figma.viewport.scrollAndZoomIntoView([resultFrame])
    figma.notify(`Extracted ${crops.length} asset${crops.length === 1 ? '' : 's'}${params.vectorize ? ' as vectors' : ''}`)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    figma.notify(message, { error: true })
    throw error
  } finally {
    for (const n of notifs) { try { n.cancel() } catch { /* ok */ } }
    isExecuting = false
    pushActionStates()
  }
}

const initialTarget = singleSelectedTarget()
const initialStored = initialTarget ? safeParseParams(initialTarget.getPluginData(ATTACH_KEY)) : null
const initialParams: Params = initialStored ?? DEFAULTS
latestParams = initialParams

let html = __html__
html = html.replace(/(id="mode"[^>]*\bvalue=")[^"]*(")/, '$1' + htmlEscapeAttribute(String(initialParams.mode)) + '$2')
html = html.replace(/(id="tolerance"[^>]*\bvalue=")[^"]*(")/, '$1' + htmlEscapeAttribute(String(initialParams.tolerance)) + '$2')
html = html.replace(/(id="padding"[^>]*\bvalue=")[^"]*(")/, '$1' + htmlEscapeAttribute(String(initialParams.padding)) + '$2')
html = html.replace(/(id="layout-gap"[^>]*\bvalue=")[^"]*(")/, '$1' + htmlEscapeAttribute(String(initialParams.layoutGap)) + '$2')

figma.root.setRelaunchData({ [TOOL_ID]: DISPLAY_NAME })
figma.showUI(html, { width: 280, height: 320 })
pushActionStates()
void sendPreviewToUI()

figma.on('selectionchange', () => {
  refreshSelection()
  void sendPreviewToUI()
})

figma.ui.onmessage = (msg: RunMsg) => {
  if (msg.type === 'resize') {
    const resizeMsg = msg as { type: 'resize'; height: number }
    figma.ui.resize(280, Math.max(120, Math.min(900, Math.round(resizeMsg.height))))
    return
  }
  if (msg.type === 'load-preview') {
    void sendPreviewToUI()
    return
  }
  if (msg.type === 'crops-ready') {
    if (cropResolver) {
      const m = msg as { type: 'crops-ready'; crops: string[]; svgs: string[]; regions: CropRegion[]; imageWidth: number; imageHeight: number }
      cropResolver({ crops: m.crops, svgs: m.svgs, regions: m.regions, imageWidth: m.imageWidth, imageHeight: m.imageHeight })
    }
    return
  }
  if (msg.type === 'action' && msg.id === 'split') {
    const target = singleSelectedTarget()
    if (!target || isExecuting) return
    latestParams = normalizeParams(msg.params)
    void runSplit(latestParams, target, msg.manualRegions)
    return
  }
}
