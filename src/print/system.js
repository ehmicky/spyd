import { blue } from 'chalk'

// Serialize `system` information for CLI reporters
export const prettifySystem = function({ system }) {
  const padding = getPadding(system)

  const systemA = Object.entries(system)
    .map(([name, value]) => serializeValue(name, value, padding))
    .join('\n')
  return `${blue.bold('System:')}\n${systemA}`
}

const getPadding = function(system) {
  const lengths = Object.keys(system).map(getLength)
  return Math.max(...lengths)
}

const getLength = function(key) {
  return key.length
}

const serializeValue = function(name, value, padding) {
  const nameA = `${name}:`.padEnd(padding + 2)
  return `  ${blue.bold(nameA)} ${value}`
}
