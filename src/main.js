import { getOpts } from './options.js'
import { getTasksResults } from './results.js'
import { reportResults } from './report.js'

const checkSpeed = async function(tasks, opts) {
  const optsA = getOpts(opts)
  const results = await getTasksResults({ tasks, opts: optsA })
  reportResults(results)
  return results
}

// We do not use `export default` because Babel transpiles it in a way that
// requires CommonJS users to `require(...).default` instead of `require(...)`.
module.exports = checkSpeed
