// Group an array of objects into an object of objects based on a property
export const groupBy = function (array, propName) {
  const groups = {}

  array.forEach((object) => addGroup(object, groups, propName))

  return groups
}

// We directly mutate `groups` for performance reasons
const addGroup = function (object, groups, propName) {
  const group = String(object[propName])

  if (groups[group] === undefined) {
    // eslint-disable-next-line no-param-reassign, fp/no-mutation
    groups[group] = [object]
    return
  }

  // eslint-disable-next-line fp/no-mutating-methods
  groups[group].push(object)
}
