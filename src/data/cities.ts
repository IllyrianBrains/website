export const defaultCityImage = '/assets/cities/default.svg';

export interface CommunityCity {
  city: string;
  country: string;
  lat: number;
  lng: number;
  slug: string;
  lumaUrl?: string;
  activities?: string[];
  image?: string;
}

export const cities: CommunityCity[] = [
  { city: 'Berlin', country: 'Gjermani', lat: 52.5200, lng: 13.4050, slug: 'berlin', image: '/assets/cities/Berlin.jpg' },
  { city: 'Düsseldorf', country: 'Gjermani', lat: 51.2277, lng: 6.7735, slug: 'dusseldorf', image: '/assets/cities/Dusseldorf.jpeg' },
  { city: 'Frankfurt', country: 'Gjermani', lat: 50.1109, lng: 8.6821, slug: 'frankfurt', image: '/assets/cities/Frankfurt.jpeg' },
  { city: 'Köln / Cologne', country: 'Gjermani', lat: 50.9375, lng: 6.9603, slug: 'koln', image: '/assets/cities/Koln.jpg' },
  { city: 'Lugano', country: 'Zvicër', lat: 46.0037, lng: 8.9511, slug: 'lugano' },
  { city: 'Munich', country: 'Gjermani', lat: 48.1351, lng: 11.5820, slug: 'munich', image: '/assets/cities/mynih.jpg' },
  { city: 'Nürnberg', country: 'Gjermani', lat: 49.4521, lng: 11.0767, slug: 'nurnberg' },
  { city: 'Vienna', country: 'Austri', lat: 48.2082, lng: 16.3738, slug: 'vienna', image: '/assets/cities/vjena.jpg' },
  { city: 'Zurich', country: 'Zvicër', lat: 47.3769, lng: 8.5417, slug: 'zurich', image: '/assets/cities/zurich.jpg' },
  { city: 'Copenhagen', country: 'Danimarkë', lat: 55.6761, lng: 12.5683, slug: 'copenhagen', image: '/assets/cities/Copenhagen.jpeg' },
  { city: 'Helsinki', country: 'Finlandë', lat: 60.1699, lng: 24.9384, slug: 'helsinki', image: '/assets/cities/Helsinki HH -Shkurt 2025.jpg' },
  { city: 'Krakow', country: 'Poloni', lat: 50.0647, lng: 19.9450, slug: 'krakow', image: '/assets/cities/Krakow.jpg' },
  { city: 'Stockholm', country: 'Suedi', lat: 59.3293, lng: 18.0686, slug: 'stockholm' },
  { city: 'Malmo', country: 'Suedi', lat: 55.6050, lng: 13.0038, slug: 'malmo', image: '/assets/cities/malmo.jpg' },
  { city: 'Oslo', country: 'Norvegji', lat: 59.9139, lng: 10.7522, slug: 'oslo', image: '/assets/cities/Oslo.png' },
  { city: 'Prague', country: 'Çeki', lat: 50.0755, lng: 14.4378, slug: 'prague', image: '/assets/cities/Prague.jpg' },
  { city: 'Amsterdam', country: 'Holandë', lat: 52.3676, lng: 4.9041, slug: 'amsterdam', image: '/assets/cities/Amsterdam.jpg' },
  { city: 'Brussels', country: 'Belgjikë', lat: 50.8503, lng: 4.3517, slug: 'brussels', image: '/assets/cities/Bruksel.jpg' },
  { city: 'Dublin', country: 'Irlandë', lat: 53.3498, lng: -6.2603, slug: 'dublin', image: '/assets/cities/dublin.jpeg' },
  { city: 'London', country: 'Mbretëria e Bashkuar', lat: 51.5072, lng: -0.1276, slug: 'london', image: '/assets/cities/London Maj25.jpeg' },
  { city: 'Luxembourg', country: 'Luksemburg', lat: 49.6116, lng: 6.1319, slug: 'luxembourg', image: '/assets/cities/Luxembourg.jpg' },
  { city: 'Madrid', country: 'Spanjë', lat: 40.4168, lng: -3.7038, slug: 'madrid', image: '/assets/cities/Madrid.jpeg' },
  { city: 'Manchester', country: 'Mbretëria e Bashkuar', lat: 53.4808, lng: -2.2426, slug: 'manchester', image: '/assets/cities/Manchester.jpg' },
  { city: 'Paris', country: 'Francë', lat: 48.8566, lng: 2.3522, slug: 'paris', image: '/assets/cities/Paris.jpg' },
  { city: 'South England (Cheltenham)', country: 'Mbretëria e Bashkuar', lat: 51.8994, lng: -2.0783, slug: 'south-england', image: '/assets/cities/southeast UK.jpg' },
  { city: 'Firenze', country: 'Itali', lat: 43.7696, lng: 11.2558, slug: 'firenze', image: '/assets/cities/Firenze.jpg' },
  { city: 'Genova', country: 'Itali', lat: 44.4056, lng: 8.9463, slug: 'genova', image: '/assets/cities/Genova.jpg' },
  { city: 'Malta', country: 'Maltë', lat: 35.8989, lng: 14.5146, slug: 'malta', image: '/assets/cities/Malta.jpg' },
  { city: 'Milano', country: 'Itali', lat: 45.4642, lng: 9.1900, slug: 'milano', image: '/assets/cities/Milano.jpg' },
  { city: 'Parma', country: 'Itali', lat: 44.8015, lng: 10.3279, slug: 'parma', image: '/assets/cities/Parma.jpeg' },
  { city: 'Roma', country: 'Itali', lat: 41.9028, lng: 12.4964, slug: 'roma', image: '/assets/cities/Rome.jpg' },
  { city: 'Tirana', country: 'Shqipëri', lat: 41.3275, lng: 19.8187, slug: 'tirana', image: '/assets/cities/Tirana.jpg' },
  { city: 'Trento', country: 'Itali', lat: 46.0748, lng: 11.1217, slug: 'trento', image: '/assets/cities/Trento.jpeg' },
  { city: 'Boston', country: 'SHBA', lat: 42.3601, lng: -71.0589, slug: 'boston', image: '/assets/cities/Boston.jpg' },
  { city: 'Chicago', country: 'SHBA', lat: 41.8781, lng: -87.6298, slug: 'chicago' },
  { city: 'Miami', country: 'SHBA', lat: 25.7617, lng: -80.1918, slug: 'miami' },
  { city: 'Minnesota', country: 'SHBA', lat: 46.7296, lng: -94.6859, slug: 'minnesota' },
  { city: 'New York', country: 'SHBA', lat: 40.7128, lng: -74.0060, slug: 'new-york', image: '/assets/cities/NY.jpg' },
  { city: 'Philadelphia', country: 'SHBA', lat: 39.9526, lng: -75.1652, slug: 'philadelphia', image: '/assets/cities/Philadelphia.jpeg' },
  { city: 'San Jose', country: 'SHBA', lat: 37.3382, lng: -121.8863, slug: 'san-jose' },
  { city: 'Tampa', country: 'SHBA', lat: 27.9506, lng: -82.4572, slug: 'tampa', image: '/assets/cities/Tampa bAY.jpeg' },
  { city: 'Washington', country: 'SHBA', lat: 38.9072, lng: -77.0369, slug: 'washington' },
  { city: 'Barcelona', country: 'Spanjë', lat: 41.3874, lng: 2.1686, slug: 'barcelona' },
  { city: 'Bologna', country: 'Itali', lat: 44.4949, lng: 11.3426, slug: 'bologna' },
  { city: 'Dubai', country: 'Emiratet e Bashkuara Arabe', lat: 25.2048, lng: 55.2708, slug: 'dubai' },
  { city: 'Fort Lauderdale', country: 'SHBA', lat: 26.1224, lng: -80.1373, slug: 'fort-lauderdale' },
  { city: 'Freiburg', country: 'Gjermani', lat: 47.9990, lng: 7.8421, slug: 'freiburg' },
  { city: 'Hamburg', country: 'Gjermani', lat: 53.5511, lng: 9.9937, slug: 'hamburg' },
  { city: 'New Jersey', country: 'SHBA', lat: 40.0583, lng: -74.4057, slug: 'new-jersey' },
  { city: 'Shkup', country: 'Maqedonia e Veriut', lat: 41.9973, lng: 21.4280, slug: 'shkup' },
  { city: 'Toronto', country: 'Kanada', lat: 43.6532, lng: -79.3832, slug: 'toronto' },
  { city: 'Stuttgart', country: 'Gjermani', lat: 48.7758, lng: 9.1829, slug: 'stuttgart' },
];
