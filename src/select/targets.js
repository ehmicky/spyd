// Retrieve targets, i.e. identifiers to select iterations
export const getTargets = function (opts) {
  const optsA = normalizeSystems(opts)

  return TARGETS.map(({ idName, idsName, name }) =>
    normalizeIds({ opts: optsA, idName, idsName, name }),
  ).filter(Boolean)
}

// Turn `system` option into an array
const normalizeSystems = function ({
  system: { id = '', title } = {},
  ...opts
}) {
  if (id === '') {
    return opts
  }

  // Exclamation marks are removed in `id` during slugification
  const idA = title.startsWith('!') ? `!${id}` : id

  return { ...opts, systems: [idA] }
}

const TARGETS = [
  { idName: 'taskId', idsName: 'tasks', name: 'task' },
  { idName: 'variationId', idsName: 'variations', name: 'variation' },
  { idName: 'systemId', idsName: 'systems', name: 'system' },
  { idName: 'commandRunner', idsName: 'runners', name: 'runner' },
]

// Ids can start with ! to blacklist instead of whitelist
// Whitelisting has priority over blacklisting
const normalizeIds = function ({ opts, idName, idsName, name }) {
  const ids = opts[idsName]

  if (ids === undefined) {
    return
  }

  const idsA = ids.map(normalizeId)
  return { idName, name, ids: idsA }
}

const normalizeId = function (id) {
  const blacklist = id.startsWith('!')
  const idA = blacklist ? id.slice(1) : id
  return { id: idA, blacklist }
}
