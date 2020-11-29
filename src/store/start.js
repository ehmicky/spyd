import { dirname } from 'path'

import readPkgUp from 'read-pkg-up'

import { UserError } from '../error/main.js'

// Call `store.start(storeConfig)`
export const startStore = async function ({
  cwd,
  store: { config: storeConfig, start, ...store },
  ...config
}) {
  const storeConfigA = await getStoreConfig(cwd, storeConfig)
  const startConfig = await callStart(start, storeConfigA)
  const storeA = bindStartConfig(store, startConfig)
  return { ...config, cwd, store: storeA }
}

// Add `cwd`, `root` and `name` to store config passed to `start()`
const getStoreConfig = async function (cwd, storeConfig) {
  const { root, name } = await getPackageInfo(cwd)
  return { cwd, root, name, ...storeConfig }
}

const getPackageInfo = async function (cwd) {
  const packageInfo = await readPkgUp(cwd)

  if (packageInfo === undefined) {
    return { root: cwd }
  }

  const {
    packageJson: { name },
    path,
  } = packageInfo
  const root = dirname(path)
  return { root, name }
}

const callStart = async function (start, storeConfig) {
  try {
    return await start(storeConfig)
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
