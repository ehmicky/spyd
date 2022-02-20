import { list } from '../../normalize/lib/prop_path/get.js'
import { isParent } from '../../normalize/lib/prop_path/parse.js'
import { set } from '../../normalize/lib/prop_path/set.js'

// Retrieve top-level properties that are shared with all plugins of a specific
// type. Those are merged with plugin-specific properties.
export const getSharedConfig = function ({ item, sharedConfig }) {
  const sharedPropNames = getSharedConfigPropNames(item)
  const sharedConfigProps = sharedPropNames.flatMap((sharedPropName) =>
    Object.entries(list(sharedConfig, sharedPropName)),
  )
  const sharedConfigA = sharedConfigProps.reduce(addSharedConfigProp, {})
  return { sharedConfig: sharedConfigA, sharedPropNames }
}

// Retrieve all unique `name` of shared config properties, excluding their
// children
const getSharedConfigPropNames = function (item) {
  const sharedPropNames = item.map(getDefinitionName)
  return [...new Set(sharedPropNames)].filter(hasNoParent)
}

const getDefinitionName = function ({ name }) {
  return name
}

const hasNoParent = function (nameA, indexA, names) {
  return names.every(
    (nameB, indexB) => indexB === indexA || !isParent(nameB, nameA),
  )
}

const addSharedConfigProp = function (sharedConfig, [path, value]) {
  return set(sharedConfig, path, value)
}
