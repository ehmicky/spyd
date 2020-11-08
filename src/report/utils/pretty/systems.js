import { underline } from 'chalk'

import { indentBlock } from '../indent.js'
import { addPrefix, addIndentedPrefix } from '../prefix.js'

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
  const body = getBody(system)
  const systemsPrettyA = addIndentedPrefix(title, body)
  const systemsPrettyB = indent(systemsPrettyA, index)
  return systemsPrettyB
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
  const job = getJob(system)
  return [...fields, job].filter(Boolean).join('\n')
}

const getFields = function (system) {
  return Object.keys(SYSTEM_FIELDS)
    .map((field) => serializeField(field, system))
    .filter(Boolean)
}

const serializeField = function (field, system) {
  return addPrefix(SYSTEM_FIELDS[field], system[field])
}

const SYSTEM_FIELDS = { os: 'OS', cpu: 'CPU', memory: 'Memory' }

// Those fields involve more dynamic logic
const hasComplexFields = function (system) {
  return COMPLEX_FIELDS.some((field) => system[field] !== undefined)
}

const COMPLEX_FIELDS = ['jobNumber']

const getJob = function ({ jobNumber, jobUrl }) {
  if (jobNumber === undefined) {
    return
  }

  return addPrefix('Job', `#${jobNumber} (${underline(jobUrl)})`)
}

const indent = function (systemsPretty, index) {
  if (index === 0) {
    return systemsPretty
  }

  return indentBlock(systemsPretty)
}
