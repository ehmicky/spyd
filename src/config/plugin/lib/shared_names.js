import { isParent } from '../../normalize/lib/prop_path/parse.js'

// Retrieve all unique `name` of shared config properties, excluding their
// children
export const getSharedConfigPropNames = function ({ item }) {
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
