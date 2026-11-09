// Draws an image the way an iPhone Duo outer-screen screenshot looks: the app
// window against the left edge, with the status column in a black strip on the right.
// Sizes are output pixels, measured from real examples.
const WIDTH = 1398
const HEIGHT = 2034
const APP_WINDOW = { width: 1130, height: HEIGHT, radius: 72 }
const STATUS_X = (APP_WINDOW.width + WIDTH) / 2
const TIME_Y = 257
const RING_Y = 397
const TIME_FONT_SIZE = 62
const RING_SCALE = 1.79
const BATTERY_PERCENT = 88
const FONT = '-apple-system, "SF Pro Text", "PingFang SC", "Helvetica Neue", Arial, sans-serif'

const WHITE = '#fff'
const DIM = 'rgba(255, 255, 255, 0.35)'

const radians = (degrees) => (degrees * Math.PI) / 180

function drawImageInWindow(ctx, image) {
  const { width, height, radius } = APP_WINDOW
  const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight)
  const drawWidth = image.naturalWidth * scale
  const drawHeight = image.naturalHeight * scale

  ctx.save()
  ctx.beginPath()
  ctx.roundRect(0, 0, width, height, [0, radius, radius, 0])
  ctx.clip()
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(image, (width - drawWidth) / 2, (height - drawHeight) / 2, drawWidth, drawHeight)
  ctx.restore()
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
  ctx.save()
  ctx.translate(0, 13)
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
  ctx.restore()
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
  ctx.fillStyle = WHITE
  ctx.font = `600 ${TIME_FONT_SIZE}px ${FONT}`
  ctx.fillText(time, STATUS_X, TIME_Y)

  ctx.save()
  ctx.translate(STATUS_X, RING_Y)
  ctx.scale(RING_SCALE, RING_SCALE)
  ctx.font = `600 22px ${FONT}`
  ctx.fillText(String(BATTERY_PERCENT), 0, -35)
  drawBatteryRing(ctx)
  drawWifi(ctx)
  drawSignalDots(ctx)
  ctx.restore()
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

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('toBlob failed'))), 'image/png')
  })
}
