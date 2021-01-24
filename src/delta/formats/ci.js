import { UserError } from '../../error/main.js'

// CI-friendly delta.
// Compare with last CI build.
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
// If none is found, falls back to least recent result.
const findByCi = function (results, ciBuild) {
  const index = results.findIndex(
    ({ system: { ci } }) => ci !== undefined && ci !== ciBuild,
  )

  if (index !== -1) {
    return index
  }

  return results.length - 1
}

export const ciFormat = {
  type: 'ci',
  message: 'CI',
  parse: parseCi,
  find: findByCi,
}
