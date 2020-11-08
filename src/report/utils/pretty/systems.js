import { prettifyValue } from '../prettify_value.js'

// Serialize `system` information for CLI reporters.
export const prettifySharedSystem = function (systems) {
  if (systems === undefined) {
    return
  }

  const [sharedSystem] = systems
  const fields = getFields(sharedSystem)
  return prettifyValue(fields)
}

export const prettifySystems = function (systems) {
  if (systems === undefined) {
    return
  }

  const specificSystems = systems.slice(1)
  const fields = getSystemsFields(specificSystems)
  return prettifyValue(fields)
}

const getSystemsFields = function (systems) {
  const specificSystemsFields = systems.map(getSystemFields)
  return Object.assign({}, ...specificSystemsFields)
}

const getSystemFields = function (system) {
  const systemTitle = getTitle(system)
  const fields = getFields(system)
  return { [systemTitle]: fields }
}

const getTitle = function ({ title }) {
  if (title === '') {
    return DEFAULT_TITLE
  }

  return title
}

// Nested title when `system` is an empty string
const DEFAULT_TITLE = 'Default'

const getFields = function (system) {
  const fields = SYSTEM_FIELDS.map(({ title, value }) => ({
    [title]: value(system),
  }))
  return Object.assign({}, ...fields)
}

const SYSTEM_FIELDS = [
  { title: 'OS', value: ({ os }) => os },
  { title: 'CPU', value: ({ cpu }) => cpu },
  { title: 'Memory', value: ({ memory }) => memory },
  {
    title: 'Job',
    value: ({ jobNumber, jobUrl }) =>
      jobNumber === undefined ? undefined : `#${jobNumber} (${jobUrl})`,
  },
]
