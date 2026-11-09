// Draws an image the way an iPhone Duo outer-screen screenshot looks: a rounded
// app window on black, with the system status column down the right edge.
// Sizes are output pixels, measured from a real outer-screen screenshot.
const WIDTH = 1398
const HEIGHT = 2034
const APP_WINDOW = { x: 97, y: 28, width: 1115, height: 1978, radius: 56 }
const STATUS_X = 1296
const BATTERY_PERCENT = 88
const FONT = '-apple-system, "SF Pro Text", "PingFang SC", "Helvetica Neue", Arial, sans-serif'

const WHITE = '#fff'
const DIM = 'rgba(255, 255, 255, 0.35)'

const radians = (degrees) => (degrees * Math.PI) / 180

function drawAt(ctx, x, y, draw) {
  ctx.save()
  ctx.translate(x, y)
  draw()
  ctx.restore()
}

function drawImageInWindow(ctx, image) {
  const { x, y, width, height, radius } = APP_WINDOW
  const scale = Math.min(width / image.naturalWidth, height / image.naturalHeight)
  const drawWidth = image.naturalWidth * scale
  const drawHeight = image.naturalHeight * scale
  const left = x + (width - drawWidth) / 2
  const top = y + (height - drawHeight) / 2

  ctx.save()
  ctx.beginPath()
  ctx.roundRect(left, top, drawWidth, drawHeight, Math.min(radius, drawWidth / 2, drawHeight / 2))
  ctx.clip()
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(image, left, top, drawWidth, drawHeight)
  ctx.restore()
}

function drawMutedBell(ctx) {
  ctx.fillStyle = WHITE
  ctx.beginPath()
  ctx.moveTo(-12, 7)
  ctx.quadraticCurveTo(-8, 3, -8, -3)
  ctx.bezierCurveTo(-8, -10, -4, -13, 0, -13)
  ctx.bezierCurveTo(4, -13, 8, -10, 8, -3)
  ctx.quadraticCurveTo(8, 3, 12, 7)
  ctx.closePath()
  ctx.fill()
  ctx.beginPath()
  ctx.arc(0, 9, 3.5, 0, Math.PI)
  ctx.fill()

  const slash = (color, lineWidth) => {
    ctx.strokeStyle = color
    ctx.lineWidth = lineWidth
    ctx.beginPath()
    ctx.moveTo(-11, -12)
    ctx.lineTo(13, 12)
    ctx.stroke()
  }
  slash('#000', 6.5)
  slash(WHITE, 2.6)
}

function drawArc(ctx, radius, fromDegrees, toDegrees, color) {
  ctx.strokeStyle = color
  ctx.beginPath()
  ctx.arc(0, 0, radius, radians(fromDegrees), radians(toDegrees))
  ctx.stroke()
}

function drawBatteryRing(ctx) {
  const left = { from: 148, to: 241 }
  const right = { from: -61, to: 32 }
  const span = left.to - left.from + (right.to - right.from)
  const filled = (span * BATTERY_PERCENT) / 100

  ctx.lineWidth = 6.5
  ctx.lineCap = 'round'
  const radius = 38.75
  const leftEnd = Math.min(left.to, left.from + filled)
  const rightEnd = right.from + Math.max(0, filled - (left.to - left.from))
  drawArc(ctx, radius, right.from, right.to, DIM)
  drawArc(ctx, radius, left.from, left.to, DIM)
  drawArc(ctx, radius, left.from, leftEnd, WHITE)
  if (rightEnd > right.from) drawArc(ctx, radius, right.from, rightEnd, WHITE)
}

function drawWifi(ctx) {
  drawAt(ctx, 0, 13, () => {
    ctx.strokeStyle = WHITE
    ctx.fillStyle = WHITE
    ctx.lineWidth = 4.5
    ctx.lineCap = 'round'
    for (const radius of [23.5, 14]) {
      ctx.beginPath()
      ctx.arc(0, 0, radius, radians(-132), radians(-48))
      ctx.stroke()
    }
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.arc(0, 0, 7, radians(-135), radians(-45))
    ctx.closePath()
    ctx.fill()
  })
}

function drawSignalDots(ctx) {
  const dots = [[-20.3, 33.9], [-7.2, 39.7], [7.2, 39.7], [20.6, 33.9]]
  dots.forEach(([x, y], index) => {
    ctx.fillStyle = index === dots.length - 1 ? DIM : WHITE
    ctx.beginPath()
    ctx.arc(x, y, 4, 0, Math.PI * 2)
    ctx.fill()
  })
}

function drawStatusColumn(ctx, time) {
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  drawAt(ctx, STATUS_X, 86, () => drawMutedBell(ctx))

  ctx.fillStyle = WHITE
  ctx.font = `600 33px ${FONT}`
  ctx.fillText(time, STATUS_X, 133)

  ctx.font = `600 22px ${FONT}`
  ctx.fillText(String(BATTERY_PERCENT), STATUS_X, 171)

  drawAt(ctx, STATUS_X, 206, () => {
    drawBatteryRing(ctx)
    drawWifi(ctx)
    drawSignalDots(ctx)
  })
}

function drawCollapseButton(ctx) {
  drawAt(ctx, 1305, 1918, () => {
    ctx.fillStyle = '#262626'
    ctx.beginPath()
    ctx.arc(0, 0, 50, 0, Math.PI * 2)
    ctx.fill()

    ctx.strokeStyle = WHITE
    ctx.lineWidth = 4
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    const arrows = [
      { tail: [-18, -17.4], tip: [-3.5, -2.9], head: [[-16.5, -2.3], [-2, -16]] },
      { tail: [17.4, 18], tip: [2.9, 3.5], head: [[2.9, 16.8], [16.8, 3.5]] },
    ]
    for (const { tail, tip, head } of arrows) {
      ctx.beginPath()
      ctx.moveTo(...tail)
      ctx.lineTo(...tip)
      ctx.moveTo(...head[0])
      ctx.lineTo(...tip)
      ctx.lineTo(...head[1])
      ctx.stroke()
    }
  })
}

export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = src
  })
}

export function renderDuoScreenshot(image, time) {
  const canvas = document.createElement('canvas')
  canvas.width = WIDTH
  canvas.height = HEIGHT
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, WIDTH, HEIGHT)
  drawImageInWindow(ctx, image)
  drawStatusColumn(ctx, time)
  drawCollapseButton(ctx)

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('toBlob failed'))), 'image/png')
  })
}
