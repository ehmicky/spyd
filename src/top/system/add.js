import { cpus as listCpus, totalmem } from 'node:os'

import envCi from 'env-ci'
import osName from 'os-name'

import { cleanObject } from '../../utils/clean.js'
import { groupBy } from '../../utils/group.js'

// Users can specify a `system` configuration property.
// This is a combination dimension meant to compare any environment differences,
// outside of spyd: hardware, OS, git branch, environment variables, etc.
// All that information are automatically computed.
// The `versions` are computed by runners.
// We purposely keep the data as raw as possible to give flexibility to the
// reporters on how to serialize it
//  - For example, this allows changing the reporting without changing the
//    history results
// We allow multiple system dimensions because it:
//  - Looks nicer to separate those and sort them individually in reporting
//  - Is easier for selection with `select` and config selectors
//  - Is easier to configure titles
// Users specify those multiple system dimensions using an object, as opposed to
// either an array of strings or an underscore-separated string because:
//  - Comparing dimensions index-wise instead of name-wise:
//     - Makes it harder to remove dimensions
//        - Including for temporary system dimensions
//     - Leads to easier mistakes from users, using wrong indexes
//  - It would be harder to define default ids
// We do not provide with a string short notation (as opposed to object) with
// a default system dimension because:
//  - Monomorphism is simpler
//     - Especially as multiple system dimensions are likely
//  - It encourages using multiple system dimensions instead of putting them
//    inside multiple system ids
// By default, there are no system dimensions:
//  - I.e. `system` is an empty object
//  - Results without system dimensions still persist their system information
//    and show them in the footer.
export const addSystem = function (combinations, { cwd }) {
  const system = getSystem(cwd)
  return combinations.map((combination) => ({ ...combination, system }))
}

const getSystem = function (cwd) {
  const machine = getMachine()
  const { git, ci } = getEnvInfo(cwd)
  return cleanObject({ machine, git, ci })
}

const getMachine = function () {
  const os = osName()
  const cpus = getCpus()
  const memory = totalmem()
  return { os, cpus, memory }
}

const getCpus = function () {
  const cpus = listCpus()
  return Object.entries(groupBy(cpus, 'model')).map(getCpu)
}

const getCpu = function ([model, cores]) {
  return { model, cores: cores.length }
}

const getEnvInfo = function (cwd) {
  const { branch, tag, commit, pr, prBranch, buildUrl } = envCi({ cwd })
  return {
    git: { branch, tag, commit, prNumber: pr, prBranch },
    ci: buildUrl,
  }
}
