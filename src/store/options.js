import { dirname } from 'path'

import readPkgUp from 'read-pkg-up'

// Call `store.init(storeOpts)`
export const normalizeStore = async function (
  { cwd, store: { opts: storeOpts, init, ...store }, ...opts },
  action,
) {
  if (NO_STORE_ACTIONS.includes(action)) {
    return { ...opts, cwd }
  }

  const storeOptsA = await getStoreOpts(cwd, storeOpts)
  const initOpts = await callInit(init, storeOptsA)
  const storeA = bindInitOpts(store, initOpts)
  return { ...opts, cwd, store: storeA }
}

const NO_STORE_ACTIONS = ['debug']

// Add `cwd`, `root` and `name` to store options passed to `init()`
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

const callInit = async function (init, storeOpts) {
  try {
    return await init(storeOpts)
  } catch (error) {
    throw new Error(`Could not initialize store: ${error.message}`)
  }
}

// Pass return value of `init()` to every store method
const bindInitOpts = function (store, initOpts) {
  return Object.fromEntries(
    STORE_METHODS.map((method) => bindMethod(store, method, initOpts)),
  )
}

const STORE_METHODS = ['list', 'add', 'replace', 'remove', 'destroy']

const bindMethod = function (store, method, initOpts) {
  const originalFunc = store[method]
  const func = (...args) => originalFunc(...args, initOpts)
  return [method, func]
}
