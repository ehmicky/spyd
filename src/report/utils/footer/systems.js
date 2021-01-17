import { prettifyGit, prettifyPr } from './git.js'

// Serialize `system` information for CLI reporters.
export const getSharedSystem = function (systems) {
  if (systems === undefined) {
    return
  }

  const [sharedSystem] = systems
  return getFields(sharedSystem)
}

export const getSystems = function (systems) {
  if (systems === undefined) {
    return
  }

  const fields = systems.slice(1).map(getSystemFields)
  return Object.assign({}, ...fields)
}

const getSystemFields = function ({ title, ...system }) {
  const fields = getFields(system)
  return { [title]: fields }
}

const getFields = function (system) {
  const fields = SYSTEM_FIELDS.map(({ title, value }) => ({
    [title]: value(system),
  }))
  return Object.assign({}, ...fields)
}

const SYSTEM_FIELDS = [
  { title: 'OS', value: ({ machine: { os } }) => os },
  { title: 'CPU', value: ({ machine: { cpu } }) => cpu },
  { title: 'Memory', value: ({ machine: { memory } }) => memory },
  { title: 'Git', value: prettifyGit },
  { title: 'PR', value: prettifyPr },
  { title: 'CI', value: ({ ci }) => ci },
]
