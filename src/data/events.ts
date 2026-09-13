export type ActivityLevel = 'shumë aktiv' | 'aktiv' | 'në rritje' | 'në formim' | 'joaktiv';

export interface CommunityEvent {
  title: string;
  citySlug: string;
  start: string;
  end?: string;
  location: string;
  description?: string;
  image?: string;
  registrationUrl?: string;
  category?: 'Happy Hour' | 'Workshop' | 'Kulturë' | 'Sport' | 'Konferencë' | 'Online' | 'Tjetër';
}

/**
 * Add events here using ISO dates, including the local timezone offset.
 *
 * Example:
 * {
 *   title: 'Happy Hour Berlin',
 *   citySlug: 'berlin',
 *   start: '2026-10-16T19:00:00+02:00',
 *   end: '2026-10-16T22:00:00+02:00',
 *   location: 'Berlin, Gjermani',
 *   description: 'Një mbrëmje për njohje dhe biseda mes profesionistëve.',
 *   category: 'Happy Hour',
 *   registrationUrl: 'https://luma.com/your-event',
 *   image: '/assets/events/berlin-happy-hour.jpg',
 * },
 */
export const events: CommunityEvent[] = [];

/** Set the current activity level only for cities where it has been confirmed. */
export const cityActivity: Partial<Record<string, ActivityLevel>> = {
  // berlin: 'aktiv',
  // tirana: 'shumë aktiv',
};

export const activityLabels: Record<ActivityLevel, string> = {
  'shumë aktiv': 'Shumë aktiv',
  aktiv: 'Aktiv',
  'në rritje': 'Në rritje',
  'në formim': 'Në formim',
  joaktiv: 'Joaktiv',
};

export const eventsForCity = (slug: string) => events.filter((event) => event.citySlug === slug);
