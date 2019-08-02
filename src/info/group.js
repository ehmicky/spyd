import { groupBy, sortBy } from '../utils.js'
import { getMean } from '../stats/methods.js'

// Group iterations by `taskId` and compute:
//  - `taskMean`: mean of all iterations medians (of the same task)
//  - `taskRank`: rank among all `taskMean`
export const getTaskGroups = function(iterations) {
  return groupIterations({
    iterations,
    groupProp: 'taskId',
    meanProp: 'taskMean',
    rankProp: 'taskRank',
  })
}

// Group iterations by `parameter` and compute:
//  - `parameterMean`: mean of all iterations medians (of the same task)
//  - `parameterRank`: rank among all `taskMean`
export const getParameterGroups = function(iterations) {
  return groupIterations({
    iterations,
    groupProp: 'parameter',
    meanProp: 'parameterMean',
    rankProp: 'parameterRank',
  })
}

const groupIterations = function({
  iterations,
  groupProp,
  meanProp,
  rankProp,
}) {
  const groups = Object.entries(groupBy(iterations, groupProp))

  const groupsA = groups.map(getGroupMean)
  sortBy(groupsA, ['mean'])
  const groupsB = groupsA
    .map(addRank)
    .map(group => renameProps({ group, meanProp, rankProp }))

  const groupsC = Object.fromEntries(groupsB)
  return groupsC
}

const getGroupMean = function([groupId, iterations]) {
  const medians = iterations.map(getIterationMedian)
  const mean = getMean(medians)
  return { groupId, mean }
}

const getIterationMedian = function({ stats: { median } }) {
  return median
}

const addRank = function({ groupId, mean }, rank) {
  return { groupId, mean, rank }
}

const renameProps = function({
  group: { groupId, mean, rank },
  meanProp,
  rankProp,
}) {
  return [groupId, { [meanProp]: mean, [rankProp]: rank }]
}
