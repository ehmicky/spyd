// Like lodash _.omitBy()
export const omitBy = function(object, condition) {
  const pairs = Object.entries(object)
    .filter(([key, value]) => !condition(key, value))
    .map(([key, value]) => ({ [key]: value }))
  return Object.assign({}, ...pairs)
}

export const isPlainObject = function(value) {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value.constructor === Object || value.constructor === undefined)
  )
}

// ES specifications mostly use promiseLike objects not promises
export const isPromiseLike = function(value) {
  return (
    typeof value === 'object' &&
    value !== null &&
    // eslint-disable-next-line promise/prefer-await-to-then
    typeof value.then === 'function'
  )
}

// Sort an array of numbers
export const sortNumbers = function(array) {
  // eslint-disable-next-line fp/no-mutating-methods
  array.sort(compareNumbers)
}

const compareNumbers = function(numA, numB) {
  return numA - numB
}

// Group an array of objects into an object of objects based on a property
export const groupBy = function(array, propName) {
  const groups = {}

  array.forEach(object => addGroup(object, groups, propName))

  return groups
}

// We directly mutate `groups` for performance reasons
const addGroup = function(object, groups, propName) {
  const group = String(object[propName])

  if (groups[group] === undefined) {
    // eslint-disable-next-line no-param-reassign, fp/no-mutation
    groups[group] = [object]
    return
  }

  // eslint-disable-next-line fp/no-mutating-methods
  groups[group].push(object)
}

// Sort an array of objects according to one of its properties
export const sortBy = function(array, propName) {
  // eslint-disable-next-line fp/no-mutating-methods
  array.sort((objA, objB) => sortByProp(objA, objB, propName))
}

const sortByProp = function(objA, objB, propName) {
  const propA = objA[propName]
  const propB = objB[propName]

  if (propA > propB) {
    return 1
  }

  if (propA < propB) {
    return -1
  }

  return 0
}
