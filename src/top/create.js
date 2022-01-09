import { createSubId } from '../history/merge/id.js'

import { getTimestamp } from './timestamp.js'

// Create the top properties of a new result
export const createTopProps = function ({ merge }) {
  const subId = createSubId()
  const timestamp = getTimestamp()
  return { id: merge, subId, timestamp }
}
