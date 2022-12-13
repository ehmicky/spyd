// We sort metadataGroups by timestamp, and only consider the timestamp of the
// most recent result.
export const findByTime = (metadataGroups, timestamp) =>
  metadataGroups.findIndex(
    (metadata) => metadata[metadata.length - 1].timestamp >= timestamp,
  )
