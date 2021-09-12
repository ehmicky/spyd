// Combination identifiers create a new combination dimension:
// tasks, systems, variations, runners.
// They:
//  - can be used in `select`, `limit`, etc.
//  - are checked for duplicates
// The order is significant as it defines:
//  - The sorting order of combinations in reporters
//  - The order of dimensions when printing combinationName in reporters,
//    previews and `dev`
export const DIMENSIONS = [
  {
    dimension: 'task',
    idName: 'taskId',
    titleName: 'taskTitle',
    createdByUser: true,
  },
  {
    dimension: 'runner',
    idName: 'runnerId',
    titleName: 'runnerTitle',
    createdByUser: false,
  },
  {
    dimension: 'system',
    idName: 'systemId',
    titleName: 'systemTitle',
    createdByUser: true,
  },
]

// Dimensions created by users, not by plugins
const getUserDimensions = function () {
  return new Set(DIMENSIONS.filter(isUserDimension).map(getDimensionName))
}

const isUserDimension = function ({ createdByUser }) {
  return createdByUser
}

const getDimensionName = function ({ dimension }) {
  return dimension
}

export const USER_DIMENSIONS = getUserDimensions()
