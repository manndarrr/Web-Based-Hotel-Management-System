import { Link } from 'react-router-dom';
import { Hotel, MapPin, Phone, Mail } from 'lucide-react';
import AnimatedSection from './AnimatedSection';

const locations = [
  'Srinagar, Kashmir',
  'Candolim, Goa',
  'Jaipur, Rajasthan',
  'Udaipur, Rajasthan',
  'Alleppey, Kerala',
  'Agra, Uttar Pradesh',
];

export default function Footer() {
  return (
    <footer className="relative mt-0 overflow-hidden">
      <div className="hotel-gradient text-primary-foreground pt-20 pb-10">
        <div className="max-w-6xl mx-auto px-6">
          <AnimatedSection>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
              {/* Brand */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Hotel className="h-6 w-6" />
                  <span className="font-display text-2xl">Radison Hotels</span>
                </div>
                <p className="text-primary-foreground/60 text-sm leading-relaxed">
                  Redefining luxury hospitality across India's most beautiful destinations.
                </p>
              </div>

              {/* Locations */}
              <div>
                <h4 className="font-display text-lg mb-4 text-primary-foreground/90">Our Locations</h4>
                <div className="grid grid-cols-1 gap-2 text-sm text-primary-foreground/60">
                  {locations.map((loc) => (
                    <div key={loc} className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 shrink-0" /> {loc}
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact */}
              <div>
                <h4 className="font-display text-lg mb-4 text-primary-foreground/90">Contact</h4>
                <div className="space-y-3 text-sm text-primary-foreground/60">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" /> +91 1800-RADISON
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" /> reservations@radison.in
                  </div>
                </div>
              </div>
            </div>
          </AnimatedSection>

          <div className="border-t border-primary-foreground/10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-primary-foreground/40 text-sm">© 2026 Radison Hotels. All rights reserved.</p>
            <Link to="/staff/login" className="text-primary-foreground/30 text-xs hover:text-primary-foreground/60 transition-colors">
              Employee Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
