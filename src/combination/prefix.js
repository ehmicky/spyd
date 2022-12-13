// Check if a dimension's name is using a specific prefix
export const hasPrefix = (propName, prefixName) =>
  propName.startsWith(PREFIXES[prefixName])

// Add a specific prefix to a dimension's name
export const addPrefix = (propName, prefixName) =>
  `${PREFIXES[prefixName]}${propName}`

// Remove a specific prefix to a dimension's name
export const removePrefix = (propName, prefixName) =>
  propName.slice(PREFIXES[prefixName].length)

// Some dimensions can have multiple sub-dimensions.
// Those use prefixes in internal properties, but not in output and error
// messages.
const PREFIXES = {
  system: 'system.',
}
