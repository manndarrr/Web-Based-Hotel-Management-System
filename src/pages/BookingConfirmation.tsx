import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnimatedSection from '@/components/AnimatedSection';
import { CheckCircle, CalendarDays, MapPin, BedDouble, Users } from 'lucide-react';

interface BookingDetails {
  bookingId: number;
  location: string;
  roomType: string;
  checkin: string;
  checkout: string;
  nights: number;
  totalAdults: number;
  totalChildren: number;
  totalRooms: number;
}

export default function BookingConfirmation() {
  const loc = useLocation();
  const navigate = useNavigate();
  const details = loc.state as BookingDetails | null;

  if (!details) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar variant="light" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">No booking details found.</p>
            <button onClick={() => navigate('/book-now')} className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors">
              Book Now
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar variant="light" />
      <div className="flex-1 flex items-center justify-center px-6 py-28">
        <AnimatedSection className="w-full max-w-lg">
          <div className="glass rounded-2xl shadow-2xl p-8 md:p-10 border border-border/50 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-green-500" />
              </div>
            </div>

            <h1 className="font-display text-2xl md:text-3xl text-foreground mb-2">Booking Request Sent!</h1>
            <p className="text-muted-foreground mb-8">
              Your booking request has been submitted successfully. Our team will review and confirm your reservation shortly.
            </p>

            <div className="bg-accent/30 rounded-xl p-6 text-left space-y-4 mb-8">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Booking Details</p>

              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground font-medium">Booking ID:</span>
                <span className="text-sm font-bold text-foreground">#{details.bookingId}</span>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm text-foreground">{details.location}</span>
              </div>

              <div className="flex items-center gap-3">
                <BedDouble className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm text-foreground">{details.roomType}</span>
              </div>

              <div className="flex items-center gap-3">
                <CalendarDays className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm text-foreground">{details.checkin} → {details.checkout} ({details.nights} night{details.nights !== 1 ? 's' : ''})</span>
              </div>

              <div className="flex items-center gap-3">
                <Users className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm text-foreground">
                  {details.totalAdults} Adult{details.totalAdults !== 1 ? 's' : ''}, {details.totalChildren} Child{details.totalChildren !== 1 ? 'ren' : ''} — {details.totalRooms} Room{details.totalRooms !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-8">
              <p className="text-sm text-yellow-600 dark:text-yellow-400">
                <strong>Status: Pending</strong> — You can track your booking status in your profile under "Booking Status".
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate('/profile', { state: { scrollTo: 'booking-status' } })}
                className="flex-1 bg-primary text-primary-foreground py-3 rounded-xl font-semibold hover:bg-primary/90 transition-all uppercase tracking-wider text-sm"
              >
                View My Bookings
              </button>
              <button
                onClick={() => navigate('/')}
                className="flex-1 border border-border py-3 rounded-xl font-semibold hover:bg-accent transition-all uppercase tracking-wider text-sm text-foreground"
              >
                Back to Home
              </button>
            </div>
          </div>
        </AnimatedSection>
      </div>
      <Footer />
    </div>
  );
}
