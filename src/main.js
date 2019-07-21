import { getOpts } from './options.js'
import { getTasks } from './tasks.js'
import { getTasksResults } from './results.js'
import { reportResults } from './report.js'

const checkSpeed = async function(opts) {
  const optsA = await getOpts(opts)
  const tasks = await getTasks(optsA)
  const results = await getTasksResults(tasks, optsA)
  reportResults(results)
  return results
}

// We do not use `export default` because Babel transpiles it in a way that
// requires CommonJS users to `require(...).default` instead of `require(...)`.
module.exports = checkSpeed
