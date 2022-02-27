import { callUserFunc } from './call.js'

// The `parent` option are the names of the parent properties.
// It is exposed as `originalName` and `originalPath`:
//  - Those are meant for error messages
//  - This is as opposed to `name` and `path` which are meant to be used with
//    `funcOpts.config` and `rule.rename`
// It is a dot-delimited string optionally ending with `.`
// By default, there are none.
export const appendParentToName = async function (parent, originalName, opts) {
  const parentA = await getParent(parent, opts)
  const dot = getDot(parentA, originalName)
  return `${parentA}${dot}${originalName}`
}

const getParent = async function (parent, opts) {
  const parentA = await callUserFunc(parent, opts)
  const parentB = String(parentA)
  const parentC = parentB.endsWith('.') ? parentB.slice(0, -1) : parentB
  return parentC
}

const getDot = function (parent, name) {
  return name !== '' && parent !== '' ? '.' : ''
}
