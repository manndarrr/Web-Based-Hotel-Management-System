export interface Destination {
  slug: string;
  name: string;
  state: string;
  emoji: string;
  tagline: string;
  heroImage: string;
  images: string[];
  description: string;
}

export interface Hotel {
  slug: string;
  name: string;
  location: string;
  state: string;
  emoji: string;
  stars: number;
  heroImage: string;
  image: string;
  description: string;
  destinationSlug: string;
}

export const destinations: Destination[] = [
  {
    slug: 'Srinagar',
    name: 'Srinagar, Kashmir',
    state: 'Jammu & Kashmir',
    emoji: '🏔️',
    tagline: 'Nestled in the heart of the Valley',
    heroImage: 'https://images.unsplash.com/photo-1597074866923-dc0589150bf6?w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1597074866923-dc0589150bf6?w=800&q=80',
      'https://images.unsplash.com/photo-1595815771614-ade501084b58?w=800&q=80',
      'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&q=80',
    ],
    description: 'Experience the paradise on earth with stunning Dal Lake views, Mughal gardens, and snow-capped mountains.',
  },
  {
    slug: 'Goa',
    name: 'Candolim, Goa',
    state: 'Goa',
    emoji: '🏖️',
    tagline: 'Where the sun meets the sea',
    heroImage: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=80',
      'https://images.unsplash.com/photo-1587922546307-776227941871?w=800&q=80',
      'https://images.unsplash.com/photo-1614082242765-7c98ca0f3df3?w=800&q=80',
    ],
    description: 'Sun-kissed beaches, vibrant nightlife, and Portuguese heritage await you in this coastal paradise.',
  },
  {
    slug: 'Jaipur',
    name: 'Jaipur, Rajasthan',
    state: 'Rajasthan',
    emoji: '🏰',
    tagline: 'The Pink City of royal grandeur',
    heroImage: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800&q=80',
      'https://images.unsplash.com/photo-1603204077779-bed963ea7d0e?w=800&q=80',
      'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&q=80',
    ],
    description: 'Step into a world of majestic forts, vibrant bazaars, and the timeless elegance of Rajasthani royalty.',
  },
  {
    slug: 'Udaipur',
    name: 'Udaipur, Rajasthan',
    state: 'Rajasthan',
    emoji: '🏯',
    tagline: 'The City of Lakes and romance',
    heroImage: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&q=80',
      'https://images.unsplash.com/photo-1585116938581-7214f75e4520?w=800&q=80',
      'https://images.unsplash.com/photo-1567157577867-05ccb1388e13?w=800&q=80',
    ],
    description: 'Floating palaces, serene lakes, and sunset vistas make Udaipur the most romantic city in India.',
  },
  {
    slug: 'Kerala',
    name: 'Alleppey, Kerala',
    state: 'Kerala',
    emoji: '🌴',
    tagline: "God's Own Country",
    heroImage: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=800&q=80',
      'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&q=80',
      'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=800&q=80',
    ],
    description: 'Cruise through tranquil backwaters, spice plantations, and lush tropical landscapes.',
  },
  {
    slug: 'Agra',
    name: 'Agra, Uttar Pradesh',
    state: 'Uttar Pradesh',
    emoji: '🕌',
    tagline: 'Home of the Taj Mahal',
    heroImage: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&q=80',
      'https://images.unsplash.com/photo-1585135497273-1a86b09fe70e?w=800&q=80',
      'https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=80',
    ],
    description: 'Witness the eternal symbol of love and explore Mughal architecture at its finest.',
  },
];

export const hotels: Hotel[] = [
  {
    slug: 'radison-srinagar',
    name: 'Radison Dal Lake Resort',
    location: 'Srinagar',
    state: 'Jammu & Kashmir',
    emoji: '🏔️',
    stars: 5,
    heroImage: 'https://images.unsplash.com/photo-1597074866923-dc0589150bf6?w=1200&q=80',
    image: 'https://images.unsplash.com/photo-1597074866923-dc0589150bf6?w=800&q=80',
    description: 'Luxury lakeside resort with panoramic views of Dal Lake and the Zabarwan Mountains.',
    destinationSlug: 'Srinagar',
  },
  {
    slug: 'radison-goa',
    name: 'Radison Candolim Beach Resort',
    location: 'Goa',
    state: 'Goa',
    emoji: '🏖️',
    stars: 5,
    heroImage: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1200&q=80',
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=80',
    description: 'Beachfront luxury with world-class amenities, infinity pool, and Goan charm.',
    destinationSlug: 'Goa',
  },
  {
    slug: 'radison-jaipur',
    name: 'Radison Palace Jaipur',
    location: 'Jaipur',
    state: 'Rajasthan',
    emoji: '🏰',
    stars: 5,
    heroImage: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=1200&q=80',
    image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800&q=80',
    description: 'A regal heritage property blending Rajputana grandeur with modern luxury.',
    destinationSlug: 'Jaipur',
  },
  {
    slug: 'radison-udaipur',
    name: 'Radison Lake Palace Udaipur',
    location: 'Udaipur',
    state: 'Rajasthan',
    emoji: '🏯',
    stars: 5,
    heroImage: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1200&q=80',
    image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&q=80',
    description: 'Floating elegance on Lake Pichola with breathtaking sunset views.',
    destinationSlug: 'Udaipur',
  },
  {
    slug: 'radison-kerala',
    name: 'Radison Backwater Resort Kerala',
    location: 'Kerala',
    state: 'Kerala',
    emoji: '🌴',
    stars: 5,
    heroImage: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=1200&q=80',
    image: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=800&q=80',
    description: 'Tranquil backwater resort with Ayurvedic spa and houseboat experiences.',
    destinationSlug: 'Kerala',
  },
  {
    slug: 'radison-agra',
    name: 'Radison Taj View Agra',
    location: 'Agra',
    state: 'Uttar Pradesh',
    emoji: '🕌',
    stars: 5,
    heroImage: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1200&q=80',
    image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&q=80',
    description: 'Luxury hotel with uninterrupted views of the Taj Mahal from every room.',
    destinationSlug: 'Agra',
  },
  {
    slug: 'radison-mumbai',
    name: 'Radison Grand Mumbai',
    location: 'Mumbai',
    state: 'Maharashtra',
    emoji: '🌆',
    stars: 5,
    heroImage: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=1200&q=80',
    image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800&q=80',
    description: 'Iconic city hotel overlooking the Arabian Sea and Marine Drive.',
    destinationSlug: '',
  },
  {
    slug: 'radison-delhi',
    name: 'Radison Imperial New Delhi',
    location: 'Delhi',
    state: 'Delhi',
    emoji: '🏛️',
    stars: 5,
    heroImage: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=1200&q=80',
    image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&q=80',
    description: 'Grand heritage hotel in the heart of Lutyens Delhi with lush gardens.',
    destinationSlug: '',
  },
  {
    slug: 'radison-bangalore',
    name: 'Radison Garden City Bangalore',
    location: 'Bangalore',
    state: 'Karnataka',
    emoji: '🌳',
    stars: 4,
    heroImage: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=1200&q=80',
    image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=800&q=80',
    description: 'Modern business hotel in the Silicon Valley of India with rooftop pool.',
    destinationSlug: '',
  },
];

export function getDestinationBySlug(slug: string): Destination | undefined {
  return destinations.find(d => d.slug === slug);
}

export function getHotelBySlug(slug: string): Hotel | undefined {
  return hotels.find(h => h.slug === slug);
}

export function getHotelsByDestination(destSlug: string): Hotel[] {
  return hotels.filter(h => h.destinationSlug === destSlug);
}
