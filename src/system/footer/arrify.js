export const arrifyFooter = function ({ Id, Timestamp, systems }) {
  const systemsA = systems.map(addTitle)
  return Id === undefined ? systemsA : [...systemsA, { Id, Timestamp }]
}

const addTitle = function ({ title, ...system }) {
  return title === undefined ? system : { [title]: system }
}
