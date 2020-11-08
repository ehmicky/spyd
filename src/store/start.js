import { dirname } from 'path'

import readPkgUp from 'read-pkg-up'

import { UserError } from '../error/main.js'

// Call `store.start(storeOpts)`
export const startStore = async function ({
  cwd,
  store: { opts: storeOpts, start, ...store },
  ...opts
}) {
  const storeOptsA = await getStoreOpts(cwd, storeOpts)
  const startOpts = await callStart(start, storeOptsA)
  const storeA = bindInitOpts(store, startOpts)
  return { ...opts, cwd, store: storeA }
}

// Add `cwd`, `root` and `name` to store options passed to `start()`
const getStoreOpts = async function (cwd, storeOpts) {
  const { root, name } = await getPackageInfo(cwd)
  return { cwd, root, name, ...storeOpts }
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

const callStart = async function (start, storeOpts) {
  try {
    return await start(storeOpts)
  } catch (error) {
    throw new UserError(`Could not start store: ${error.message}`)
  }
}

// Pass return value of `start()` to every store method
const bindInitOpts = function (store, startOpts) {
  return Object.fromEntries(
    STORE_METHODS.map((method) => bindMethod(store, method, startOpts)),
  )
}

const STORE_METHODS = ['list', 'add', 'replace', 'remove', 'end']

const bindMethod = function (store, method, startOpts) {
  const originalFunc = store[method]
  const func = (...args) => originalFunc(...args, startOpts)
  return [method, func]
}
