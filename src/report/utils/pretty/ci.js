import { underline } from 'chalk'

import { isEmptyObject } from '../../../utils/main.js'
import { addBlockPrefix } from '../prefix.js'

// Serialize `ci` information for CLI reporters.
export const prettifyCi = function (ci) {
  if (ci === undefined || isEmptyObject(ci)) {
    return
  }

  const body = addBlockPrefix('Ci', {
    Provider: ci.provider,
    Build: prettifyBuild(ci),
  })
  return body
}

const prettifyBuild = function ({ buildNumber, buildUrl }) {
  if (buildNumber === undefined) {
    return
  }

  const url = buildUrl === undefined ? '' : ` (${underline(buildUrl)})`
  return `#${buildNumber}${url}`
}
