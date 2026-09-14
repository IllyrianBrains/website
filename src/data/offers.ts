import rawOffers from './offers.csv?raw';
import { csvRows } from './csv';

export interface BusinessOffer {
  business: string;
  title: string;
  type: string;
  audience: string;
  validUntil?: string;
  url?: string;
}

export const offers: BusinessOffer[] = csvRows(rawOffers).map(({ col }) => ({
  business: col('business'),
  title: col('title'),
  type: col('type'),
  audience: col('audience'),
  validUntil: col('validUntil') || undefined,
  url: col('url') || undefined,
}));
