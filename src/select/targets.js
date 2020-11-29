// Retrieve targets, i.e. identifiers to select combinations
export const getTargets = function (config) {
  const configA = normalizeSystems(config)

  return TARGETS.map(({ idName, idsName, name }) =>
    normalizeIds({ config: configA, idName, idsName, name }),
  ).filter(Boolean)
}

// Turn the `system` configuration property into an array
const normalizeSystems = function ({
  system: { id = '', title } = {},
  ...config
}) {
  if (id === '') {
    return config
  }

  // Exclamation marks are removed in `id` during slugification
  const idA = title.startsWith('!') ? `!${id}` : id

  return { ...config, systems: [idA] }
}

const TARGETS = [
  { idName: 'taskId', idsName: 'tasks', name: 'task' },
  { idName: 'inputId', idsName: 'inputs', name: 'input' },
  { idName: 'systemId', idsName: 'systems', name: 'system' },
  { idName: 'commandRunner', idsName: 'runners', name: 'runner' },
]

// Ids can start with ! to deny instead of allow
// Allow has priority over deny
const normalizeIds = function ({ config, idName, idsName, name }) {
  const ids = config[idsName]

  if (ids === undefined) {
    return
  }

  const idsA = ids.map(normalizeId)
  return { idName, name, ids: idsA }
}

const normalizeId = function (id) {
  const deny = id.startsWith('!')
  const idA = deny ? id.slice(1) : id
  return { id: idA, deny }
}
