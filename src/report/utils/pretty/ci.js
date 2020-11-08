import { underline } from 'chalk'

import { prettifyObject } from '../prefix.js'

// Serialize `ci` information for CLI reporters.
export const prettifyCi = function (ci) {
  if (ci === undefined) {
    return ''
  }

  return prettifyObject({
    Ci: {
      Provider: ci.provider,
      Build: prettifyBuild(ci),
    },
  })
}

const prettifyBuild = function ({ buildNumber, buildUrl }) {
  if (buildNumber === undefined) {
    return
  }

  const url = buildUrl === undefined ? '' : ` (${underline(buildUrl)})`
  return `#${buildNumber}${url}`
}
