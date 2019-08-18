import { dirname } from 'path'

import readPkgUp from 'read-pkg-up'

// Add `cwd`, `packageRoot` and `name` to every store options
export const normalizeStore = async function({
  cwd,
  store: { opts: storeOpts, ...store },
  ...opts
}) {
  const { packageRoot, name } = await getPackageInfo(cwd)

  return {
    ...opts,
    cwd,
    store: { opts: { ...storeOpts, cwd, packageRoot, name }, ...store },
  }
}

const getPackageInfo = async function(cwd) {
  const packageInfo = await readPkgUp(cwd)

  if (packageInfo === undefined) {
    return { packageRoot: cwd }
  }

  const {
    package: { name },
    path,
  } = packageInfo
  const packageRoot = dirname(path)
  return { packageRoot, name }
}
