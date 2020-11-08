import { underline } from 'chalk'

import { isEmptyObject } from '../../../utils/main.js'
import { addPrefix, addIndentedPrefix } from '../prefix.js'

// Serialize `ci` information for CLI reporters.
export const prettifyCi = function (ci) {
  if (ci === undefined || isEmptyObject(ci)) {
    return
  }

  const providerPretty = prettifyProvider(ci)
  const buildPretty = prettifyBuild(ci)
  const body = [providerPretty, buildPretty].filter(Boolean).join('\n')
  const bodyA = addIndentedPrefix('Ci', body)
  return bodyA
}

const prettifyProvider = function ({ provider }) {
  if (provider === undefined) {
    return
  }

  return addPrefix('Provider', provider)
}

const prettifyBuild = function ({ buildNumber, buildUrl }) {
  if (buildNumber === undefined) {
    return
  }

  const url = buildUrl === undefined ? '' : ` (${underline(buildUrl)})`
  return addPrefix('Build', `#${buildNumber}${url}`)
}
