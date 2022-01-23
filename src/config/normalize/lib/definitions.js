import pReduce from 'p-reduce'

import { callValueFunc, callUserFunc } from './call.js'
import { parse } from './prop_path/parse.js'

// Properties definitions can optionally be an array.
// This is useful either:
//  - when combined with `condition()`
//  - when the default order is not convenient, e.g. when `validate()` must be
//    run after `normalize()`
export const applyDefinitionList = async function ({
  value,
  name,
  definitionList,
  context,
  get,
}) {
  const path = getPath(name)
  const opts = { name, path, context, get }
  const definitionListA = Array.isArray(definitionList)
    ? definitionList
    : [definitionList]
  const { value: valueA, skipped } = await pReduce(
    definitionListA,
    (memo, definition) => applyDefinition(memo, definition, opts),
    { value, skipped: true },
  )
  return skipped ? undefined : valueA
}

const getPath = function (name) {
  return parse(name).map(getPathKey)
}

const getPathKey = function ({ key }) {
  return key
}

const applyDefinition = async function (
  { value, skipped },
  { condition, default: defaultValue, compute, validate, transform },
  opts,
) {
  if (await againstCondition(value, condition, opts)) {
    return { value, skipped }
  }

  const valueA = await addDefaultValue(value, defaultValue, opts)
  const valueB = await computeValue(valueA, compute, opts)
  await validateValue(valueB, validate, opts)
  const valueC = await transformValue(valueB, transform, opts)
  return { value: valueC, skipped: false }
}

// Apply `condition(opts)` which skips the current definition if `false` is
// returned.
// If all definitions for a given property are skipped, the property is omitted.
const againstCondition = async function (value, condition, opts) {
  return (
    condition !== undefined && !(await callValueFunc(condition, value, opts))
  )
}

// Apply `default(opts)` which assigns a default value
const addDefaultValue = async function (value, defaultValue, opts) {
  return value === undefined ? await callUserFunc(defaultValue, opts) : value
}

// Apply `compute(opts)` which sets a value from the system, instead of the user
const computeValue = async function (value, compute, opts) {
  return compute === undefined ? value : await callUserFunc(compute, opts)
}

// Apply `validate(opts)` which throws on validation errors
const validateValue = async function (value, validate, opts) {
  if (value === undefined || validate === undefined) {
    return
  }

  await callValueFunc(validate, value, opts)
}

// Apply `transform(value)` which transforms the value set by the user
const transformValue = async function (value, transform, opts) {
  if (value === undefined || transform === undefined) {
    return value
  }

  const newValue = await callValueFunc(transform, value, opts)
  return newValue === undefined ? value : newValue
}
