// Group an array of objects into an object of objects based on a property
export const groupBy = function(array, propNames) {
  const groups = {}

  array.forEach(object => addGroup(object, groups, propNames))

  return groups
}

// We directly mutate `groups` for performance reasons
const addGroup = function(object, groups, propNames) {
  const group = propNames.map(propName => String(object[propName])).join('\n')

  if (groups[group] === undefined) {
    // eslint-disable-next-line no-param-reassign, fp/no-mutation
    groups[group] = [object]
    return
  }

  // eslint-disable-next-line fp/no-mutating-methods
  groups[group].push(object)
}
