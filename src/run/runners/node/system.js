import { version } from 'process'

import { major, minor, patch } from 'semver'

const getNodeMajor = function() {
  return `Node ${major(version)}`
}

const getNodeMinor = function() {
  return `${getNodeMajor()}.${minor(version)}`
}

const getNodePatch = function() {
  return `${getNodeMinor()}.${patch(version)}`
}

export const system = {
  NODE_MAJOR: getNodeMajor,
  NODE_MINOR: getNodeMinor,
  NODE_PATCH: getNodePatch,
}
