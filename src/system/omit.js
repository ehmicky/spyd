import omit from 'omit.js'

// Some footer information can be toggled using `showSystem` and `showMetadata`.
// This only impacts the footer, not the properties of the target result nor
// history results.
export const omitFooterProps = function (footer, showMetadata, showSystem) {
  const footerA = maybeOmit(footer, showMetadata, METADATA_FOOTER_PROPS)
  const systems = footerA.systems.map((system) =>
    omitFooterSystemProps(system, showMetadata, showSystem),
  )
  return { ...footerA, systems }
}

const omitFooterSystemProps = function (system, showMetadata, showSystem) {
  const systemA = maybeOmit(system, showMetadata, METADATA_SYSTEM_PROPS)
  const systemB = maybeOmit(systemA, showSystem, MAIN_SYSTEM_PROPS)
  return systemB
}

const METADATA_FOOTER_PROPS = ['id', 'mergeId', 'timestamp']
const METADATA_SYSTEM_PROPS = ['git', 'ci']
const MAIN_SYSTEM_PROPS = ['machine', 'versions']

const maybeOmit = function (obj, showProp, propNames) {
  return showProp ? obj : omit.default(obj, propNames)
}

// The target result should not include any properties which should be shown
// with the footer instead.
// However, history results should keep metadata properties which are useful
// to display as header in time series.
export const omitMetadataProps = function (result) {
  return omit.default(result, METADATA_PROPS)
}

export const omitSystemProps = function (historyResult) {
  return omit.default(historyResult, SYSTEM_PROPS)
}

const METADATA_PROPS = ['id', 'mergeId', 'timestamp']
const SYSTEM_PROPS = ['systems']
