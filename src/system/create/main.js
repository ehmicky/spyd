import { cpus as listCpus, totalmem } from 'os'

import envCi from 'env-ci'
import osName from 'os-name'
import { v4 as uuidv4 } from 'uuid'

import { cleanObject } from '../../utils/clean.js'
import { groupBy } from '../../utils/group.js'
import { getTimestamp } from '../timestamp.js'

import { getSystemVersions } from './versions.js'

// Users can specify a `system` configuration property.
// This is a combination dimension meant to compare any environment differences,
// outside of spyd: hardware, OS, git branch, environment variables, etc.
// All that information are automatically computed.
// The `versions` are computed by runners.
// A result can only have a single `system`. However, when merging results,
// this becomes several `systems`. We persist the `systems` array directly so
// that all results have the same shape in both our logic and reporters' logic.
// We purposely keep the data as raw as possible to give flexibility to the
// reporters on how to serialize it
//  - For example, this allows changing the reporting without changing the
//    history results
export const createSystemInfo = async function (
  combinations,
  { cwd, system: dimensions, envInfo },
) {
  const id = uuidv4()
  const timestamp = getTimestamp()
  const system = await getSystem({ dimensions, envInfo, combinations, cwd })
  return { id, timestamp, system }
}

const getSystem = async function ({ dimensions, combinations, cwd }) {
  const versions = await getSystemVersions(combinations, cwd)
  const machine = getMachine()
  const { git, ci } = getEnvInfo(cwd)
  return cleanObject({ dimensions, machine, git, ci, versions })
}

const getMachine = function () {
  const cpus = getCpus()
  const memory = totalmem()
  const os = osName()
  return { cpus, memory, os }
}

const getCpus = function () {
  const cpus = listCpus()
  return Object.entries(groupBy(cpus, 'model')).map(getCpu)
}

const getCpu = function ([model, cores]) {
  return { model, cores: cores.length }
}

const getEnvInfo = function (cwd) {
  const { commit, branch, tag, pr, prBranch, buildUrl } = envCi({ cwd })
  return {
    git: { commit, branch, tag, prNumber: pr, prBranch },
    ci: buildUrl,
  }
}
