import { Link } from 'react-router-dom';
import { ArrowRight, MapPin } from 'lucide-react';
import { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnimatedSection from '@/components/AnimatedSection';
import { destinations } from '@/data/destinations';

export default function Destinations() {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative h-[50vh] flex items-center justify-center overflow-hidden">
        <img src="/images/sri_1.jpeg" alt="Destinations" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/50 to-foreground/80" />
        <div className="relative z-10 text-center px-6">
          <p className="text-hotel-gold font-medium tracking-[0.3em] uppercase text-xs mb-4">Radison Hotels</p>
          <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-3">Explore Destinations</h1>
          <p className="text-white/60 text-lg max-w-xl mx-auto">
            Discover India's most captivating destinations and find your perfect getaway.
          </p>
        </div>
      </section>

      {/* Destinations Grid */}
      <section className="max-w-7xl mx-auto px-6 py-20 w-full">
        <AnimatedSection>
          <div className="text-center mb-14">
            <p className="text-hotel-gold font-medium tracking-[0.2em] uppercase text-xs mb-3">Our Destinations</p>
            <h2 className="font-display text-3xl md:text-4xl text-foreground mb-3">Where Would You Like to Go?</h2>
            <p className="text-muted-foreground max-w-md mx-auto">Each destination offers unique culture, cuisine, and unparalleled comfort.</p>
          </div>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {destinations.map((dest, i) => (
            <AnimatedSection key={dest.slug} delay={i * 100}>
              <Link to={`/location/${dest.slug}`} className="block group">
                <div className="bg-card rounded-2xl overflow-hidden shadow-lg border border-border/50 card-hover">
                  <div className="relative overflow-hidden aspect-[4/3]">
                    <img
                      src={dest.heroImage}
                      alt={dest.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-foreground/10 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">{dest.emoji}</span>
                        <h3 className="font-display text-xl text-white font-semibold">{dest.name}</h3>
                      </div>
                      <p className="text-white/70 text-sm">{dest.tagline}</p>
                    </div>
                    <div className="absolute top-4 right-4 glass-dark text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {dest.state}
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{dest.description}</p>
                    <div className="flex items-center gap-2 text-sm font-medium text-primary group-hover:text-primary/80 transition-colors">
                      View Rooms <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              </Link>
            </AnimatedSection>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
