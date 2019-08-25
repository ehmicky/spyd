import { cpus as getCpus, totalmem } from 'os'

import osName from 'os-name'
import { format as formatBytes } from 'bytes'

import { groupBy } from '../utils/group.js'

import { getOpts } from './options.js'

export const getSystems = function(opts, { id, title }) {
  const optsA = getOpts(opts)
  const system = getSystem()
  return [{ id, title, opts: optsA, ...system }]
}

const getSystem = function() {
  const cpu = serializeCpus()
  const memory = getMemory()
  const os = osName()
  return { cpu, memory, os }
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
