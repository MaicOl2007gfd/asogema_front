export const DOCUMENT_TYPES = [
  { value: 'CC', label: 'Cédula de Ciudadanía' },
  { value: 'CE', label: 'Cédula de Extranjería' },
  { value: 'PAS', label: 'Pasaporte' },
  { value: 'RC', label: 'Registro Civil' },
  { value: 'NIT', label: 'NIT' },
  { value: 'CD', label: 'Carné Diplomático' },
]

export const DOC_TYPE_IDS = { CC: 1, CE: 2, PAS: 3, RC: 4, NIT: 5, CD: 6 }

export function getDocTypeLabel(id) {
  const entry = Object.entries(DOC_TYPE_IDS).find(([, v]) => v === id)
  if (!entry) return ''
  const dt = DOCUMENT_TYPES.find(d => d.value === entry[0])
  return dt ? dt.label : ''
}
