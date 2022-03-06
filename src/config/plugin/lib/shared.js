import { list, parent, set } from '../../normalize/lib/star_dot_path/main.js'

// Retrieve top-level properties that are shared with all plugins of a specific
// type. Those are merged with plugin-specific properties.
export const getSharedConfig = function (sharedConfig, item = []) {
  const sharedPropNames = getSharedConfigPropNames(item)
  const sharedConfigProps = sharedPropNames.flatMap((sharedPropName) =>
    list(sharedConfig, sharedPropName),
  )
  const sharedConfigA = sharedConfigProps.reduce(addSharedConfigProp, {})
  return { sharedConfig: sharedConfigA, sharedPropNames }
}

// Retrieve all unique `name` of shared config properties, excluding their
// children
const getSharedConfigPropNames = function (item) {
  const sharedPropNames = item.map(getRuleName)
  return [...new Set(sharedPropNames)].filter(hasNoParent)
}

const getRuleName = function ({ name }) {
  return name
}

const hasNoParent = function (nameA, indexA, names) {
  return names.every(
    (nameB, indexB) => indexB === indexA || !parent(nameB, nameA),
  )
}

const addSharedConfigProp = function (sharedConfig, { path, value }) {
  return set(sharedConfig, path, value)
}
