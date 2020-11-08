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
  return getFields(system).length !== 0
}

const prettifySystem = function (system, index) {
  const title = getTitle(system)
  const fields = getFields(system)
  const body = fields.join('\n')
  const systemsPrettyA = addIndentedPrefix(title, body)
  const systemsPrettyB =
    index === 0 ? systemsPrettyA : indentBlock(systemsPrettyA)
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

const getFields = function (system) {
  return SYSTEM_FIELDS.map(({ title, value }) =>
    serializeField({ title, value, system }),
  ).filter(Boolean)
}

const serializeField = function ({ title, value, system }) {
  return addPrefix(title, value(system))
}

const getJob = function ({ jobNumber, jobUrl }) {
  if (jobNumber === undefined) {
    return
  }

  return addPrefix('Job', `#${jobNumber} (${underline(jobUrl)})`)
}

const SYSTEM_FIELDS = [
  { title: 'OS', value: ({ os }) => os },
  { title: 'CPU', value: ({ cpu }) => cpu },
  { title: 'Memory', value: ({ memory }) => memory },
  { title: 'Job', value: getJob },
]
