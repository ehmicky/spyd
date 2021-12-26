import { format as formatBytes } from 'bytes'
import omit from 'omit.js'

import { cleanObject } from '../../utils/clean.js'

import { serializeGit, serializePr } from './git.js'

// Serialize info|system-related information as a `footer` for reporters
export const serializeFooter = function ({
  id,
  timestamp,
  systems,
  ...footer
}) {
  const metadata = serializeMetadata(id, timestamp)
  const systemsA = systems.map(serializeSystem).filter(hasProps)
  return { ...footer, ...metadata, systems: systemsA }
}

const serializeMetadata = function (id, timestamp) {
  return cleanObject({ Id: id, Timestamp: timestamp })
}

const serializeSystem = function ({
  machine: { os, cpus, memory } = {},
  git: { commit, tag, branch, prNumber, prBranch } = {},
  ci,
  versions: { Spyd: spydVersion, ...versions } = {},
}) {
  const props = {
    OS: os,
    CPU: serializeCpus(cpus),
    Memory: serializeMemory(memory),
    Git: serializeGit({ commit, tag, branch }),
    PR: serializePr({ prNumber, prBranch }),
    CI: ci,
  }
  return cleanObject({
    ...props,
    ...omit.default(versions, Object.keys(props)),
    [SPYD_VERSION_NAME]: spydVersion,
  })
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

const hasProps = function (props) {
  return Object.keys(props).length !== 0
}
