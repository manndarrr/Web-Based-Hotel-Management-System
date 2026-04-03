import { useParams, useNavigate } from 'react-router-dom';
import { useHotel } from '@/context/HotelContext';
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnimatedSection from '@/components/AnimatedSection';
import { CalendarDays, User, Mail, ArrowLeft, Lock } from 'lucide-react';

export default function Book() {
  const { loc, roomType } = useParams<{ loc: string; roomType: string }>();
  const { rooms, bookRoom } = useHotel();
  const navigate = useNavigate();

  const decodedType = decodeURIComponent(roomType || '');
  const available = rooms.some(r => r.location === loc && r.type === decodedType && r.status === 'Available');
  const roomInfo = rooms.find(r => r.location === loc && r.type === decodedType);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [checkin, setCheckin] = useState('');
  const [checkout, setCheckout] = useState('');

  const today = new Date().toISOString().split('T')[0];

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const id = await bookRoom(loc || '', decodedType, name, email, checkin, checkout);
      if (id) navigate('/dashboard');
    } finally {
      setSubmitting(false);
    }
  };

  if (!available) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-6 pt-24">
          <AnimatedSection>
            <div className="glass rounded-2xl shadow-2xl p-14 text-center max-w-md border border-border/50">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Lock className="h-7 w-7 text-primary" />
              </div>
              <h2 className="font-display text-3xl text-foreground mb-3">Fully Booked</h2>
              <p className="text-muted-foreground mb-8">All <strong>{decodedType}</strong> rooms are currently occupied.</p>
              <button onClick={() => navigate('/')} className="bg-primary text-primary-foreground px-8 py-3.5 rounded-xl font-medium hover:bg-primary/90 transition-all duration-300">Return Home</button>
            </div>
          </AnimatedSection>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-6 py-28">
        <AnimatedSection className="w-full max-w-lg">
          <div className="glass rounded-2xl shadow-2xl p-8 md:p-10 border border-border/50">
            <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
              <ArrowLeft className="h-4 w-4" /> Back
            </button>

            {roomInfo && (
              <div className="rounded-xl overflow-hidden mb-6 aspect-video">
                <img src={roomInfo.image} alt={decodedType} className="w-full h-full object-cover" />
              </div>
            )}

            <p className="text-hotel-gold font-medium tracking-[0.2em] uppercase text-xs mb-2">Reservation</p>
            <h2 className="font-display text-2xl text-foreground mb-1">{decodedType}</h2>
            <p className="text-muted-foreground text-sm mb-8">
              {loc === 'Srinagar' ? 'Srinagar, Kashmir' : 'Candolim, Goa'} • ₹{roomInfo?.price.toLocaleString()}/night
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-sm font-medium mb-2 flex items-center gap-2 text-foreground">
                  <User className="h-4 w-4 text-muted-foreground" /> Full Name
                </label>
                <input
                  type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Enter your full name"
                  className="w-full border border-input rounded-xl px-4 py-3.5 bg-background text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-ring/50 focus:border-primary focus:outline-none transition-all duration-300"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 flex items-center gap-2 text-foreground">
                  <Mail className="h-4 w-4 text-muted-foreground" /> Email
                </label>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="your@email.com"
                  className="w-full border border-input rounded-xl px-4 py-3.5 bg-background text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-ring/50 focus:border-primary focus:outline-none transition-all duration-300"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 flex items-center gap-2 text-foreground">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" /> Check-in
                  </label>
                  <input
                    type="date" value={checkin} onChange={e => setCheckin(e.target.value)} min={today} required
                    className="w-full border border-input rounded-xl px-4 py-3.5 bg-background text-foreground focus:ring-2 focus:ring-ring/50 focus:border-primary focus:outline-none transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 flex items-center gap-2 text-foreground">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" /> Check-out
                  </label>
                  <input
                    type="date" value={checkout} onChange={e => setCheckout(e.target.value)} min={checkin || today} required
                    className="w-full border border-input rounded-xl px-4 py-3.5 bg-background text-foreground focus:ring-2 focus:ring-ring/50 focus:border-primary focus:outline-none transition-all duration-300"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-semibold hover:bg-primary/90 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 mt-2"
              >
                Confirm Booking
              </button>
            </form>
          </div>
        </AnimatedSection>
      </div>
      <Footer />
    </div>
  );
}
