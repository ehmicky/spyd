import { cpus as getCpus, totalmem } from 'os'
import { version } from 'process'

import osName from 'os-name'
import { format as formatBytes } from 'bytes'

import { groupBy } from '../utils/group.js'

export const getSystem = function() {
  const cpu = serializeCpus()
  const memory = getMemory()
  const os = osName()
  const runtimeVersions = getRuntimeVersions()
  return { CPU: cpu, Memory: memory, OS: os, ...runtimeVersions }
}

const serializeCpus = function() {
  const cpus = getCpus()
  return Object.entries(groupBy(cpus, 'model'))
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

const getRuntimeVersions = function() {
  return { Node: version }
}
