import omit from 'omit.js'

import { cleanObject } from '../utils/clean.js'

import { serializeGit, serializePr } from './git.js'

// Serialize info|system-related information as a `footer` for reporters
export const getFooter = function ({ id, timestamp, systems }) {
  return [...serializeSystems(systems), ...serializeMetadata(id, timestamp)]
}

const serializeSystems = function (systems) {
  const [sharedSystem, ...nonSharedSystems] = systems
  const serializedSharedSystem = serializeFields(sharedSystem)
  const fields = nonSharedSystems.map(serializeSystemFields)
  const serializedSystems = Object.assign({}, ...fields)
  return [serializedSharedSystem, serializedSystems].filter(hasFields)
}

const serializeSystemFields = function ({ title, ...system }) {
  const fields = serializeFields(system)
  return hasFields(fields) ? { [title]: fields } : {}
}

const serializeFields = function ({
  machine: { os, cpu, memory } = {},
  git: { commit, tag, branch, prNumber, prBranch } = {},
  ci,
  versions: { Spyd: spydVersion, ...versions } = {},
}) {
  const fields = cleanObject({
    OS: os,
    CPU: cpu,
    Memory: memory,
    Git: serializeGit({ commit, tag, branch }),
    PR: serializePr({ prNumber, prBranch }),
    CI: ci,
  })
  return {
    ...fields,
    ...omit.default(versions, Object.keys(fields)),
    ...serializeSpydVersion(spydVersion),
  }
}

// The spyd version is shown after other versions.
// It has a longer name than just `spyd` to make it clear "spyd" is the tool
// used for benchmarking.
const serializeSpydVersion = function (spydVersion) {
  return spydVersion === undefined
    ? {}
    : { 'Benchmarked with spyd': spydVersion }
}

const hasFields = function (fields) {
  return Object.keys(fields).length !== 0
}

const serializeMetadata = function (id, timestamp) {
  if (id === undefined) {
    return []
  }

  const timestampString = new Date(timestamp).toLocaleString()
  return [{ Id: id, Timestamp: timestampString }]
}
