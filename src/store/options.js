import { dirname } from 'path'

import readPkgUp from 'read-pkg-up'

// Add `cwd`, `root` and `name` to every store options
export const normalizeStore = async function({
  cwd,
  store: { opts: storeOpts, ...store },
  ...opts
}) {
  const { root, name } = await getPackageInfo(cwd)

  return {
    ...opts,
    cwd,
    store: { opts: { ...storeOpts, cwd, root, name }, ...store },
  }
}

const getPackageInfo = async function(cwd) {
  const packageInfo = await readPkgUp(cwd)

  if (packageInfo === undefined) {
    return { root: cwd }
  }

  const {
    package: { name },
    path,
  } = packageInfo
  const root = dirname(path)
  return { root, name }
}
