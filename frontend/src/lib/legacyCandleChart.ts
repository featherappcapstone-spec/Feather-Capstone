// src/lib/legacyCandleChart.ts

// @ts-nocheck

let canvas: HTMLCanvasElement | null = null
let ctx: CanvasRenderingContext2D | null = null

const candleGreen = "#388E3C"
const candleRed = "#D32F2F"
const wickColour = "#EEEEEE"
const uiGreen = "#2BD56A"
const uiRed = "#FF3E51"
const uiGrey = "#ffffff"
const chartLineColour = "#37474F"
const chartBackground = "#101829"
const maxCandleWidth = 80
const minCandleWidth = 1
const smallButtonWidth = 30
const smallButtonHeight = 20
const largeButtonWidth = 35
const largeButtonHeight = 25
const keysPressed: Record<string, boolean> = {}

let mx = 0,
  my = 0,
  mxPrev = 0,
  myPrev = 0
let mouseDownAnchorY = -1
let moveMouseY = false
let wickWidth = 1
let candleWidth = 5
let buttonAlpha = 1
let md = false
let mu = false
let wheelDeltaY = 0
let kd = false
let cameraX = 0
let cameraY = 0
let userScaleY = 0

class Candle {
  high: number
  open: number
  close: number
  low: number
  timestamp: number | string

  constructor(
    high: number | string,
    open: number | string,
    close: number | string,
    low: number | string,
    timestamp: number | string
  ) {
    this.high = Number(high)
    this.open = Number(open)
    this.close = Number(close)
    this.low = Number(low)
    this.timestamp = timestamp
  }

  render(x: number, candleArrayLow: number, candleArrayHigh: number) {
    if (!canvas || !ctx) return

    let margin = canvas.height * 0.05 // 5 percent margin
    let bottomMargin = canvas.height - margin
    let scaleY = (canvas.height - margin * 2) / ((candleArrayHigh - candleArrayLow) + userScaleY)

    let highY = bottomMargin - (this.high - candleArrayLow) * scaleY
    let lowY = bottomMargin - (this.low - candleArrayLow) * scaleY
    let openY = bottomMargin - (this.open - candleArrayLow) * scaleY
    let closeY = bottomMargin - (this.close - candleArrayLow) * scaleY

    ctx.fillStyle = wickColour
    ctx.fillRect(x + Math.floor(candleWidth / 2), highY + cameraY, wickWidth, lowY - highY)

    // perfect doji
    if (this.open === this.close) {
      closeY++
    } else {
      ctx.fillStyle = this.close >= this.open ? candleGreen : candleRed
    }

    ctx.fillRect(x, openY + cameraY, candleWidth, closeY - openY)
  }
}

class Button {
  x: number
  y: number
  w: number
  h: number
  str: string

  constructor(x: number, y: number, w: number, h: number, str: string) {
    this.x = x
    this.y = y
    this.w = w
    this.h = h
    this.str = str
  }

  render(radi: number[]) {
    if (!ctx) return
    const textWidth = ctx.measureText(this.str).width
    const textHeight = 17

    ctx.strokeStyle = "red"
    ctx.beginPath()
    // @ts-ignore
    ctx.roundRect(this.x, this.y, this.w, this.h, radi)
    ctx.fill()

    ctx.font = textHeight + "px monospace"
    ctx.fillStyle = "#000000"
    ctx.fillText(
      this.str,
      this.x + this.w / 2 - textWidth / 2,
      this.y + this.h / 2 + textHeight / 3
    )
  }

  mouseOver(mx: number, my: number) {
    return (
      mx >= this.x &&
      mx <= this.x + this.w &&
      my >= this.y &&
      my <= this.y + this.h
    )
  }
}

function findLowHigh(candleArray: Candle[]) {
  let high = candleArray[0].high
  let low = candleArray[0].low

  for (let i = 0; i < candleArray.length; i++) {
    if (candleArray[i].high > high) high = candleArray[i].high
    else if (candleArray[i].low < low) low = candleArray[i].low
  }

  return [low, high]
}

function clamp(n: number, min: number, max: number) {
  if (n < min) return minCandleWidth
  if (n > max) return maxCandleWidth
  return n
}

function lerp(start: number, end: number, amount: number) {
  return start + amount * (end - start)
}

/* using log for scaling so zooming isn't painfully linear */
function zoomIn() {
  if (!canvas) return

  let oldSpacing = candleWidth + candleWidth / 2
  let centerCandle = cameraX + canvas.width / 2 / oldSpacing

  candleWidth += Math.log(candleWidth + 1) * 2
  candleWidth = clamp(candleWidth, minCandleWidth, maxCandleWidth)

  let newSpacing = candleWidth + candleWidth / 2
  cameraX = centerCandle - canvas.width / 2 / newSpacing
}

function zoomOut() {
  if (!canvas) return

  let oldSpacing = candleWidth + candleWidth / 2
  let centerCandle = cameraX + canvas.width / 2 / oldSpacing

  candleWidth -= Math.log(candleWidth + 1) * 2
  candleWidth = clamp(candleWidth, minCandleWidth, maxCandleWidth)

  let newSpacing = candleWidth + candleWidth / 2
  cameraX = centerCandle - canvas.width / 2 / newSpacing
}

let candleArray: Candle[] = []

let candleSpacing = 0
let startingCandle = 0
let endingCandle = 0
let o: number | undefined,
  h: number | undefined,
  l: number | undefined,
  c: number | undefined

const fps = 60
const msps = 1000 / fps

let plusButton: Button
let minusButton: Button
let leftButton: Button
let rightButton: Button
let resetButton: Button
let expandButton: Button

let candleArrayOldLength = 0
let scrollVelocity = 0
let loopId: any = null
let handlersAttached = false

function update() {
  // this was empty in main.js; keep for compatibility
}

// ----- INPUT / UPDATE / RENDER -----

let _input = function () {
  if (!canvas) return

  // mouse up
  if (mu) {
    mouseDownAnchorY = -1
    moveMouseY = false

    if (plusButton.mouseOver(mx, my)) zoomIn()
    if (minusButton.mouseOver(mx, my)) zoomOut()

    if (resetButton.mouseOver(mx, my)) {
      userScaleY = 0
      candleWidth = 5
      candleSpacing = candleWidth + candleWidth / 2
      cameraX = candleArray.length - canvas.width / candleSpacing
      cameraY = 0
      startingCandle = Math.floor(cameraX)
      endingCandle = candleArray.length
    }

    if (expandButton.mouseOver(mx, my)) {
      while (candleWidth >= 3) zoomOut()
    }
  }

  // mouse wheel
if (wheelDeltaY !== 0) {
  let direction = Math.sign(wheelDeltaY) // -1 = scroll up, +1 = scroll down

  let oldSpacing = candleWidth + candleWidth / 2
  let centerCandle = cameraX + canvas.width / 2 / oldSpacing

  let velocity = Math.log(candleWidth + 1) / 7

  if (direction > 0) {
    // scroll DOWN → zoom OUT
    velocity = -velocity
  } else {
    // scroll UP → zoom IN
    velocity = +velocity
  }

  candleWidth += velocity
  candleWidth = clamp(candleWidth, minCandleWidth, maxCandleWidth)

  let newSpacing = candleWidth + candleWidth / 2
  cameraX = centerCandle - canvas.width / 2 / newSpacing
}


  // key down
  if (kd) {
    if (keysPressed["_"]) userScaleY += 0.05
    if (keysPressed["+"]) userScaleY -= 0.05
    if (keysPressed["-"]) zoomOut()
    if (keysPressed["="]) zoomIn()

    if (keysPressed["ArrowRight"])
      mx += keysPressed["Shift"] ? candleSpacing * 5 : candleSpacing
    if (keysPressed["ArrowLeft"])
      mx -= keysPressed["Shift"] ? candleSpacing * 5 : candleSpacing
    if (keysPressed["ArrowDown"])
      my += keysPressed["Shift"] ? canvas.height * 0.2 : canvas.height * 0.01
    if (keysPressed["ArrowUp"]) {
      my -= keysPressed["Shift"] ? canvas.height * 0.2 : canvas.height * 0.01
      if (my < 0) my = 0
    }
  }
}

let _update = function () {
  if (!canvas) return

  canvas.style.cursor = "crosshair"

  update() // no-op placeholder

  // check if user is trying to move the camera y
  if (mouseDownAnchorY >= 0) {
    if (Math.abs(my - mouseDownAnchorY) > 150 && !moveMouseY) {
      cameraY += my - mouseDownAnchorY
      moveMouseY = true
    }
    if (moveMouseY) cameraY += my - myPrev
  }

  // clamp stuff
  if (userScaleY < -0.25) userScaleY = -0.25
  candleWidth = clamp(candleWidth, minCandleWidth, maxCandleWidth)
  candleSpacing = candleWidth + candleWidth / 2

  if (md) {
    canvas.style.cursor = "grab"
    scrollVelocity = (mx - mxPrev) / candleSpacing
    cameraX -= scrollVelocity
  }

  if (!md) cameraX -= scrollVelocity
  scrollVelocity *= 0.98

  if (cameraX < 0) cameraX = 0
  startingCandle = Math.floor(cameraX)
  endingCandle = canvas.width / candleSpacing + cameraX + 1

  // allow users to scroll through chart on keyboard
  if (mx > canvas.width) {
    cameraX += 1
    mx = canvas.width
  }
  if (mx < 0) {
    cameraX -= 1
    mx = 0
  }

  // update button pos smoothly
  if (
    mx >= plusButton.x &&
    mx <= expandButton.x + expandButton.w &&
    my >= plusButton.y &&
    my <= plusButton.y + plusButton.h
  ) {
    buttonAlpha = 1
    minusButton.w = lerp(minusButton.w, largeButtonWidth, 0.2)
    minusButton.h = lerp(minusButton.h, largeButtonHeight, 0.2)
    plusButton.w = lerp(plusButton.w, largeButtonWidth, 0.2)
    plusButton.h = lerp(plusButton.h, largeButtonHeight, 0.2)
  } else {
    buttonAlpha = 0.8
    minusButton.w = lerp(minusButton.w, smallButtonWidth, 0.2)
    minusButton.h = lerp(minusButton.h, smallButtonHeight, 0.2)
    plusButton.w = lerp(plusButton.w, smallButtonWidth, 0.2)
    plusButton.h = lerp(plusButton.h, smallButtonHeight, 0.2)
  }

  if (leftButton.mouseOver(mx, my) && md)
    cameraX -= (canvas.width / candleSpacing) * 0.005
  if (rightButton.mouseOver(mx, my) && md)
    cameraX += (canvas.width / candleSpacing) * 0.005

  // scroll if new data && last candle is on screen
  if (candleArray.length < endingCandle && candleArrayOldLength < candleArray.length)
    cameraX++

  // clamping
  if (endingCandle > candleArray.length) endingCandle = candleArray.length
  if (cameraX > candleArray.length - 1) cameraX = candleArray.length - 1

  startingCandle = Math.floor(cameraX)
}

let _render = function () {
  if (!canvas || !ctx) return

  // cull candles out of view
  let visibleCandles = candleArray.slice(startingCandle, endingCandle)
  if (visibleCandles.length === 0) return

  let [visibleCandlesLow, visibleCandlesHigh] = findLowHigh(visibleCandles)

  // background
  ctx.fillStyle = chartBackground
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.strokeStyle = chartLineColour
  ctx.setLineDash([4, 3])
  ctx.lineWidth = 1

  for (let i = 0; i < canvas.width; i += 30) {
    ctx.beginPath()
    ctx.moveTo(i, 0)
    ctx.lineTo(i, canvas.height)
    ctx.stroke()
  }

  for (let i = 0; i < canvas.height; i += 30) {
    ctx.beginPath()
    ctx.moveTo(0, i)
    ctx.lineTo(canvas.width, i)
    ctx.stroke()
  }

  // last price line
  let margin = canvas.height * 0.05
  let bottomMargin = canvas.height - margin
  let scaleY =
    (canvas.height - margin * 2) / ((visibleCandlesHigh - visibleCandlesLow) + userScaleY)

  let lastPrice = candleArray[candleArray.length - 1]
  let lastPriceY =
    bottomMargin -
    ((lastPrice.close - visibleCandlesLow) * scaleY) +
    cameraY

  ctx.strokeStyle =
    lastPrice.close >= lastPrice.open ? candleGreen : candleRed

  if (lastPrice.close === lastPrice.open) ctx.strokeStyle = wickColour

  ctx.beginPath()
  ctx.moveTo(0, lastPriceY)
  ctx.lineTo(canvas.width, lastPriceY)
  ctx.stroke()

  let ohlcColour = ""

  for (let i = 0; i < visibleCandles.length; i++) {
    let xPos =
      i * candleSpacing -
      (cameraX - startingCandle) * candleSpacing +
      candleWidth / 4

    visibleCandles[i].render(xPos, visibleCandlesLow, visibleCandlesHigh)

    let candleX =
      i * candleSpacing -
      (cameraX - startingCandle) * candleSpacing

    if (
      (mx > candleX && mx <= candleX + candleSpacing) ||
      i === visibleCandles.length
    ) {
      o = visibleCandles[i].open
      h = visibleCandles[i].high
      l = visibleCandles[i].low
      c = visibleCandles[i].close

      if (visibleCandles[i].open === visibleCandles[i].close) ohlcColour = uiGrey
      else
        ohlcColour =
          visibleCandles[i].close >= visibleCandles[i].open ? uiGreen : uiRed

      // mouse x line
      let lineX =
        candleX + candleWidth / 4 + candleWidth / 2
      ctx.strokeStyle = "#ffffff"
      ctx.beginPath()
      ctx.moveTo(lineX, 0)
      ctx.lineTo(lineX, canvas.height)
      ctx.stroke()
    }
  }

  // mouse y line
  ctx.strokeStyle = "#ffffff"
  ctx.beginPath()
  ctx.moveTo(0, my + 0.5)
  ctx.lineTo(canvas.width, my + 0.5)
  ctx.stroke()

  // y scrubber text
  let valueAtMouse =
    visibleCandlesLow + ((bottomMargin - my) + userScaleY) / scaleY
  let yScrubberLabel = valueAtMouse.toFixed(2)

  ctx.font = "16px Arial"
  let textWidth = ctx.measureText(yScrubberLabel).width

  ctx.fillStyle = "#ffffff"
  ctx.beginPath()
  // @ts-ignore
  ctx.roundRect(
    canvas.width - textWidth - 10,
    my,
    textWidth + 10,
    25,
    [0, 0, 0, 10]
  )
  ctx.fill()

  ctx.fillStyle = "#000000"
  ctx.fillText(yScrubberLabel, canvas.width - textWidth - 5, my + 17)

  // render ohlc box
  if (o !== undefined) {
    const ohlcString = `O: ${o.toFixed(2)} H: ${h!.toFixed(2)} L: ${l!.toFixed(
      2
    )} C: ${c!.toFixed(2)}`

    ctx.font = "16px Arial"
    textWidth = ctx.measureText(ohlcString).width

    let oStrLen = ctx.measureText(o.toFixed(2) + "").width
    let hStrLen = ctx.measureText(h!.toFixed(2) + "").width
    let lStrLen = ctx.measureText(l!.toFixed(2) + "").width

    let textCursor = 25

    ctx.fillStyle = "rgba(25, 25, 25, 0.6)"
    ctx.beginPath()
    // @ts-ignore
    ctx.roundRect(20, 32, textWidth + 10, 25, 5)
    ctx.fill()

    ctx.fillStyle = uiGrey
    ctx.fillText("O: ", textCursor, 50)
    textCursor += ctx.measureText("O: ").width

    ctx.fillStyle = ohlcColour
    ctx.fillText(o.toFixed(2), textCursor, 50)
    textCursor += oStrLen

    ctx.fillStyle = uiGrey
    ctx.fillText(" H: ", textCursor, 50)
    textCursor += ctx.measureText(" H: ").width

    ctx.fillStyle = ohlcColour
    ctx.fillText(h!.toFixed(2), textCursor, 50)
    textCursor += hStrLen

    ctx.fillStyle = uiGrey
    ctx.fillText(" C: ", textCursor, 50)
    textCursor += ctx.measureText(" C: ").width

    ctx.fillStyle = ohlcColour
    ctx.fillText(c!.toFixed(2), textCursor, 50)
    textCursor += lStrLen

    ctx.fillStyle = uiGrey
    ctx.fillText(" L: ", textCursor, 50)
    textCursor += ctx.measureText(" L: ").width

    ctx.fillStyle = ohlcColour
    ctx.fillText(l!.toFixed(2), textCursor, 50)
  }

  // center buttons
  let buttonOffsets =
    canvas.width / 2 -
    (plusButton.w +
      minusButton.w +
      leftButton.w +
      rightButton.w +
      expandButton.w +
      20 * 3) /
      2

  plusButton.y = canvas.height - plusButton.h - 20
  plusButton.x = buttonOffsets + 1

  minusButton.y = canvas.height - plusButton.h - 20
  minusButton.x = buttonOffsets + plusButton.w

  leftButton.x = minusButton.x + minusButton.w + 11
  leftButton.y = minusButton.y
  leftButton.h = minusButton.h
  leftButton.w = minusButton.w

  rightButton.x = leftButton.x + leftButton.w
  rightButton.y = leftButton.y
  rightButton.h = leftButton.h
  rightButton.w = leftButton.w

  resetButton.x = rightButton.x + rightButton.w + 10
  resetButton.y = rightButton.y
  resetButton.h = rightButton.h
  resetButton.w = rightButton.w

  expandButton.x = resetButton.x + resetButton.w + 10
  expandButton.y = resetButton.y
  expandButton.w = resetButton.w
  expandButton.h = resetButton.h

  // render buttons
  ctx.fillStyle = `rgba(255, 255, 255, ${buttonAlpha})`
  plusButton.render([3, 0, 0, 3])

  ctx.fillStyle = `rgba(255, 255, 255, ${buttonAlpha})`
  minusButton.render([0, 3, 3, 0])

  ctx.fillStyle = "#000000"
  ctx.fillRect(buttonOffsets + plusButton.w, plusButton.y, 1, plusButton.h)

  ctx.fillStyle = `rgba(255, 255, 255, ${buttonAlpha})`
  leftButton.render([3, 0, 0, 3])

  ctx.fillStyle = `rgba(255, 255, 255, ${buttonAlpha})`
  rightButton.render([0, 3, 3, 0])

  ctx.fillStyle = "#000000"
  ctx.fillRect(leftButton.x + leftButton.w, leftButton.y, 1, plusButton.h)

  ctx.fillStyle = `rgba(255, 255, 255, ${buttonAlpha})`
  resetButton.render([3, 3, 3, 3])

  ctx.fillStyle = `rgba(255, 255, 255, ${buttonAlpha})`
  expandButton.render([3, 3, 3, 3])

  if (
    minusButton.mouseOver(mx, my) ||
    plusButton.mouseOver(mx, my) ||
    leftButton.mouseOver(mx, my) ||
    rightButton.mouseOver(mx, my) ||
    resetButton.mouseOver(mx, my) ||
    expandButton.mouseOver(mx, my)
  ) {
    canvas.style.cursor = "pointer"
  }
}

// ----- EVENT HANDLERS -----

function attachInputHandlers() {
  if (handlersAttached) return
  handlersAttached = true

  window.addEventListener("mousemove", function (event) {
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    mx = event.clientX - rect.left
    my = event.clientY - rect.top
  })

  window.addEventListener("mousedown", () => {
    md = true
    mouseDownAnchorY = my
  })

  window.addEventListener("mouseup", () => {
    md = false
    mu = true
  })

  window.addEventListener(
    "wheel",
    (event: WheelEvent) => {
      if (!canvas) return
      if (event.target !== canvas && !(event.target as HTMLElement).closest("canvas")) return
      event.preventDefault()
      wheelDeltaY = event.deltaY
    },
    { passive: false }
  )

  window.addEventListener("keydown", (event) => {
    keysPressed[event.key] = true
    kd = true
  })

  window.addEventListener("keyup", (event) => {
    keysPressed[event.key] = false
  })
}

// ----- PUBLIC API -----

export interface LegacyCandleInput {
  open: number
  high: number
  low: number
  close: number
  volume?: number
  timestamp: number | string
  vwap?: number
  transactions?: number
  otc?: boolean
}

interface InitOptions {
  interactive?: boolean
}

export function initLegacyCandleChart(
  canvasEl: HTMLCanvasElement,
  candles: LegacyCandleInput[],
  options?: InitOptions
) {
  const interactive = options?.interactive ?? true

  canvas = canvasEl
  ctx = canvas.getContext('2d')

  if (!ctx) return

  const rect = canvas.getBoundingClientRect()
  canvas.width = rect.width || 800
  canvas.height = rect.height || 600

  // reset globals so every init starts fresh
  mx = 0
  my = 0
  mxPrev = 0
  myPrev = 0
  mouseDownAnchorY = -1
  moveMouseY = false
  wickWidth = 1
  candleWidth = 5
  buttonAlpha = 1
  md = false
  mu = false
  wheelDeltaY = 0
  kd = false
  cameraX = 0
  cameraY = 0
  userScaleY = 0
  scrollVelocity = 0

  // turn incoming data into Candle objects
  candleArray = candles.map((c) => {
    const ts = c.timestamp ?? ''
    return new Candle(c.high, c.open, c.close, c.low, ts)
  })

  if (candleArray.length === 0) return

  // In PREVIEW mode we want all candles visible in the small box,
  // so we auto-compute a narrow candle width.
  if (!interactive) {
    const visibleCandles = candleArray.length
    if (visibleCandles > 0) {
      const targetBodyWidth = (canvas.width * 0.8) / visibleCandles
      const computedWidth = Math.max(targetBodyWidth, minCandleWidth)
      candleWidth = clamp(computedWidth, minCandleWidth, maxCandleWidth)
    }
  }

  candleSpacing = candleWidth + candleWidth / 2

  // Where to start the camera:
  // - interactive: like original → focus on rightmost part of chart
  // - preview: from the beginning, so the whole dataset is shown
  if (interactive) {
    cameraX = candleArray.length - canvas.width / candleSpacing
    if (cameraX < 0) cameraX = 0
  } else {
    cameraX = 0
  }

  startingCandle = Math.floor(cameraX)
  endingCandle = candleArray.length
  candleArrayOldLength = candleArray.length

  plusButton = new Button(0, 0, smallButtonWidth, smallButtonHeight, '+')
  minusButton = new Button(0, 0, smallButtonWidth, smallButtonHeight, '-')
  leftButton = new Button(0, 0, smallButtonWidth, smallButtonHeight, '❬')
  rightButton = new Button(0, 0, smallButtonWidth, smallButtonHeight, '❭')
  resetButton = new Button(0, 0, smallButtonWidth, smallButtonHeight, '⟲')
  expandButton = new Button(0, 0, smallButtonWidth, smallButtonHeight, '⛶')

  // Preview (non-interactive) → single render, no loop, no handlers
  if (!interactive) {
    _update()
    _render()
    return
  }

  // Interactive → original behavior with loop + input handlers
  attachInputHandlers()

  if (loopId) {
    clearInterval(loopId)
    loopId = null
  }

  loopId = setInterval(() => {
    if (!canvas || !ctx) return

    const r = canvas.getBoundingClientRect()
    canvas.width = r.width
    canvas.height = r.height

    _input()
    _update()
    _render()

    mxPrev = mx
    myPrev = my
    mu = false
    kd = false
    wheelDeltaY = 0
    candleArrayOldLength = candleArray.length
  }, msps)
}

// allow React to stop the loop when the fullscreen modal closes
export function disposeLegacyCandleChart() {
  if (loopId) {
    clearInterval(loopId)
    loopId = null
  }
}
