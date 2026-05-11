/** Canadian province / territory codes → full English names */
export const STATE_NAMES: Record<string, string> = {
  'BC': 'British Columbia',
  'AB': 'Alberta',
  'SK': 'Saskatchewan',
  'MB': 'Manitoba',
  'ON': 'Ontario',
  'QC': 'Quebec',
  'NB': 'New Brunswick',
  'NS': 'Nova Scotia',
  'PE': 'Prince Edward Island',
  'NL': 'Newfoundland and Labrador',
  'YT': 'Yukon',
  'NT': 'Northwest Territories',
  'NU': 'Nunavut',
};

/** Map from full province name (as in canada.geojson `properties.name`) to province code */
export const PROVINCE_NAME_TO_CODE: Record<string, string> = {
  ...Object.fromEntries(Object.entries(STATE_NAMES).map(([code, name]) => [name, code])),
  // Geojson variant — file uses "Yukon Territory" rather than "Yukon"
  'Yukon Territory': 'YT',
};

/** Convenience array of all province codes */
export const ALL_STATE_FIPS = Object.keys(STATE_NAMES);

/**
 * Returns a teal rgba fill for mapped provinces.
 * @param intensity 0..1 — maps to 8–60% opacity
 */
export function regionFillColor(intensity: number): string {
  const clamped = Math.max(0, Math.min(1, intensity));
  const opacity = 0.08 + clamped * 0.52; // 0.08 → 0.60
  return `rgba(80,184,154,${opacity.toFixed(2)})`;
}

/**
 * Returns a red/amber rgba fill for provinces flagged as anomalies.
 * Used by the dashboard to flag SE Ontario CPL anomaly visually.
 */
export function anomalyFillColor(intensity: number): string {
  const clamped = Math.max(0, Math.min(1, intensity));
  const opacity = 0.32 + clamped * 0.45; // 0.32 → 0.77
  return `rgba(239,68,68,${opacity.toFixed(2)})`;
}
