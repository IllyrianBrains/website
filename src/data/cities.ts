import rawCities from './cities.csv?raw';
import { csvRows } from './csv';

export const defaultCityImage = '/assets/cities/default.svg';

export interface CommunityCity {
  city: string;
  country: string;
  lat: number;
  lng: number;
  slug: string;
  status: 'active' | 'inactive';
  lumaUrl?: string;
  activities?: string[];
  image?: string;
}

function citiesFromCsv(text: string): CommunityCity[] {
  return csvRows(text).map(({ col }) => {
    const status = col('status').toLowerCase();
    const activities = col('activities').split(';').map(a => a.trim()).filter(Boolean);
    return {
      city: col('city'),
      country: col('country'),
      lat: Number(col('lat')),
      lng: Number(col('lng')),
      slug: col('slug'),
      status: status === 'inactive' ? 'inactive' : 'active',
      lumaUrl: col('lumaUrl') || undefined,
      activities: activities.length ? activities : undefined,
      image: col('image') || undefined,
    };
  });
}

export const cities: CommunityCity[] = citiesFromCsv(rawCities);
