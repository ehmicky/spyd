import { groupBy } from '../utils/group.js'

// Add `iteration.fastest` boolean indicating fastest iterations,
// for each variation+command+env combination, among all tasks
export const addFastestIterations = function(iterations) {
  const minMedians = Object.entries(
    groupBy(iterations, ['variation', 'command', 'env']),
  ).map(getMinMedian)
  const minMediansA = Object.fromEntries(minMedians)

  return iterations.map(iteration =>
    addFastestIteration({ iteration, minMedians: minMediansA }),
  )
}

const getMinMedian = function([groupId, iterations]) {
  const medians = iterations.map(getIterationMedian)
  const minMedian = Math.min(...medians)
  return [groupId, minMedian]
}

const addFastestIteration = function({
  iteration,
  iteration: { variation, command },
  minMedians,
}) {
  const groupId = `${variation}\n${command}`
  const fastest = getIterationMedian(iteration) === minMedians[groupId]
  return { ...iteration, fastest }
}

const getIterationMedian = function({ stats: { median } }) {
  return median
}
