// Group an array of objects into an object of objects based on a property
export const groupBy = (array, getGroup) => {
  const groups = {}

  array.forEach((object, index) => {
    addGroup(object, index, groups, getGroup)
  })

  return groups
}

// We directly mutate `groups` for performance reasons
// eslint-disable-next-line max-params
const addGroup = (object, index, groups, getGroup) => {
  const groupValue =
    typeof getGroup === 'function' ? getGroup(object, index) : object[getGroup]
  const group = String(groupValue)

  if (groups[group] === undefined) {
    // eslint-disable-next-line no-param-reassign, fp/no-mutation
    groups[group] = [object]
    return
  }

  // eslint-disable-next-line fp/no-mutating-methods
  groups[group].push(object)
}
