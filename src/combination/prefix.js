// Check if a dimension's name is using a specific prefix
export const hasPrefix = function (propName, prefixName) {
  return propName.startsWith(PREFIXES[prefixName])
}

// Add a specific prefix to a dimension's name
export const addPrefix = function (propName, prefixName) {
  return propName.slice(PREFIXES[prefixName].length)
}

// Remove a specific prefix to a dimension's name
export const removePrefix = function (propName, prefixName) {
  return propName.slice(PREFIXES[prefixName].length)
}

// Some dimensions can have multiple sub-dimensions.
// Those use prefixes in internal properties, but not in output and error
// messages.
const PREFIXES = {
  system: 'system.',
}
