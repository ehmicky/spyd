import omit from 'omit.js'

import { cleanObject } from '../utils/clean.js'

import { serializeGit, serializePr } from './git.js'

// Serialize info|system-related information as a `footer` for reporters
export const serializeFooter = function ({ id, timestamp, systems }) {
  return [...systems.map(serializeSystem), ...serializeMetadata(id, timestamp)]
}

const serializeSystem = function ({
  title,
  machine: { os, cpu, memory } = {},
  git: { commit, tag, branch, prNumber, prBranch } = {},
  ci,
  versions: { Spyd: spydVersion, ...versions } = {},
}) {
  const fields = {
    OS: os,
    CPU: cpu,
    Memory: memory,
    Git: serializeGit({ commit, tag, branch }),
    PR: serializePr({ prNumber, prBranch }),
    CI: ci,
  }
  return {
    title,
    fields: cleanObject({
      ...fields,
      ...omit.default(versions, Object.keys(fields)),
      [SPYD_VERSION_NAME]: spydVersion,
    }),
  }
}

// The spyd version is shown after other versions.
// It has a longer name than just `spyd` to make it clear "spyd" is the tool
// used for benchmarking.
const SPYD_VERSION_NAME = 'Benchmarked with spyd'

const serializeMetadata = function (id, timestamp) {
  if (id === undefined) {
    return []
  }

  const timestampString = new Date(timestamp).toLocaleString()
  return [{ fields: { Id: id, Timestamp: timestampString } }]
}
