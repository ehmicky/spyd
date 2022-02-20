import { callUserFunc } from './call.js'

// The `parents` option are the names of the parent properties.
// It is exposed as `originalName` and `originalPath`:
//  - Those are meant for error messages
//  - This is as opposed to `name` and `path` which are meant to be used with
//    `funcOpts.config` and `rule.rename`
// It is a dot-delimited string optionally ending with `.`
// By default, there are none.
export const appendParentsToName = async function (
  parents,
  originalName,
  opts,
) {
  const parentsA = await getParents(parents, opts)
  const dot = getDot(parentsA, originalName)
  return `${parentsA}${dot}${originalName}`
}

const getParents = async function (parents, opts) {
  const parentsA = await callUserFunc(parents, opts)
  const parentsB = String(parentsA)
  const parentsC = parentsB.endsWith('.') ? parentsB.slice(0, -1) : parentsB
  return parentsC
}

const getDot = function (parents, name) {
  return name !== '' && parents !== '' ? '.' : ''
}
