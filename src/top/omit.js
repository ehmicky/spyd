import { excludeKeys, includeKeys } from 'filter-obj'

// We only expose specific properties to reporters.
// For example, we do not expose subId.
export const pickTopProps = (result) => includeKeys(result, REPORTED_TOP_PROPS)

const REPORTED_TOP_PROPS = [
  'id',
  'timestamp',
  'combinations',
  'history',
  'screenWidth',
  'screenHeight',
]

// Same as `pickToProps()` but for combinations
export const pickCombProps = (result) => {
  const combinations = result.combinations.map((combination) =>
    includeKeys(combination, REPORTED_COMB_PROPS),
  )
  return { ...result, combinations }
}

const REPORTED_COMB_PROPS = ['dimensions', 'stats']

// Systems/footers are only used in the target result, not the history results,
// since they are not very useful for those.
//  - History results keep their metadata properties since they are useful to
//    display as header in time series.
//  - The target result does not not, since the footer should be used instead
export const omitMetadataFooterProps = (result) =>
  excludeKeys(result, METADATA_FOOTER_PROPS)

// Some footer information can be toggled using `showSystem` and `showMetadata`.
// This only impacts the footer, not the properties of the target result nor
// history results.
export const omitFooterProps = (footer, showMetadata, showSystem) => {
  const showSystemA = addShowSystemDefault(footer.systems, showSystem)
  const footerA = maybeOmit(footer, showMetadata, METADATA_FOOTER_PROPS)
  const systems = footerA.systems.map((system) =>
    omitFooterSystemProps(system, showMetadata, showSystemA),
  )
  return { ...footerA, systems }
}

// By default, we show systems only if the result was created with the `system`
// configuration property, i.e. there are some system dimensions
const addShowSystemDefault = (systems, showSystem) =>
  showSystem === undefined ? systems.some(hasSystemDimensions) : showSystem

const hasSystemDimensions = ({ dimensions }) =>
  Object.keys(dimensions).length !== 0

const omitFooterSystemProps = (system, showMetadata, showSystem) => {
  const systemA = maybeOmit(system, showMetadata, METADATA_SYSTEM_PROPS)
  const systemB = maybeOmit(systemA, showSystem, MAIN_SYSTEM_PROPS)
  return systemB
}

const METADATA_FOOTER_PROPS = ['id', 'timestamp']
const METADATA_SYSTEM_PROPS = ['git', 'ci']
const MAIN_SYSTEM_PROPS = ['machine', 'versions']

const maybeOmit = (obj, showProp, propNames) =>
  showProp ? obj : excludeKeys(obj, propNames)

export const getShowMetadataDefault = ({ context: { command } }) =>
  SHOW_METADATA_COMMANDS.has(command)

const SHOW_METADATA_COMMANDS = new Set(['show', 'remove'])
