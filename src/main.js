import { getOpts } from './options.js'
import { getResults } from './results.js'
import { reportResults } from './report.js'

const checkSpeed = function(tasks, opts) {
  const optsA = getOpts(opts)
  const results = getResults({ tasks, opts: optsA })
  reportResults(results)
  return results
}

// We do not use `export default` because Babel transpiles it in a way that
// requires CommonJS users to `require(...).default` instead of `require(...)`.
module.exports = checkSpeed
