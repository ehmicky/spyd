export const getNodeVersions = function({ versions }) {
  if (versions === undefined) {
    return
  }

  const versionsA = versions.split(WHITESPACE_REGEXP)
  return versionsA
}

const WHITESPACE_REGEXP = /\s+/u
