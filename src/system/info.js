import { cpus as getCpus, totalmem } from 'os'

import { format as formatBytes } from 'bytes'
import osName from 'os-name'

import { getCiInfo } from '../ci/info.js'
import { groupBy } from '../utils/group.js'

export const getSystem = function ({ systemId, systemTitle, cwd }) {
  const { git, ci, job } = getCiInfo(cwd)
  const machine = getMachine()
  return { id: systemId, title: systemTitle, machine, git, ci, job }
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
