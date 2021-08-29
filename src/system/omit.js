import omit from 'omit.js'

// Some footer information can be toggled using `showSystem` and `showMetadata`.
// This only impacts the footer, not the properties of the target result nor
// history results.
export const omitFooterProps = function (footer, showMetadata, showSystem) {
  const footerA = maybeOmit(footer, showMetadata, METADATA_FOOTER_PROPS)
  const systems = footerA.systems.map((system) =>
    omitSystemProps(system, showMetadata, showSystem),
  )
  return { ...footerA, systems }
}

const omitSystemProps = function (system, showMetadata, showSystem) {
  const systemA = maybeOmit(system, showMetadata, METADATA_SYSTEM_PROPS)
  const systemB = maybeOmit(systemA, showSystem, MAIN_SYSTEM_PROPS)
  return systemB
}

const METADATA_FOOTER_PROPS = ['id', 'timestamp']
const METADATA_SYSTEM_PROPS = ['git', 'ci']
const MAIN_SYSTEM_PROPS = ['machine', 'versions']

const maybeOmit = function (obj, showProp, propNames) {
  return showProp ? obj : omit.default(obj, propNames)
}
