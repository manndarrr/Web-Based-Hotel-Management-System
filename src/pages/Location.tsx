import { useParams, Link } from 'react-router-dom';
import { useHotel } from '@/context/HotelContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnimatedSection from '@/components/AnimatedSection';
import { ArrowRight, Users, Wifi, Coffee, Star } from 'lucide-react';
import { getDestinationBySlug } from '@/data/destinations';

const amenities = [
  { icon: Wifi, label: 'Free Wi-Fi' },
  { icon: Coffee, label: 'Breakfast' },
  { icon: Users, label: 'Concierge' },
  { icon: Star, label: '5-Star' },
];

export default function Location() {
  const { loc } = useParams<{ loc: string }>();
  const { getRoomCategories } = useHotel();
  const categories = getRoomCategories(loc || '');
  const destination = getDestinationBySlug(loc || '');

  const heroImage = destination?.heroImage || '/images/sri_1.jpeg';
  const displayName = destination?.name || loc || 'Location';

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Hero banner */}
      <section className="relative h-[50vh] flex items-center justify-center overflow-hidden">
        <img
          src={heroImage}
          alt={displayName}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/50 to-foreground/70" />
        <div className="relative z-10 text-center px-6">
          <p className="text-hotel-gold font-medium tracking-[0.3em] uppercase text-xs mb-4">Radison Hotels</p>
          <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-3">
            {displayName}
          </h1>
          <p className="text-white/60 text-lg">Select your ideal room to begin</p>
        </div>
      </section>

      {/* Amenities */}
      <section className="relative -mt-10 z-30 max-w-3xl mx-auto px-6 w-full">
        <AnimatedSection>
          <div className="glass rounded-2xl shadow-xl border border-border/50 grid grid-cols-2 md:grid-cols-4 divide-x divide-border/30">
            {amenities.map((a, i) => (
              <div key={i} className="flex flex-col items-center gap-2 py-6">
                <a.icon className="h-5 w-5 text-primary" />
                <span className="text-xs font-medium text-muted-foreground">{a.label}</span>
              </div>
            ))}
          </div>
        </AnimatedSection>
      </section>

      {/* Rooms */}
      <div className="max-w-7xl mx-auto px-6 py-20 w-full">
        <AnimatedSection>
          <div className="text-center mb-14">
            <p className="text-hotel-gold font-medium tracking-[0.2em] uppercase text-xs mb-3">Accommodations</p>
            <h2 className="font-display text-3xl md:text-4xl text-foreground">Choose Your Room</h2>
          </div>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((room, i) => (
            <AnimatedSection key={room.type} delay={i * 150}>
              <div className="bg-card rounded-2xl overflow-hidden shadow-lg border border-border/50 card-hover group">
                <div className="relative overflow-hidden aspect-[4/3]">
                  <img
                    src={room.image}
                    alt={room.type}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute top-4 left-4 glass-dark text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                    From ₹{room.price.toLocaleString()}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
                <div className="p-7">
                  <h3 className="font-display text-xl mb-1 text-foreground">{room.type}</h3>
                  <p className="text-muted-foreground text-sm mb-6">per night • Taxes included</p>
                  <Link
                    to={`/book/${loc}/${encodeURIComponent(room.type)}`}
                    className="flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3.5 rounded-xl font-medium hover:bg-primary/90 transition-all duration-300 group/btn"
                  >
                    Book Now <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                  </Link>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}
