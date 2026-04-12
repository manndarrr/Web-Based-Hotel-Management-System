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
    heroImage: '/images/srinagar_1.jpeg',
    images: [
      '/images/srinagar_1.jpeg',
      '/images/srinagar_2.jpeg',
      '/images/srinagar_3.jpg',
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
    heroImage: '/images/jaipur_1.jpeg',
    images: [
      '/images/jaipur_1.jpeg',
      '/images/jaipur_2.jpeg',
      '/images/jaipur_3.jpeg',
    ],
    description: 'Step into a world of majestic forts, vibrant bazaars, and the timeless elegance of Rajasthani royalty.',
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
    heroImage: '/images/agra_1.jpeg',
    images: [
      '/images/agra_1.jpeg',
      '/images/agra_2.jpeg',
      '/images/agra_3.jpeg',
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
    heroImage: '/images/srinagar_1.jpeg',
    image: '/images/srinagar_2.jpeg',
    description: 'Luxury lakeside resort with panoramic views of Dal Lake and the Zabarwan Mountains.',
    destinationSlug: 'Srinagar',
  },
  {
    slug: 'radison-goa',
    name: 'Radison Candolim Beach Resort',
    location: 'Candolim, Goa',
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
    heroImage: '/images/jaipur_1.jpeg',
    image: '/images/jaipur_hotel.jpeg',
    description: 'A regal heritage property blending Rajputana grandeur with modern luxury.',
    destinationSlug: 'Jaipur',
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
    heroImage: '/images/agra_1.jpeg',
    image: '/images/agra_hotel.jpeg',
    description: 'Luxury hotel with uninterrupted views of the Taj Mahal from every room.',
    destinationSlug: 'Agra',
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
