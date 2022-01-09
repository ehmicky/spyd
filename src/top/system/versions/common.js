import { dirname } from 'path'
import { fileURLToPath } from 'url'

import { readPackageUp } from 'read-pkg-up'

// Retrieve runtime versions common to all runners
export const getCommonVersions = async function () {
  return await getSpydVersion()
}

// Store the `spyd` version on each result
// TODO: use static JSON imports once those are possible
const getSpydVersion = async function () {
  const cwd = dirname(fileURLToPath(import.meta.url))
  const {
    packageJson: { version },
  } = await readPackageUp({ cwd, normalize: false })
  return { Spyd: version }
}
