import { UserError } from '../../error/main.js'
import { findIndexReverse } from '../../utils/find.js'

// Delta can be "ci", to compare with last CI build.
const parseCi = function (delta, { buildUrl: ciBuild }) {
  if (typeof delta !== 'string' || delta.toLowerCase() !== CI_DELTA) {
    return
  }

  if (ciBuild === undefined) {
    throw new UserError('can only be used in CI')
  }

  return ciBuild
}

const CI_DELTA = 'ci'

// Find the most recent result with a different CI build.
const findByCi = function (results, ciBuild) {
  return findIndexReverse(
    results,
    ({ system: { ci } }) => ci !== undefined && ci !== ciBuild,
  )
}

export const ciFormat = {
  type: 'ci',
  message: 'CI',
  parse: parseCi,
  find: findByCi,
}
