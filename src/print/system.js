import { blue } from 'chalk'

// Serialize `system` information for CLI reporters
export const prettifySystems = function(envs) {
  const envsA = envs.map(prettifySystem)
  const systemPretty = envsA.map(getSystemPretty).join('\n\n')
  return { envs: envsA, systemPretty }
}

const prettifySystem = function({ title, system, ...env }, index, envs) {
  const header = getHeader(title, envs)

  const padding = getPadding(system)
  const systemA = Object.entries(system)
    .map(([name, value]) => serializeValue(name, value, padding))
    .join('\n')

  const systemPretty = `${header}\n${systemA}`
  return { ...env, system, systemPretty }
}

const getHeader = function(title, envs) {
  const header = envs.length === 1 || title === '' ? 'System' : title
  return blue.bold(`${header}:`)
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

const getSystemPretty = function({ systemPretty }) {
  return systemPretty
}
