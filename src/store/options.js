import pkgDir from 'pkg-dir'

// Add `cwd` and `packageRoot` to every store options
export const normalizeStore = async function({
  cwd,
  store: { opts: storeOpts, ...store },
  ...opts
}) {
  const packageRoot = await getPackageRoot(cwd)

  return {
    ...opts,
    cwd,
    store: { opts: { ...storeOpts, cwd, packageRoot }, ...store },
  }
}

const getPackageRoot = async function(cwd) {
  const packageRoot = await pkgDir(cwd)

  if (packageRoot === undefined) {
    return cwd
  }

  return packageRoot
}
