import { getSharedSystem, getSystems } from './systems.js'

// Retrieve footer: id, timestamp, systems
export const getFooter = function ({ id, timestamp, systems }) {
  return [
    getSharedSystem(systems),
    getSystems(systems),
    { Id: id, Timestamp: getTimestamp(timestamp) },
  ]
}

const getTimestamp = function (timestamp) {
  if (timestamp === undefined) {
    return
  }

  return new Date(timestamp).toLocaleString()
}
