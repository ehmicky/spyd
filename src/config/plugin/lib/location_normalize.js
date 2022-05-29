import { CoreError, ConsumerError } from './error.js'
import { NORMALIZE_LOCATIONS } from './location_type.js'
import { safeNormalizeConfig } from './normalize.js'

// Normalize `pluginConfig[pluginProp]`
export const normalizeLocation = async function ({
  opts: { cwd, builtins, modulePrefix, prefix, keywords },
  originalLocation,
  locationName,
  locationType,
}) {
  const locationRules = getLocationRules(locationType)
  return await safeNormalizeConfig(originalLocation, locationRules, {
    all: {
      cwd,
      prefix,
      parent: locationName,
      context: { locationType, builtins, modulePrefix },
    },
    keywords,
    InputErrorType: ConsumerError,
    DefinitionErrorType: CoreError,
  })
}

const getLocationRules = function (locationType) {
  return [
    normalizeLocationProp,
    ...NORMALIZE_LOCATIONS[locationType].map(addRootName),
  ]
}

const addRootName = function (rule) {
  return { ...rule, name: '.' }
}

export const getExampleLocation = function ({ context: { builtins } }) {
  const builtinNames = Object.keys(builtins)
  return builtinNames.length !== 0 && builtinNames[0].trim() !== ''
    ? builtinNames[0]
    : undefined
}

const normalizeLocationProp = {
  name: '.',
  required: true,
  example: getExampleLocation,
}
