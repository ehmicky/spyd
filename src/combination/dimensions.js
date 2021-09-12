// All dimensions. They:
//  - create dimensions in runs using a cartesian product
//  - can be used in `select|limit`
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
