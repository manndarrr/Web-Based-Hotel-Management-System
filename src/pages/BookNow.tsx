import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHotel } from '@/context/HotelContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnimatedSection from '@/components/AnimatedSection';
import { CalendarDays, MapPin, BedDouble, Users, Minus, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const locations = [
  { value: 'Srinagar', label: 'Srinagar, Kashmir' },
  { value: 'Goa', label: 'Candolim, Goa' },
  { value: 'Jaipur', label: 'Jaipur, Rajasthan' },
  { value: 'Kerala', label: 'Alleppey, Kerala' },
  { value: 'Agra', label: 'Agra, Uttar Pradesh' },
];

const roomTypes = ['Deluxe City View', 'Executive Suite', 'Royal Suite'];

export default function BookNow() {
  const { rooms } = useHotel();
  const navigate = useNavigate();

  const [location, setLocation] = useState('');
  const [roomType, setRoomType] = useState('');
  const [checkin, setCheckin] = useState('');
  const [checkout, setCheckout] = useState('');
  const [roomGuests, setRoomGuests] = useState([{ adults: 1, children: 0 }]);
  const [guestOpen, setGuestOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Restore form state from sessionStorage (after signup redirect)
  useEffect(() => {
    const saved = sessionStorage.getItem('bookNowState');
    if (saved) {
      try {
        const state = JSON.parse(saved);
        if (state.location) setLocation(state.location);
        if (state.roomType) setRoomType(state.roomType);
        if (state.checkin) setCheckin(state.checkin);
        if (state.checkout) setCheckout(state.checkout);
        if (state.roomGuests) setRoomGuests(state.roomGuests);
        sessionStorage.removeItem('bookNowState');
      } catch {}
    }
  }, []);

  // Get price for selected combo
  const selectedRoom = rooms.find(r => r.location === location && r.type === roomType);
  const price = selectedRoom?.price;

  // Get available room types with prices for selected location
  const roomOptions = roomTypes.map(type => {
    const room = rooms.find(r => r.location === location && r.type === type);
    return { type, price: room?.price, available: rooms.some(r => r.location === location && r.type === type && r.status === 'Available') };
  });

  const [submitting, setSubmitting] = useState(false);

  const handleBookNow = async () => {
    if (!isLoggedIn) {
      // Save form state before redirecting to signup
      sessionStorage.setItem('bookNowState', JSON.stringify({
        location, roomType, checkin, checkout, roomGuests
      }));
      navigate('/signup?redirect=/book-now');
      return;
    }
    if (!canBook || submitting) return;

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profileData } = await supabase
        .from('profiles')
        .select('name, email')
        .eq('user_id', user?.id || '')
        .single();

      const name = profileData?.name || user?.user_metadata?.name || '';
      const email = profileData?.email || user?.email || '';

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
          location,
          room_type: roomType,
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
          location,
          roomType,
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

  const canBook = location && roomType && checkin && checkout;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar variant="light" />
      <div className="flex-1 flex items-center justify-center px-6 py-28">
        <AnimatedSection className="w-full max-w-xl">
          <div className="glass rounded-2xl shadow-2xl p-8 md:p-10 border border-border/50">
            <p className="text-hotel-gold font-medium tracking-[0.2em] uppercase text-xs mb-2">Reservations</p>
            <h1 className="font-display text-3xl text-foreground mb-8">Book Your Stay</h1>

            <div className="space-y-5">
              {/* Select Location */}
              <div>
                <label className="text-sm font-medium mb-2 flex items-center gap-2 text-foreground">
                  <MapPin className="h-4 w-4 text-muted-foreground" /> Select Location
                </label>
                <select
                  value={location}
                  onChange={e => { setLocation(e.target.value); setRoomType(''); }}
                  className="w-full border border-input rounded-xl px-4 py-3.5 bg-background text-foreground focus:ring-2 focus:ring-ring/50 focus:border-primary focus:outline-none transition-all duration-300 appearance-none cursor-pointer"
                >
                  <option value="">Choose a location</option>
                  {locations.map(loc => (
                    <option key={loc.value} value={loc.value}>{loc.label}</option>
                  ))}
                </select>
              </div>

              {/* Choose Room Type */}
              <div>
                <label className="text-sm font-medium mb-2 flex items-center gap-2 text-foreground">
                  <BedDouble className="h-4 w-4 text-muted-foreground" /> Choose Your Room
                </label>
                <select
                  value={roomType}
                  onChange={e => setRoomType(e.target.value)}
                  disabled={!location}
                  className="w-full border border-input rounded-xl px-4 py-3.5 bg-background text-foreground focus:ring-2 focus:ring-ring/50 focus:border-primary focus:outline-none transition-all duration-300 appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">Select a room type</option>
                  {roomOptions.map(opt => (
                    <option key={opt.type} value={opt.type} disabled={!opt.available}>
                      {opt.type} {opt.price ? `— ₹${opt.price.toLocaleString()}/night` : ''} {!opt.available ? '(Sold Out)' : ''}
                    </option>
                  ))}
                </select>
                {price && (
                  <p className="text-sm text-hotel-gold mt-1.5 font-medium">₹{price.toLocaleString()} per night</p>
                )}
              </div>

              {/* Check-in / Check-out */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 flex items-center gap-2 text-foreground">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" /> Check-in
                  </label>
                  <input
                    type="date" value={checkin} onChange={e => setCheckin(e.target.value)} min={today}
                    className="w-full border border-input rounded-xl px-4 py-3.5 bg-background text-foreground focus:ring-2 focus:ring-ring/50 focus:border-primary focus:outline-none transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 flex items-center gap-2 text-foreground">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" /> Check-out
                  </label>
                  <input
                    type="date" value={checkout} onChange={e => setCheckout(e.target.value)} min={checkin || today}
                    className="w-full border border-input rounded-xl px-4 py-3.5 bg-background text-foreground focus:ring-2 focus:ring-ring/50 focus:border-primary focus:outline-none transition-all duration-300"
                  />
                </div>
              </div>

              {/* Guests Section */}
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

              {/* Book Now Button */}
              <button
                onClick={handleBookNow}
                disabled={!canBook || submitting}
                className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-semibold hover:bg-primary/90 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 mt-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 uppercase tracking-wider text-sm"
              >
                {submitting ? 'Submitting...' : isLoggedIn ? 'REQUEST BOOKING' : 'Book Now'}
              </button>
            </div>
          </div>
        </AnimatedSection>
      </div>
      <Footer />
    </div>
  );
}
