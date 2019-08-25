import { blue } from 'chalk'
import indentString from 'indent-string'

// Serialize `system` information for CLI reporters.
export const prettifySystems = function(systems) {
  return systems
    .filter(hasFields)
    .map(prettifySystem)
    .join('\n')
}

const hasFields = function(system) {
  return getFields(system).length !== 0
}

const prettifySystem = function(system, index) {
  const header = getHeader(system)
  const body = getBody(system)
  const systemPretty = `${header}\n${body}`
  const systemPrettyA = indent(systemPretty, index)
  return systemPrettyA
}

const getHeader = function(system) {
  const title = getTitle(system)
  return blue.bold(`${title}:`)
}

const getTitle = function({ title = MAIN_TITLE }) {
  if (title === '') {
    return DEFAULT_TITLE
  }

  return title
}

// Top-level title (for shared `system`)
const MAIN_TITLE = 'System'
// Nested title when `system` is an empty string
const DEFAULT_TITLE = 'Default'

const getBody = function(system) {
  const fields = getFields(system)
  return fields.map(field => serializeField(field, system)).join('\n')
}

const getFields = function(system) {
  return Object.keys(SYSTEM_FIELDS).filter(field => system[field] !== undefined)
}

const serializeField = function(field, system) {
  const value = system[field]
  const fieldA = SYSTEM_FIELDS[field]
  const fieldB = blue.bold(`${fieldA}:`)
  return `  ${fieldB} ${value}`
}

const SYSTEM_FIELDS = { cpu: 'CPU', memory: 'Memory', os: 'OS' }

const indent = function(systemPretty, index) {
  if (index === 0) {
    return systemPretty
  }

  return indentString(systemPretty, 2)
}
