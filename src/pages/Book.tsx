import { useParams, useNavigate } from 'react-router-dom';
import { useHotel } from '@/context/HotelContext';
import React, { useState, useEffect, useRef } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnimatedSection from '@/components/AnimatedSection';
import { CalendarDays, ArrowLeft, Lock, Users, Minus, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const locationLabels: Record<string, string> = {
  'Jaipur': 'Jaipur, Rajasthan',
  'Kerala': 'Alleppey, Kerala',
  'Agra': 'Agra, Uttar Pradesh',
  'Srinagar': 'Srinagar, Kashmir',
  'Goa': 'Candolim, Goa',
};

export default function Book() {
  const { loc, roomType } = useParams<{ loc: string; roomType: string }>();
  const { rooms } = useHotel();
  const navigate = useNavigate();

  const decodedType = decodeURIComponent(roomType || '');
  const available = rooms.some(r => r.location === loc && r.type === decodedType && r.status === 'Available');
  const roomInfo = rooms.find(r => r.location === loc && r.type === decodedType);

  const restoredFromSession = useRef(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [checkin, setCheckin] = useState('');
  const [checkout, setCheckout] = useState('');
  const [roomGuests, setRoomGuests] = useState([{ adults: 1, children: 0 }]);
  const [guestOpen, setGuestOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const displayLocation = locationLabels[loc || ''] || loc || '';

  // Restore form state from sessionStorage (after signup redirect) — runs first
  useEffect(() => {
    const saved = sessionStorage.getItem('bookPageState');
    if (saved) {
      try {
        const state = JSON.parse(saved);
        if (state.checkin) setCheckin(state.checkin);
        if (state.checkout) setCheckout(state.checkout);
        if (state.roomGuests) setRoomGuests(state.roomGuests);
        restoredFromSession.current = true;
        sessionStorage.removeItem('bookPageState');
      } catch {}
    }
  }, []);

  // Auth state
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Auto-fill from auth session
  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('name, email')
          .eq('user_id', user.id)
          .single();
        if (profile) {
          if (profile.name) setName(profile.name);
          if (profile.email) setEmail(profile.email);
        } else {
          if (user.user_metadata?.name) setName(user.user_metadata.name);
          if (user.email) setEmail(user.email);
        }
      }
    };
    loadUser();
  }, [isLoggedIn]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoggedIn) {
      // Save form state before redirecting to signup
      sessionStorage.setItem('bookPageState', JSON.stringify({
        name, email, checkin, checkout, roomGuests
      }));
      navigate(`/signup?redirect=/book/${encodeURIComponent(loc || '')}/${encodeURIComponent(decodedType)}`);
      return;
    }

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const d1 = new Date(checkin);
      const d2 = new Date(checkout);
      const nights = Math.max(1, Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)));

      const totalAdults = roomGuests.reduce((s, r) => s + r.adults, 0);
      const totalChildren = roomGuests.reduce((s, r) => s + r.children, 0);

      const { data, error } = await supabase
        .from('bookings')
        .insert({
          name, email, nights,
          room_id: null,
          room_code: null,
          status: 'Pending',
          checkin, checkout,
          user_id: user?.id || null,
          location: loc || '',
          room_type: decodedType,
          total_adults: totalAdults,
          total_children: totalChildren,
          total_rooms: roomGuests.length,
        } as any)
        .select('id')
        .single();

      if (error) throw error;

      navigate('/booking-confirmation', {
        state: {
          bookingId: data.id,
          location: loc,
          roomType: decodedType,
          checkin,
          checkout,
          nights,
          totalAdults,
          totalChildren,
          totalRooms: roomGuests.length,
        }
      });
    } catch (err) {
      console.error('Booking error:', err);
      alert('Failed to submit booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!available) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar variant="light" />
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
      <Navbar variant="light" />
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
              {displayLocation} • ₹{roomInfo?.price.toLocaleString()}/night
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Check-in / Check-out */}
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

              {/* Guests & Rooms Section */}
              <div>
                <label className="text-sm font-medium mb-2 flex items-center gap-2 text-foreground">
                  <Users className="h-4 w-4 text-muted-foreground" /> Guests & Rooms
                </label>
                <button
                  type="button"
                  onClick={() => setGuestOpen(!guestOpen)}
                  className="w-full border border-input rounded-xl px-4 py-3.5 bg-background text-foreground flex items-center justify-between hover:border-primary/40 transition-all duration-300"
                >
                  <span>
                    {roomGuests.reduce((s, r) => s + r.adults, 0)} Adult{roomGuests.reduce((s, r) => s + r.adults, 0) !== 1 ? 's' : ''},{' '}
                    {roomGuests.reduce((s, r) => s + r.children, 0)} Child{roomGuests.reduce((s, r) => s + r.children, 0) !== 1 ? 'ren' : ''}{' '}
                    - {roomGuests.length} Room{roomGuests.length !== 1 ? 's' : ''}
                  </span>
                  {guestOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </button>

                {guestOpen && (
                  <div className="mt-3 border border-border/50 rounded-xl p-5 bg-card space-y-4">
                    {roomGuests.map((room, idx) => (
                      <div key={idx} className="space-y-3">
                        <p className="font-semibold text-foreground">Room {idx + 1}</p>
                        <div className="flex items-center justify-between">
                          {/* Adults */}
                          <div className="flex items-center gap-4">
                            <button
                              type="button"
                              onClick={() => setRoomGuests(prev => prev.map((r, i) => i === idx ? { ...r, adults: Math.max(1, r.adults - 1) } : r))}
                              className="w-9 h-9 rounded-lg border border-border flex items-center justify-center hover:bg-accent transition-colors"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="text-foreground font-medium min-w-[60px] text-center">{room.adults} Adult{room.adults !== 1 ? 's' : ''}</span>
                            <button
                              type="button"
                              onClick={() => setRoomGuests(prev => prev.map((r, i) => i === idx ? { ...r, adults: Math.min(4, r.adults + 1) } : r))}
                              className="w-9 h-9 rounded-lg border border-border flex items-center justify-center hover:bg-accent transition-colors"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>

                          <div className="h-8 w-px bg-border" />

                          {/* Children */}
                          <div className="flex items-center gap-4">
                            <button
                              type="button"
                              onClick={() => setRoomGuests(prev => prev.map((r, i) => i === idx ? { ...r, children: Math.max(0, r.children - 1) } : r))}
                              className="w-9 h-9 rounded-lg border border-border flex items-center justify-center hover:bg-accent transition-colors"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <div className="text-center min-w-[60px]">
                              <span className="text-foreground font-medium block">{room.children} Child{room.children !== 1 ? 'ren' : ''}</span>
                              <span className="text-muted-foreground text-[11px]">(0 - 12 yrs)</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setRoomGuests(prev => prev.map((r, i) => i === idx ? { ...r, children: Math.min(3, r.children + 1) } : r))}
                              className="w-9 h-9 rounded-lg border border-border flex items-center justify-center hover:bg-accent transition-colors"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        {idx < roomGuests.length - 1 && <div className="border-t border-border/50" />}
                      </div>
                    ))}

                    {/* Room Controls */}
                    <div className="flex items-center justify-between pt-2 border-t border-border/50">
                      <button
                        type="button"
                        onClick={() => setRoomGuests(prev => prev.slice(0, -1))}
                        disabled={roomGuests.length <= 1}
                        className="text-sm font-semibold tracking-widest uppercase text-destructive hover:text-destructive/80 transition-colors py-1 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Remove Room
                      </button>
                      <button
                        type="button"
                        onClick={() => setRoomGuests(prev => [...prev, { adults: 1, children: 0 }])}
                        className="text-sm font-semibold tracking-widest uppercase text-hotel-gold hover:text-hotel-gold/80 transition-colors py-1"
                      >
                        Add More Rooms
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-semibold hover:bg-primary/90 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 mt-2"
              >
                {submitting ? 'Submitting...' : 'Confirm Booking'}
              </button>
            </form>
          </div>
        </AnimatedSection>
      </div>
      <Footer />
    </div>
  );
}
