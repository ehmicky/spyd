import { UserError } from '../error/main.js'

// Call `store.start(storeConfig)`
export const startStore = async function ({
  stores: [{ config: storeConfig, start, ...store }],
  ...config
}) {
  const startConfig = await callStart(start, storeConfig, config)
  const storeA = bindStartConfig(store, startConfig)
  return { ...config, store: storeA }
}

const callStart = async function (start, storeConfig, { cwd }) {
  try {
    return await start({ ...storeConfig, cwd })
  } catch (error) {
    throw new UserError(`Could not start store: ${error.message}`)
  }
}

// Pass return value of `start()` to every store method
const bindStartConfig = function (store, startConfig) {
  return Object.fromEntries(
    STORE_METHODS.map((method) => bindMethod(store, method, startConfig)),
  )
}

const STORE_METHODS = ['list', 'add', 'replace', 'remove', 'end']

const bindMethod = function (store, method, startConfig) {
  const originalFunc = store[method]
  const func = (...args) => originalFunc(...args, startConfig)
  return [method, func]
}
