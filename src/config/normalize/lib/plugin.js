import {
  callValueFunc,
  callUndefinedValueFunc,
  callNoValueFunc,
} from './call.js'
import { PLUGINS } from './plugins/main.js'
import { addWarning } from './warn.js'

/* eslint-disable complexity, max-statements, fp/no-let, fp/no-loops, max-depth,
   no-continue, no-await-in-loop, fp/no-mutation */
export const performPlugins = async function ({ rule, value, opts, warnings }) {
  let valueA = value
  let warningsA = warnings

  for (const plugin of PLUGINS) {
    const { name, main, defined = true, input = false } = plugin
    const ruleArg = rule[name]

    if (
      ruleArg === undefined ||
      (defined === true && value === undefined) ||
      (defined === false && value !== undefined)
    ) {
      continue
    }

    const ruleArgA =
      typeof ruleArg === 'function'
        ? await callFunc({ func: ruleArg, value, opts, input, defined })
        : ruleArg

    if (ruleArgA === undefined) {
      continue
    }

    const returnValue = await callFunc({
      func: main.bind(undefined, ruleArgA),
      value,
      opts,
      input,
      defined,
    })

    if (returnValue === undefined) {
      continue
    }

    // We allow transforming to `undefined`, i.e. returning
    // `{ value: undefined }` is different from returning `{}`
    if ('value' in returnValue) {
      valueA = returnValue.value
    }

    const { warning, skip } = returnValue

    if (warning !== undefined) {
      warningsA = addWarning(warnings, warning, opts)
    }

    if (skip) {
      break
    }
  }

  return { value: valueA, warnings: warningsA }
}
/* eslint-enable complexity, max-statements, fp/no-let, fp/no-loops, max-depth,
   no-continue, no-await-in-loop, fp/no-mutation */

// TODO: call logic should not check `typeof function` anymore
const callFunc = async function ({ func, value, opts, input, defined }) {
  if (input) {
    return await callValueFunc(func, value, opts)
  }

  if (defined === null) {
    return await callNoValueFunc(func, opts)
  }

  return await callUndefinedValueFunc(func, opts)
}
