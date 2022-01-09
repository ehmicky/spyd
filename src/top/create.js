import { listSystem } from './system/list.js'
import { getTimestamp } from './timestamp.js'

// Create the top properties of a new result
export const createTopProps = function ({ merge, system, cwd }) {
  const timestamp = getTimestamp()
  const systems = [listSystem(system, cwd)]
  return { id: merge, timestamp, systems }
}
