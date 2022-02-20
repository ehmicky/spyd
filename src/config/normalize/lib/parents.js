import { callUserFunc } from './call.js'

// The `parents` option are the names of the parent properties, to show in
// error messages.
// It is a dot-delimited string optionally ending with `.`
// By default, there are none.
export const appendParentsToName = async function (parents, name, opts) {
  const parentsA = await getParents(parents, opts)
  const dot = getDot(parentsA, name)
  return `${parentsA}${dot}${name}`
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
