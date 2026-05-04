import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { createHtmlPlugin } from 'vite-plugin-html'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    react(),
    createHtmlPlugin({
      inject: {
        data: {
          gtag: `
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-YNMN1XTRQX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-YNMN1XTRQX');
</script>
          `.trim()
        }
      }
    })
  ],
  server: {
    historyApiFallback: true,
    host: true,
    allowedHosts: ['.de10.app', '.test']
  }
})
