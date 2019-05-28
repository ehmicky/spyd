import { getOptions } from './options.js'
import { getResults } from './results.js'
import { reportResults } from './report.js'

const checkSpeed = function(tasks, options) {
  const optionsA = getOptions(options)
  const results = getResults({ tasks, options: optionsA })
  reportResults(results)
}

// We do not use `export default` because Babel transpiles it in a way that
// requires CommonJS users to `require(...).default` instead of `require(...)`.
module.exports = checkSpeed
