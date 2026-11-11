import { useEffect, useState } from 'react'
import sampleUrl from './assets/sample.svg'
import { loadImage, renderDuoScreenshot } from './duoFrame.js'

const SAMPLE_TIME = '11:04'
const SAVE_NAME = 'iphone-duo-screenshot.png'

function currentTime() {
  return new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false })
}

async function renderToBlob(src, time) {
  const image = await loadImage(src)
  return renderDuoScreenshot(image, time)
}

// Counts an action on the GoatCounter dashboard. Does nothing if the script
// is blocked or hasn't loaded yet.
function track(name) {
  window.goatcounter?.count?.({ path: name, title: name, event: true })
}

function isFileDrag(event) {
  return event.dataTransfer.types.includes('Files')
}

function BeforeAfter({ before, after }) {
  return (
    <div className="compare">
      <figure>
        <img src={before} alt="原图" />
        <figcaption>原图</figcaption>
      </figure>
      <span className="arrow" aria-hidden="true">→</span>
      <figure>
        {after && <img src={after} alt="iPhone Duo 外屏截图效果" />}
        <figcaption>外屏截图</figcaption>
      </figure>
    </div>
  )
}

export default function App() {
  const [sampleAfter, setSampleAfter] = useState(null)
  const [upload, setUpload] = useState(null)
  const [error, setError] = useState('')
  const [dragging, setDragging] = useState(false)

  useEffect(() => {
    let cancelled = false
    renderToBlob(sampleUrl, SAMPLE_TIME).then((blob) => {
      if (!cancelled) setSampleAfter(URL.createObjectURL(blob))
    })
    return () => {
      cancelled = true
    }
  }, [])

  async function processFile(file) {
    if (!file) return

    const before = URL.createObjectURL(file)
    try {
      const blob = await renderToBlob(before, currentTime())
      if (upload) {
        URL.revokeObjectURL(upload.before)
        URL.revokeObjectURL(upload.after)
      }
      setUpload({
        before,
        after: URL.createObjectURL(blob),
        file: new File([blob], SAVE_NAME, { type: 'image/png' }),
      })
      setError('')
      track('upload')
    } catch {
      URL.revokeObjectURL(before)
      setError('这张图片打不开，换一张 JPG 或 PNG 试试')
    }
  }

  function handleFileInput(event) {
    const file = event.target.files[0]
    event.target.value = ''
    processFile(file)
  }

  // Phones get the share sheet, which offers saving to Photos. Everything else
  // falls through to the link's normal download.
  function handleSave(event) {
    track('save')
    const files = [upload.file]
    if (!window.matchMedia('(pointer: coarse)').matches || !navigator.canShare?.({ files })) return

    event.preventDefault()
    navigator.share({ files }).catch((shareError) => {
      if (shareError.name !== 'AbortError') setError('保存失败，请长按图片保存')
    })
  }

  function handleDragOver(event) {
    if (!isFileDrag(event)) return
    event.preventDefault()
    setDragging(true)
  }

  function handleDragLeave(event) {
    if (!event.currentTarget.contains(event.relatedTarget)) setDragging(false)
  }

  function handleDrop(event) {
    if (!isFileDrag(event)) return
    event.preventDefault()
    setDragging(false)
    processFile(event.dataTransfer.files[0])
  }

  return (
    <div className="page" onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
      <main>
        <h1>我有 iPhone Duo</h1>

        <label className="button">
          <input type="file" accept="image/*" onChange={handleFileInput} />
          上传图片
        </label>
        {error && <p className="error" role="alert">{error}</p>}

        <section>
          <h2>{upload ? '你的外屏截图' : '效果示例'}</h2>
          {upload ? (
            <>
              <BeforeAfter before={upload.before} after={upload.after} />
              <a className="button secondary" href={upload.after} download={SAVE_NAME} onClick={handleSave}>
                保存图片
              </a>
            </>
          ) : (
            <BeforeAfter before={sampleUrl} after={sampleAfter} />
          )}
        </section>
      </main>
      {dragging && <div className="drop-hint">松开上传图片</div>}
    </div>
  )
}
