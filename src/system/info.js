import { cpus as getCpus, totalmem } from 'os'

import { format as formatBytes } from 'bytes'
import osName from 'os-name'

import { groupBy } from '../utils/group.js'

// Users can specify a `system` configuration property.
// This is a combination category meant to compare any environment differences,
// outside of spyd: hardware, OS, git branch, environment variables, etc.
// All that information are automatically computed.
// The `versions` are computed by runners.
// A result can only have a single `system`. However, when merging results,
// this becomes several `systems`. We persist the `systems` array directly so
// that all results have the same shape in both our logic and reporters' logic.
export const getSystems = function ({
  combinations: [{ systemId }],
  systemVersions,
  envInfo: { commit, branch, tag, pr, prBranch, buildUrl },
}) {
  const machine = getMachine()
  return [
    {
      id: systemId,
      machine,
      git: { commit, branch, tag, prNumber: pr, prBranch },
      ci: buildUrl,
      versions: systemVersions,
    },
  ]
}

const getMachine = function () {
  const cpu = serializeCpus()
  const memory = getMemory()
  const os = osName()
  return { cpu, memory, os }
}

const serializeCpus = function () {
  const cpus = getCpus()
  return Object.entries(groupBy(cpus, 'model')).map(serializeCpu).join(', ')
}

const serializeCpu = function ([name, cores]) {
  return `${cores.length} * ${name}`
}

const getMemory = function () {
  const memory = totalmem()
  return formatBytes(memory, { decimalPlaces: 0 })
}
