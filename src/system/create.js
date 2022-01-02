import { v4 as uuidv4 } from 'uuid'

import { getMergeIdProp } from '../history/merge/id.js'

import { listSystem } from './system/list.js'
import { getTimestamp } from './timestamp.js'

// Create the top properties of a new result
export const createTopProps = function (config) {
  const id = uuidv4()
  const mergeId = getMergeIdProp(config)
  const timestamp = getTimestamp()
  const system = listSystem(config)
  return { id, ...mergeId, timestamp, systems: [system] }
}
