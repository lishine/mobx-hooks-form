
'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./mobx-hooks-form.cjs.production.min.js')
} else {
  module.exports = require('./mobx-hooks-form.cjs.development.js')
}
