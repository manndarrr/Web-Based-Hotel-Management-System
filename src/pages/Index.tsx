import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Shield, Clock } from 'lucide-react';
import { destinations } from '@/data/destinations';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnimatedSection from '@/components/AnimatedSection';
import { useParallax } from '@/hooks/useScrollAnimation';

const slides = ['/images/slide1.jpeg', '/images/slide2.jpeg', '/images/slide3.jpg', '/images/slide4.jpeg', '/images/slide5.jpeg'];

const features = [
  { icon: Star, title: 'Premium Luxury', desc: 'Handcrafted experiences at every touchpoint' },
  { icon: Shield, title: 'Trusted Service', desc: 'Award-winning hospitality since 1985' },
  { icon: Clock, title: '24/7 Concierge', desc: 'Dedicated service around the clock' },
];

export default function Index() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [heroLoaded, setHeroLoaded] = useState(false);
  const parallax = useParallax();

  useEffect(() => {
    const timer = setInterval(() => setCurrentSlide(prev => (prev + 1) % slides.length), 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setHeroLoaded(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative h-screen flex items-center justify-center text-center overflow-hidden">
        {slides.map((src, i) => (
          <div
            key={i}
            className="absolute inset-0 transition-all duration-[2000ms] ease-in-out"
            style={{
              opacity: i === currentSlide ? 1 : 0,
              transform: `scale(${i === currentSlide ? 1.05 : 1})`,
            }}
          >
            <img
              src={src}
              alt=""
              className="w-full h-full object-cover"
              style={{ transform: `translateY(${parallax * 0.3}px)` }}
            />
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/40 via-foreground/20 to-foreground/70 z-10" />

        <div className="relative z-20 px-6 max-w-4xl">
          <div className={`transition-all duration-1000 ease-out ${heroLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <p className="text-hotel-gold font-medium tracking-[0.3em] uppercase text-sm mb-6">
              Welcome to Radison Hotels
            </p>
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-[1.1]">
              Make Your Stay<br />
              <span className="text-gradient">Unforgettable</span>
            </h1>
            <p className="text-white/70 text-lg md:text-xl font-light max-w-xl mx-auto mb-10">
              Experience luxury without limits in India's most breathtaking destinations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/destinations"
                className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-full font-semibold hover:bg-primary/90 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                Explore Destinations <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/hotels"
                className="inline-flex items-center gap-2 px-8 py-4 border-2 border-white/30 text-white rounded-full font-semibold hover:bg-white/10 transition-all duration-300 hover:-translate-y-0.5"
              >
                Discover Hotels <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Slide indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2.5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === currentSlide ? 'w-10 bg-hotel-gold' : 'w-3 bg-white/40 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Features strip */}
      <section className="relative -mt-16 z-30 max-w-5xl mx-auto px-6 w-full">
        <AnimatedSection>
          <div className="glass rounded-2xl shadow-2xl border border-border/50 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border/30">
            {features.map((f, i) => (
              <div key={i} className="flex items-center gap-4 p-8">
                <div className="shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-foreground">{f.title}</h3>
                  <p className="text-xs text-muted-foreground">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </AnimatedSection>
      </section>

      {/* Locations */}
      <section className="max-w-7xl mx-auto px-6 py-24 w-full">
        <AnimatedSection>
          <div className="text-center mb-16">
            <p className="text-hotel-gold font-medium tracking-[0.2em] uppercase text-xs mb-3">Our Destinations</p>
            <h2 className="font-display text-4xl md:text-5xl text-foreground mb-4">Explore Our Locations</h2>
            <p className="text-muted-foreground max-w-md mx-auto">Each destination offers a unique blend of culture, cuisine, and unparalleled comfort.</p>
          </div>
        </AnimatedSection>

        {destinations.map((loc, locIdx) => (
          <AnimatedSection key={loc.slug} delay={locIdx * 150} className="mb-20 last:mb-0">
            <div className="flex items-end justify-between mb-8">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{loc.emoji}</span>
                  <h3 className="font-display text-3xl text-foreground">{loc.name}</h3>
                </div>
                <p className="text-muted-foreground text-sm pl-11">{loc.tagline}</p>
              </div>
              <Link
                to={`/location/${loc.slug}`}
                className="hidden md:flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors group"
              >
                View Rooms <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {loc.images.map((img, i) => (
                <AnimatedSection key={i} delay={i * 100} direction={i === 0 ? 'left' : i === 2 ? 'right' : 'up'}>
                  <Link to={`/location/${loc.slug}`} className="overflow-hidden rounded-2xl shadow-lg group cursor-pointer card-hover relative aspect-[4/3] block">
                    <img
                      src={img}
                      alt={`${loc.name} ${i + 1}`}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </Link>
                </AnimatedSection>
              ))}
            </div>

            <Link
              to={`/location/${loc.slug}`}
              className="md:hidden flex items-center justify-center gap-2 mt-6 text-sm font-medium text-primary"
            >
              View Rooms <ArrowRight className="h-4 w-4" />
            </Link>
          </AnimatedSection>
        ))}
      </section>

      {/* CTA */}
      <AnimatedSection>
        <section className="relative py-24 overflow-hidden">
          <div className="absolute inset-0 hotel-gradient" />
          <div className="absolute inset-0 shimmer" />
          <div className="relative z-10 text-center px-6">
            <h2 className="font-display text-4xl md:text-5xl text-primary-foreground mb-4">Ready for an Experience?</h2>
            <p className="text-primary-foreground/70 mb-10 max-w-md mx-auto">
              Book your next getaway and discover a new standard of luxury.
            </p>
            <Link
              to="/destinations"
              className="inline-flex items-center gap-2 px-10 py-4 bg-white text-foreground rounded-full font-semibold hover:bg-white/90 transition-all duration-300 shadow-xl hover:-translate-y-0.5"
            >
              Start Booking <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </AnimatedSection>

      <Footer />
    </div>
  );
}
