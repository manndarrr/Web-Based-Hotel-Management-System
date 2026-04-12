import { Link } from 'react-router-dom';
import { useHotel } from '@/context/HotelContext';
import { useState, useEffect } from 'react';
import { UtensilsCrossed, User, Menu, X } from 'lucide-react';
import logoImg from '@/assets/logo.png';
import { supabase } from '@/integrations/supabase/client';

interface NavbarProps {
  variant?: 'dark' | 'light';
}

export default function Navbar({ variant = 'dark' }: NavbarProps) {
  const { activeBookingId } = useHotel();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // When scrolled, always use glass bg with dark text. When not scrolled, adapt to variant.
  const isLight = variant === 'light' && !scrolled;
  const textClass = scrolled ? 'text-muted-foreground' : isLight ? 'text-foreground/70' : 'text-white/70';
  const headingClass = scrolled ? 'text-foreground' : isLight ? 'text-foreground' : 'text-white';
  const logoFilter = scrolled || isLight ? 'brightness-0' : 'brightness-0 invert';
  const iconClass = scrolled ? 'text-foreground' : isLight ? 'text-foreground' : 'text-white';

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled
        ? 'glass border-b border-border/50 shadow-lg shadow-foreground/5'
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 md:px-12 py-4">
        <Link to="/" className="flex items-center gap-3.5 group">
          <div className="relative">
            <img src={logoImg} alt="Radison Hotels" className={`h-14 w-14 transition-all duration-300 ${logoFilter}`} />
            <div className="absolute inset-0 bg-hotel-gold/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </div>
          <div className={`font-display font-bold tracking-wide transition-colors duration-300 leading-none ${headingClass}`}>
            <span className="text-[1.55rem] tracking-[0.06em] block">RADISON</span>
            <span className="text-[1.05rem] tracking-[0.02em] block -mt-0.5">HOTELS</span>
          </div>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link to="/book-now" className={`transition-colors duration-300 hover:text-hotel-gold ${textClass}`}>
            Book Now
          </Link>

          {activeBookingId && (
            <Link to="/dashboard" className="flex items-center gap-2 px-4 py-2 rounded-full bg-hotel-gold/20 text-hotel-gold hover:bg-hotel-gold/30 transition-all duration-300">
              <UtensilsCrossed className="h-4 w-4" /> Active Stay
            </Link>
          )}
          <Link to={isLoggedIn ? '/profile' : '/signup'} className={`flex items-center gap-1.5 transition-colors duration-300 hover:text-hotel-gold ${textClass}`}>
            <User className="h-4 w-4" /> {isLoggedIn ? 'Profile' : 'Sign Up'}
          </Link>
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen
            ? <X className={`h-6 w-6 ${iconClass}`} />
            : <Menu className={`h-6 w-6 ${iconClass}`} />
          }
        </button>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden glass border-t border-border/30 transition-all duration-400 overflow-hidden ${mobileOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-6 py-4 space-y-1">
          <Link to="/book-now" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-4 py-3 rounded-lg hover:bg-accent/50 text-muted-foreground">
            Book Now
          </Link>
          {activeBookingId && (
            <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-4 py-3 rounded-lg bg-hotel-gold/20 text-hotel-gold">
              <UtensilsCrossed className="h-4 w-4" /> Active Stay
            </Link>
          )}
          <Link to={isLoggedIn ? '/profile' : '/signup'} onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-4 py-3 rounded-lg hover:bg-accent/50 text-muted-foreground">
            <User className="h-4 w-4" /> {isLoggedIn ? 'Profile' : 'Sign Up'}
          </Link>
        </div>
      </div>
    </nav>
  );
}
