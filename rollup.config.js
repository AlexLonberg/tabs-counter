/* rollup.config.js [ 26.05.2020 : 07:02:49 ] */

import resolve from '@rollup/plugin-node-resolve'

export default {
  input: {
    app: 'demo-src/app.js'
  },
  output: {
    format: 'iife',
    dir: 'demo/js',
    strict: true,
    sourcemap: true
  },
  plugins: [resolve()]
}
