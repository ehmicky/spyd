import {
  callValueFunc,
  callUndefinedValueFunc,
  callNoValueFunc,
} from './call.js'
import { PLUGINS } from './plugins/main.js'

/* eslint-disable complexity, max-statements, fp/no-let, fp/no-loops, max-depth,
   no-continue, no-await-in-loop, fp/no-mutation */
export const performPlugins = async function (rule, value, opts) {
  let valueA = value

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

    const { skip } = returnValue

    if (skip) {
      break
    }
  }

  return valueA
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
