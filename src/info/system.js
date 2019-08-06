import { cpus as getCpus, totalmem } from 'os'

import osName from 'os-name'
import { format as formatBytes } from 'bytes'

import { groupBy } from '../utils/group.js'

export const getSystem = function(versions) {
  const cpu = serializeCpus()
  const memory = getMemory()
  const os = osName()
  return { CPU: cpu, Memory: memory, OS: os, ...versions }
}

const serializeCpus = function() {
  const cpus = getCpus()
  return Object.entries(groupBy(cpus, ['model']))
    .map(serializeCpu)
    .join(', ')
}

const serializeCpu = function([name, cores]) {
  return `${cores.length} * ${name}`
}

const getMemory = function() {
  const memory = totalmem()
  return formatBytes(memory, { decimalPlaces: 0 })
}
