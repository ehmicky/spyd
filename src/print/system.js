// Serialize `system` information for CLI reporters
export const getPrintedSystem = function(system) {
  const padding = getPadding(system)

  const systemA = Object.entries(system)
    .map(([name, value]) => serializeValue(name, value, padding))
    .join('\n')
  return `System:\n${systemA}`
}

const getPadding = function(system) {
  const lengths = Object.keys(system).map(getLength)
  return Math.max(...lengths)
}

const getLength = function(key) {
  return key.length
}

const serializeValue = function(name, value, padding) {
  const nameA = `${name}:`.padEnd(padding + 1)
  return `  ${nameA} ${value}`
}
