import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import { readPackageUp } from 'read-package-up'

// Retrieve runtime versions common to all runners
export const getCommonVersions = async () => await getSpydVersion()

// Store the `spyd` version on each result
// TODO: use static JSON imports once those are possible
const getSpydVersion = async () => {
  const cwd = dirname(fileURLToPath(import.meta.url))
  const {
    packageJson: { version },
  } = await readPackageUp({ cwd, normalize: false })
  return { Spyd: version }
}
