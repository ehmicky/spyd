import { underline } from 'chalk'

import { prettifyObject } from '../prefix.js'

// Serialize `system` information for CLI reporters.
export const prettifySharedSystem = function (systems) {
  if (systems === undefined) {
    return
  }

  const [sharedSystem] = systems
  const fields = getFields(sharedSystem)
  return prettifyObject(fields)
}

export const prettifySystems = function (systems) {
  if (systems === undefined) {
    return
  }

  return systems.slice(1).map(prettifySpecificSystem).filter(Boolean).join('\n')
}

const prettifySpecificSystem = function (system) {
  const fields = getFields(system)
  const systemTitle = getTitle(system)
  return prettifyObject({ [systemTitle]: fields })
}

const getFields = function (system) {
  const fields = SYSTEM_FIELDS.map(({ title, value }) => ({
    [title]: value(system),
  }))
  return Object.assign({}, ...fields)
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

const getTitle = function ({ title }) {
  if (title === '') {
    return DEFAULT_TITLE
  }

  return title
}

// Nested title when `system` is an empty string
const DEFAULT_TITLE = 'Default'
