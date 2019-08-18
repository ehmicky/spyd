import { blue } from 'chalk'

// Serialize `system` information for CLI reporters
export const prettifySystems = function(envs) {
  const envsA = envs.map(prettifySystem)
  const systemPretty = envsA.map(getSystemPretty).join('\n\n')
  return { envs: envsA, systemPretty }
}

const prettifySystem = function(
  { id, title, opts, mean, ...machine },
  index,
  envs,
) {
  const header = getHeader(title, envs)

  const padding = getPadding(machine)
  const systemA = Object.entries(machine)
    .map(([name, value]) => serializeValue(name, value, padding))
    .join('\n')

  const systemPretty = `${blue.bold(`${header}:`)}\n${systemA}`
  return { ...machine, id, title, opts, mean, systemPretty }
}

const getHeader = function(title, envs) {
  if (envs.length === 1 || title === '') {
    return 'System'
  }

  return title
}

const getPadding = function(machine) {
  const lengths = Object.keys(machine).map(getLength)
  return Math.max(...lengths)
}

const getLength = function(key) {
  return key.length
}

const serializeValue = function(name, value, padding) {
  const nameA = serializeName(name, padding)
  return `  ${nameA} ${value}`
}

const serializeName = function(name, padding) {
  const nameA = MACHINE_NAMES[name]
  const nameB = `${nameA}:`.padEnd(padding + 1)
  return blue.bold(nameB)
}

const MACHINE_NAMES = {
  cpu: 'CPU',
  memory: 'Memory',
  os: 'OS',
}

const getSystemPretty = function({ systemPretty }) {
  return systemPretty
}
