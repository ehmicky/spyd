import { underline } from 'chalk'

import { isEmptyObject } from '../../../utils/main.js'
import { addBlockPrefix } from '../prefix.js'

// Serialize `ci` information for CLI reporters.
export const prettifyCi = function (ci) {
  if (ci === undefined || isEmptyObject(ci)) {
    return
  }

  const providerPretty = prettifyProvider(ci)
  const buildPretty = prettifyBuild(ci)
  const body = addBlockPrefix('Ci', { ...providerPretty, ...buildPretty })
  return body
}

const prettifyProvider = function ({ provider }) {
  if (provider === undefined) {
    return {}
  }

  return { Provider: provider }
}

const prettifyBuild = function ({ buildNumber, buildUrl }) {
  if (buildNumber === undefined) {
    return
  }

  const url = buildUrl === undefined ? '' : ` (${underline(buildUrl)})`
  return { Build: `#${buildNumber}${url}` }
}
