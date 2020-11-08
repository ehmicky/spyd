import { blue, underline } from 'chalk'
import indentString from 'indent-string'

// Serialize `system` information for CLI reporters.
export const prettifySystems = function (systems) {
  if (systems === undefined) {
    return
  }

  return systems.filter(hasFields).map(prettifySystem).join('\n')
}

const hasFields = function (system) {
  return getFields(system).length !== 0 || hasComplexFields(system)
}

const prettifySystem = function (system, index) {
  const title = getTitle(system)
  const header = blue.bold(`${title}:`)
  const body = getBody(system)
  const systemsPretty = `${header}\n${body}`
  const systemsPrettyA = indent(systemsPretty, index)
  return systemsPrettyA
}

const getTitle = function ({ title = MAIN_TITLE }) {
  if (title === '') {
    return DEFAULT_TITLE
  }

  return title
}

// Top-level title (for shared `system`)
const MAIN_TITLE = 'System'
// Nested title when `system` is an empty string
const DEFAULT_TITLE = 'Default'

const getBody = function (system) {
  const fields = getFields(system)
  const fieldsA = fields.map((field) => serializeField(field, system))
  const job = getJob(system)
  return [...fieldsA, ...job].join('\n')
}

const getFields = function (system) {
  return Object.keys(SYSTEM_FIELDS).filter(
    (field) => system[field] !== undefined,
  )
}

const serializeField = function (field, system) {
  const value = system[field]
  const fieldA = SYSTEM_FIELDS[field]
  const fieldB = blue.bold(`${fieldA}:`)
  return `  ${fieldB} ${value}`
}

const SYSTEM_FIELDS = { os: 'OS', cpu: 'CPU', memory: 'Memory' }

// Those fields involve more dynamic logic
const hasComplexFields = function (system) {
  return COMPLEX_FIELDS.some((field) => system[field] !== undefined)
}

const COMPLEX_FIELDS = ['jobNumber']

const getJob = function ({ jobNumber, jobUrl }) {
  if (jobNumber === undefined) {
    return []
  }

  return [`${blue.bold('  Job:')} #${jobNumber} (${underline(jobUrl)})`]
}

const indent = function (systemsPretty, index) {
  if (index === 0) {
    return systemsPretty
  }

  return indentString(systemsPretty, 2)
}
