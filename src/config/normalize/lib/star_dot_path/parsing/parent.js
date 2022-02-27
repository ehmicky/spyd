import { SEPARATOR } from './special.js'

// Check if a query is a parent of another
export const isParent = function (parentQuery, childQuery) {
  return childQuery.startsWith(`${parentQuery}${SEPARATOR}`)
}
