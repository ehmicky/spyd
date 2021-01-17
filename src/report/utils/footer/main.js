import { getSharedSystem, getSystems } from './systems.js'

// Retrieve footer: id, timestamp, spydVersion, systems
export const getFooter = function ({ id, timestamp, spydVersion, systems }) {
  return [
    {
      ...getSharedSystem(systems),
      'Benchmarked with spyd': spydVersion,
    },
    getSystems(systems),
    {
      Id: id,
      Timestamp: getTimestamp(timestamp),
    },
  ]
}

const getTimestamp = function (timestamp) {
  if (timestamp === undefined) {
    return
  }

  return new Date(timestamp).toLocaleString()
}
