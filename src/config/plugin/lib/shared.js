import { list, set } from '../../normalize/lib/star_dot_path/main.js'

// Retrieve top-level properties that are shared with all plugins of a specific
// type. Those are merged with plugin-specific properties.
export const getSharedConfig = function (sharedConfig, item = []) {
  const sharedPropNames = [...new Set(item.map(getRuleName))]
  const sharedConfigProps = sharedPropNames.flatMap((sharedPropName) =>
    list(sharedConfig, sharedPropName),
  )
  const sharedConfigA = sharedConfigProps.reduce(addSharedConfigProp, {})
  return { sharedConfig: sharedConfigA, sharedPropNames }
}

const getRuleName = function ({ name }) {
  return name
}

const addSharedConfigProp = function (sharedConfig, { path, value }) {
  return set(sharedConfig, path, value)
}
