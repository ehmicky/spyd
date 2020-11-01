import { version } from 'process'

import { major, minor, patch } from 'semver'

const getNodeMajor = function () {
  return `Node ${major(version)}`
}

const getNodeMinor = function () {
  return `${getNodeMajor()}.${minor(version)}`
}

const getNodePatch = function () {
  return `${getNodeMinor()}.${patch(version)}`
}

// Can be used as variable inside `system`
export const system = {
  node_major: getNodeMajor,
  node_minor: getNodeMinor,
  node_patch: getNodePatch,
}
