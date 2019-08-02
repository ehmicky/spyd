// Sort an array of numbers
export const sortNumbers = function(array) {
  // eslint-disable-next-line fp/no-mutating-methods
  array.sort(compareNumbers)
}

const compareNumbers = function(numA, numB) {
  return numA - numB
}

// Sort an array of objects according to its properties
export const sortBy = function(array, propNames) {
  const propNamesA = propNames.map(splitPropName)

  // eslint-disable-next-line fp/no-mutating-methods
  array.sort((objA, objB) => sortByProps(objA, objB, propNamesA))
}

const splitPropName = function(propName) {
  return propName.split('.')
}

const sortByProps = function(objA, objB, propNames) {
  // We use a for loop for performance reasons
  // eslint-disable-next-line fp/no-loops
  for (const propName of propNames) {
    const result = compareByProp(objA, objB, propName)

    // eslint-disable-next-line max-depth
    if (result !== undefined) {
      return result
    }
  }

  return 0
}

const compareByProp = function(objA, objB, propName) {
  const propA = get(objA, propName)
  const propB = get(objB, propName)

  if (propA > propB) {
    return 1
  }

  if (propA < propB) {
    return -1
  }
}

const get = function(obj, keys) {
  return keys.reduce(getReduce, obj)
}

const getReduce = function(obj, key) {
  return obj[key]
}
