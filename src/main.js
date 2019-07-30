import pMapSeries from 'p-map-series'

import { getOpts } from './options.js'
import { getTaskPath, loadTaskFile, getTasksInputs } from './tasks.js'
import { start } from './runner.js'
import { report } from './report.js'

const checkSpeed = async function(opts) {
  const optsA = await getOpts(opts)
  const taskPath = await getTaskPath(optsA)
  const tasks = await loadTaskFile(taskPath)
  const tasksInputs = getTasksInputs(tasks)

  // Run each parameter serially to avoid one parameter influencing the timing
  // of another
  const benchmarks = await pMapSeries(tasksInputs, taskInput =>
    start({ ...optsA, taskPath, ...taskInput }),
  )

  report(benchmarks)

  return benchmarks
}

// We do not use `export default` because Babel transpiles it in a way that
// requires CommonJS users to `require(...).default` instead of `require(...)`.
module.exports = checkSpeed
