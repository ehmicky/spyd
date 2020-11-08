import { blue } from 'chalk'

import { indentBlock } from './indent.js'

// Add a title as prefix for terminal reporters
export const addIndentedPrefix = function (name, block) {
  if (block === undefined) {
    return
  }

  const prefix = getPrefix(name)
  const blockA = indentBlock(block)
  return `${prefix}\n${blockA}`
}

export const addPrefix = function (name, value) {
  if (value === undefined) {
    return
  }

  const prefix = getPrefix(name)
  return `${prefix} ${value}`
}

const getPrefix = function (name) {
  return blue.bold(`${name}:`)
}
