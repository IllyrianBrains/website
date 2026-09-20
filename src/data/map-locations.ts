// Locations that appear on organization maps but are not necessarily official
// Illyrian Brains city chapters. Keys use the same accent-insensitive
// normalization as the map components.
export const additionalNgoLocations: Record<string, { city: string; country: string; lat: number; lng: number }> = {
  kutine: { city: 'Kutinë', country: 'Kroaci', lat: 45.4750, lng: 16.7819 },
  zagreb: { city: 'Zagreb', country: 'Kroaci', lat: 45.8150, lng: 15.9819 },
  librazhd: { city: 'Librazhd', country: 'Shqipëri', lat: 41.1790, lng: 20.3158 },
};
