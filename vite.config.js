import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Puts the built JS and CSS inside the HTML so the site is one file.
function inlineIntoHtml() {
  return {
    name: 'inline-into-html',
    enforce: 'post',
    generateBundle(_, bundle) {
      const files = Object.values(bundle)
      const html = files.find((file) => file.fileName.endsWith('.html'))

      for (const file of files) {
        const name = file.fileName.split('/').pop()
        if (file.type === 'chunk') {
          const code = file.code.replace(/<\/script/gi, '<\\/script')
          html.source = html.source.replace(
            new RegExp(`<script[^>]*${name}[^>]*></script>`),
            () => `<script type="module">${code}</script>`,
          )
          delete bundle[file.fileName]
        } else if (file.fileName.endsWith('.css')) {
          html.source = html.source.replace(
            new RegExp(`<link[^>]*${name}[^>]*>`),
            () => `<style>${file.source}</style>`,
          )
          delete bundle[file.fileName]
        }
      }
    },
  }
}

// Source lives in src/. The build writes index.html to the repo root, which is
// the folder GitHub Pages serves.
export default defineConfig({
  root: 'src',
  publicDir: '../public',
  base: './',
  plugins: [react(), inlineIntoHtml()],
  build: {
    outDir: '..',
    emptyOutDir: false,
    assetsInlineLimit: Number.MAX_SAFE_INTEGER,
  },
})
