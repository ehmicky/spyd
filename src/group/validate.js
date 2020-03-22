import { isDeepStrictEqual } from 'util'

// Several benchmarks can have the same system, providing it has exactly the
// same options.
// If several benchmarks with the same system have different
// titles/machines/jobs, the last one prevails.
// Several benchmarks from the same group must have the same ci/git.
export const validateMerge = function ({
  previousSystems,
  system,
  previousGit,
  git,
  previousCi,
  ci,
}) {
  validateSameSystem(previousSystems, system)
  validateSame(previousGit, git, {
    propName: 'git commit/branch',
    groups: 'group',
  })
  validateSame(previousCi, ci, { propName: 'CI build number', groups: 'group' })
}

const validateSameSystem = function (previousSystems, system) {
  const duplicateSystem = previousSystems.find(
    (systemA) => systemA.id === system.id,
  )

  if (duplicateSystem === undefined) {
    return
  }

  SAME_SYSTEM_PROPS.forEach((propName) =>
    validateSame(duplicateSystem[propName], system[propName], {
      propName,
      groups: `group and system`,
    }),
  )
}

const SAME_SYSTEM_PROPS = ['opts']

const validateSame = function (objectA, objectB, { propName, groups }) {
  if (!isDeepStrictEqual(objectA, objectB)) {
    throw new Error(`Several benchmarks with the same ${groups} cannot have different ${propName}:
${JSON.stringify(objectA)}
${JSON.stringify(objectB)}`)
  }
}
