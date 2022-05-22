import {
  callValueFunc,
  callUndefinedValueFunc,
  callNoValueFunc,
} from './call.js'
import { PLUGINS } from './plugins.js'

// eslint-disable-next-line complexity, max-statements
export const performPlugins = async function (rule, value, opts) {
  // eslint-disable-next-line fp/no-let
  let valueA = value

  // eslint-disable-next-line fp/no-loops
  for (const plugin of PLUGINS) {
    const { name, main, defined = true, input = false } = plugin
    const ruleArg = rule[name]

    // eslint-disable-next-line max-depth
    if (
      ruleArg === undefined ||
      (defined === true && value === undefined) ||
      (defined === false && value !== undefined)
    ) {
      // eslint-disable-next-line no-continue
      continue
    }

    const ruleArgA =
      typeof ruleArg === 'function'
        ? // eslint-disable-next-line no-await-in-loop
          await callFunc({ func: ruleArg, value, opts, input, defined })
        : ruleArg

    // eslint-disable-next-line max-depth
    if (ruleArgA === undefined) {
      // eslint-disable-next-line no-continue
      continue
    }

    // eslint-disable-next-line no-await-in-loop
    const returnValue = await callFunc({
      func: main.bind(undefined, ruleArgA),
      value,
      opts,
      input,
      defined,
    })

    // eslint-disable-next-line max-depth
    if (returnValue === undefined) {
      // eslint-disable-next-line no-continue
      continue
    }

    // We allow transforming to `undefined`, i.e. returning
    // `{ value: undefined }` is different from returning `{}`
    // eslint-disable-next-line max-depth
    if ('value' in returnValue) {
      // eslint-disable-next-line fp/no-mutation
      valueA = returnValue.value
    }

    const { skip } = returnValue

    // eslint-disable-next-line max-depth
    if (skip) {
      break
    }
  }

  return valueA
}

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
