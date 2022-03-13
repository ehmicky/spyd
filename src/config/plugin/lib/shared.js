import { parseQuery } from '../../normalize/lib/wild_wild_path/main.js'
import { pick } from '../../normalize/lib/wild_wild_path_utils/main.js'

// Retrieve top-level properties that are shared with all plugins of a specific
// type. Those are merged with plugin-specific properties.
export const getSharedConfig = function (sharedConfig, item = []) {
  const sharedPropNames = [...new Set(item.map(getRuleName))]
  const sharedConfigA = pick(sharedConfig, sharedPropNames.flatMap(parseQuery))
  return { sharedConfig: sharedConfigA, sharedPropNames }
}

const getRuleName = function ({ name }) {
  return name
}
