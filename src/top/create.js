import { createSubId } from '../history/merge/id.js'

import { getTimestamp } from './timestamp.js'

// Create the top properties of a new result
export const createTopProps = ({ id }) => {
  const subId = createSubId()
  const timestamp = getTimestamp()
  return { id, subId, timestamp }
}
