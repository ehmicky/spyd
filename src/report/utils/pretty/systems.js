import { underline } from 'chalk'

import { indentBlock } from '../indent.js'
import { addPrefix, addIndentedPrefix } from '../prefix.js'

// Serialize `system` information for CLI reporters.
export const prettifySystems = function (systems) {
  if (systems === undefined) {
    return
  }

  return systems.map(prettifySystem).filter(Boolean).join('\n')
}

const prettifySystem = function (system, index) {
  const body = SYSTEM_FIELDS.map(({ title, value }) =>
    serializeField({ title, value, system }),
  )
    .filter(Boolean)
    .join('\n')

  if (body === '') {
    return
  }

  const systemTitle = getTitle(system)
  const systemsPrettyA = addIndentedPrefix(systemTitle, body)
  const systemsPrettyB =
    index === 0 ? systemsPrettyA : indentBlock(systemsPrettyA)
  return systemsPrettyB
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

const serializeField = function ({ title, value, system }) {
  return addPrefix(title, value(system))
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
