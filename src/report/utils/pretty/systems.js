import { underline } from 'chalk'

import { prettifyObject } from '../prefix.js'

// Serialize `system` information for CLI reporters.
export const prettifySystems = function (systems) {
  if (systems === undefined) {
    return
  }

  return systems.map(prettifySystem).filter(Boolean).join('\n')
}

const prettifySystem = function (system) {
  const fields = SYSTEM_FIELDS.map(({ title, value }) => ({
    [title]: value(system),
  }))
  const fieldsA = Object.assign({}, ...fields)
  const systemTitle = getTitle(system)
  return prettifyObject({ [systemTitle]: fieldsA })
}

const getJob = function ({ jobNumber, jobUrl }) {
  if (jobNumber === undefined) {
    return
  }

  return `#${jobNumber} (${underline(jobUrl)})`
}

const SYSTEM_FIELDS = [
  { title: 'OS', value: ({ os }) => os },
  { title: 'CPU', value: ({ cpu }) => cpu },
  { title: 'Memory', value: ({ memory }) => memory },
  { title: 'Job', value: getJob },
]

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
