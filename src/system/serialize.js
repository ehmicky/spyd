import { format as formatBytes } from 'bytes'
import omit from 'omit.js'

import { cleanObject } from '../utils/clean.js'

import { serializeGit, serializePr } from './git.js'

// Serialize info|system-related information as a `footer` for reporters
export const serializeFooter = function ({ id, timestamp, systems }) {
  return [
    ...systems.map(serializeSystem),
    serializeMetadata(id, timestamp),
  ].filter(Boolean)
}

const serializeSystem = function ({
  title,
  machine: { os, cpus, memory } = {},
  git: { commit, tag, branch, prNumber, prBranch } = {},
  ci,
  versions: { Spyd: spydVersion, ...versions } = {},
}) {
  const fields = {
    OS: os,
    CPU: serializeCpus(cpus),
    Memory: serializeMemory(memory),
    Git: serializeGit({ commit, tag, branch }),
    PR: serializePr({ prNumber, prBranch }),
    CI: ci,
  }
  const fieldsA = cleanObject({
    ...fields,
    ...omit.default(versions, Object.keys(fields)),
    [SPYD_VERSION_NAME]: spydVersion,
  })

  if (Object.keys(fieldsA).length === 0) {
    return
  }

  return title === undefined ? fieldsA : { [title]: fieldsA }
}

const serializeCpus = function (cpus) {
  return cpus === undefined ? undefined : cpus.map(serializeCpu).join(', ')
}

const serializeCpu = function ({ cores, model }) {
  return `${cores} * ${model}`
}

const serializeMemory = function (memory) {
  return memory === undefined
    ? undefined
    : formatBytes(memory, { decimalPlaces: 0 })
}

// The spyd version is shown after other versions.
// It has a longer name than just `spyd` to make it clear "spyd" is the tool
// used for benchmarking.
const SPYD_VERSION_NAME = 'Benchmarked with spyd'

const serializeMetadata = function (id, timestamp) {
  if (id === undefined) {
    return
  }

  return { Id: id, Timestamp: timestamp }
}
