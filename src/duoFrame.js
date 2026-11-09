// Draws an image the way an iPhone Duo outer-screen screenshot looks when it is
// opened full-screen on a normal phone: the short, wide screenshot fits the
// phone's width and leaves large black areas above and below.
const PHONE = { width: 1206, height: 2622 }
const DUO = { width: 1398, height: 2034 }

// Everything below is in Duo screenshot pixels, measured from real examples.
const APP_WINDOW = { x: 0, y: 28, width: 1130, height: 1978, radius: 72 }
const STATUS_X = 1222
const TIME_Y = 303
const RING_Y = 408
const RING_SCALE = 1.43
const BATTERY_PERCENT = 88
const FONT = '-apple-system, "SF Pro Text", "PingFang SC", "Helvetica Neue", Arial, sans-serif'

const WHITE = '#fff'
const DIM = 'rgba(255, 255, 255, 0.35)'

const radians = (degrees) => (degrees * Math.PI) / 180

function drawImageInWindow(ctx, image) {
  const { x, y, width, height, radius } = APP_WINDOW
  const scale = Math.min(width / image.naturalWidth, height / image.naturalHeight)
  const drawWidth = image.naturalWidth * scale
  const drawHeight = image.naturalHeight * scale
  const top = y + (height - drawHeight) / 2
  const corner = Math.min(radius, drawWidth / 2, drawHeight / 2)

  ctx.save()
  ctx.beginPath()
  ctx.roundRect(x, top, drawWidth, drawHeight, [0, corner, corner, 0])
  ctx.clip()
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(image, x, top, drawWidth, drawHeight)
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
  ctx.font = `600 50px ${FONT}`
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
  canvas.width = PHONE.width
  canvas.height = PHONE.height
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, PHONE.width, PHONE.height)

  const scale = PHONE.width / DUO.width
  ctx.translate(0, (PHONE.height - DUO.height * scale) / 2)
  ctx.scale(scale, scale)
  drawImageInWindow(ctx, image)
  drawStatusColumn(ctx, time)

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('toBlob failed'))), 'image/png')
  })
}
