import { blue } from 'chalk'
import indentString from 'indent-string'

// Serialize `system` information for CLI reporters.
export const prettifySystems = function(envs) {
  return envs
    .filter(hasFields)
    .map(prettifySystem)
    .join('\n')
}

const hasFields = function(env) {
  return getFields(env).length !== 0
}

const prettifySystem = function(env, index) {
  const header = getHeader(env)
  const body = getBody(env)
  const systemPretty = `${header}\n${body}`
  const systemPrettyA = indent(systemPretty, index)
  return systemPrettyA
}

const getHeader = function(env) {
  const title = getTitle(env)
  return blue.bold(`${title}:`)
}

const getTitle = function({ title = MAIN_TITLE }) {
  if (title === '') {
    return DEFAULT_TITLE
  }

  return title
}

// Top-level title (for shared `env`)
const MAIN_TITLE = 'System'
// Nested title when `env` is an empty string
const DEFAULT_TITLE = 'Default'

const getBody = function(env) {
  const fields = getFields(env)
  return fields.map(field => serializeField(field, env)).join('\n')
}

const getFields = function(env) {
  return Object.keys(MACHINE_FIELDS).filter(field => env[field] !== undefined)
}

const serializeField = function(field, env) {
  const value = env[field]
  const fieldA = MACHINE_FIELDS[field]
  const fieldB = blue.bold(`${fieldA}:`)
  return `  ${fieldB} ${value}`
}

const MACHINE_FIELDS = { cpu: 'CPU', memory: 'Memory', os: 'OS' }

const indent = function(systemPretty, index) {
  if (index === 0) {
    return systemPretty
  }

  return indentString(systemPretty, 2)
}
