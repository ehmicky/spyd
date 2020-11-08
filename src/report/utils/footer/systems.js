// Serialize `system` information for CLI reporters.
export const prettifySharedSystem = function (systems) {
  if (systems === undefined) {
    return
  }

  const [sharedSystem] = systems
  return getFields(sharedSystem)
}

export const prettifySystems = function (systems) {
  if (systems === undefined) {
    return
  }

  const fields = systems.slice(1).map(getSystemFields)
  return Object.assign({}, ...fields)
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
