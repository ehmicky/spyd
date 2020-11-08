import { blue } from 'chalk'

import { indentBlock } from './indent.js'

// Add a title as prefix for terminal reporters
export const addBlockPrefix = function (title, block) {
  const body = Object.entries(block)
    .map(addBlockLinePrefix)
    .filter(Boolean)
    .join('\n')
  const bodyA = addIndentedPrefix(title, body)
  return bodyA
}

const addBlockLinePrefix = function ([title, value]) {
  return addPrefix(title, value)
}

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
