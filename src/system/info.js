import { cpus as getCpus, totalmem } from 'os'

import { format as formatBytes } from 'bytes'
import envCi from 'env-ci'
import osName from 'os-name'
import { v4 as uuidv4 } from 'uuid'

import { cleanObject } from '../utils/clean.js'
import { groupBy } from '../utils/group.js'

import { getSystemVersions } from './versions.js'

// Users can specify a `system` configuration property.
// This is a combination dimension meant to compare any environment differences,
// outside of spyd: hardware, OS, git branch, environment variables, etc.
// All that information are automatically computed.
// The `versions` are computed by runners.
// A result can only have a single `system`. However, when merging results,
// this becomes several `systems`. We persist the `systems` array directly so
// that all results have the same shape in both our logic and reporters' logic.
export const getSystemInfo = async function (
  combinations,
  { cwd, systemId, envInfo },
) {
  const id = uuidv4()
  const timestamp = Date.now()
  const system = await getSystem({ systemId, envInfo, combinations, cwd })
  return { id, timestamp, system }
}

const getSystem = async function ({ systemId, combinations, cwd }) {
  const versions = await getSystemVersions(combinations, cwd)
  const machine = getMachine()
  const { git, ci } = getEnvInfo(cwd)
  return cleanObject({ id: systemId, machine, git, ci, versions })
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

const getEnvInfo = function (cwd) {
  const { commit, branch, tag, pr, prBranch, buildUrl } = envCi({ cwd })
  return {
    git: { commit, branch, tag, prNumber: pr, prBranch },
    ci: buildUrl,
  }
}
