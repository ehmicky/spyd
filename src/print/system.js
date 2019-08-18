import { blue } from 'chalk'
import indentString from 'indent-string'

import { pick } from '../utils/main.js'

// Serialize `system` information for CLI reporters
export const prettifySystems = function(envs) {
  const envsA = envs.map(prettifySystem)
  const systemPretty = envsA
    .map(getSystemPrettyField)
    .filter(Boolean)
    .join('\n')
  return { envs: envsA, systemPretty }
}

const prettifySystem = function(env) {
  const systemPretty = getSystemPretty(env)
  return { ...env, systemPretty }
}

const getSystemPretty = function({ title = 'System', ...env }) {
  const fields = Object.keys(MACHINE_FIELDS).filter(
    field => env[field] !== undefined,
  )

  if (fields.length === 0) {
    return ''
  }

  const machine = pick(env, fields)
  const padding = getPadding(fields)
  const machineA = fields
    .map(field => serializeValue(field, machine[field], padding))
    .join('\n')

  const systemPretty = `${blue.bold(`${title}:`)}\n${machineA}`
  return systemPretty
}

const getPadding = function(fields) {
  const lengths = fields.map(getLength)
  return Math.max(...lengths)
}

const getLength = function(key) {
  return key.length
}

const serializeValue = function(field, value, padding) {
  const fieldA = serializeField(field, padding)
  return `  ${fieldA} ${value}`
}

const serializeField = function(field, padding) {
  const fieldA = MACHINE_FIELDS[field]
  const fieldB = `${fieldA}:`.padEnd(padding + 1)
  return blue.bold(fieldB)
}

const MACHINE_FIELDS = { cpu: 'CPU', memory: 'Memory', os: 'OS' }

const getSystemPrettyField = function({ systemPretty }, index) {
  if (index === 0) {
    return systemPretty
  }

  return indentString(systemPretty, 2)
}
