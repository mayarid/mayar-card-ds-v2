// GitHub Pages has no SPA rewrites. A copy of index.html as 404.html serves deep links.
import { copyFileSync, writeFileSync } from 'node:fs'

copyFileSync('dist/index.html', 'dist/404.html')
writeFileSync('dist/.nojekyll', '')
console.log('spa-fallback: wrote dist/404.html and dist/.nojekyll')
