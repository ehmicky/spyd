import omit from 'omit.js'

import { cleanObject } from '../utils/clean.js'

import { serializeGit, serializePr } from './git.js'

// Serialize info|system-related information as a `footer` for reporters
export const getFooter = function ({ id, timestamp, systems }) {
  return [...serializeSystems(systems), ...serializeMetadata(id, timestamp)]
}

const serializeSystems = function (systems) {
  return systems.map(serializeFields).filter(hasFields).map(serializeSystem)
}

const serializeFields = function ({
  title,
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
    title,
    fields: {
      ...fields,
      ...omit.default(versions, Object.keys(fields)),
      ...serializeSpydVersion(spydVersion),
    },
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

const serializeMetadata = function (id, timestamp) {
  if (id === undefined) {
    return []
  }

  const timestampString = new Date(timestamp).toLocaleString()
  return [{ Id: id, Timestamp: timestampString }]
}

const hasFields = function ({ fields }) {
  return Object.keys(fields).length !== 0
}

const serializeSystem = function ({ title, fields }) {
  return title === undefined ? fields : { [title]: fields }
}
