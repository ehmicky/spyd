import { cpus as getCpus, totalmem } from 'os'

import { format as formatBytes } from 'bytes'
import envCi from 'env-ci'
import osName from 'os-name'

import { groupBy } from '../utils/group.js'

// Retrieve system information
export const getSystem = function ({
  combinations: [{ systemId, systemTitle }],
  config: { cwd },
}) {
  const machine = getMachine()
  const { commit, branch, tag, pr, prBranch, buildUrl } = envCi({ cwd })
  return {
    id: systemId,
    title: systemTitle,
    machine,
    git: { commit, branch, tag, prNumber: pr, prBranch },
    ci: buildUrl,
  }
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
