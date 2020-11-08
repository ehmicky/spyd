// Serialize `ci` information for CLI reporters.
export const prettifyCi = function (ci) {
  if (ci === undefined) {
    return
  }

  return {
    Ci: {
      Provider: ci.provider,
      Build: prettifyBuild(ci),
    },
  }
}

const prettifyBuild = function ({ buildNumber, buildUrl }) {
  if (buildNumber === undefined) {
    return
  }

  const url = buildUrl === undefined ? '' : ` (${buildUrl})`
  return `#${buildNumber}${url}`
}
