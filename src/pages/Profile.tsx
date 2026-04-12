import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { User, Mail, Phone, CalendarDays, UtensilsCrossed, CreditCard, Lock, LogOut, Eye, EyeOff, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ProfileData {
  name: string;
  email: string;
  phone: string;
}

interface BookingRow {
  id: number;
  name: string;
  email: string;
  nights: number;
  room_id: string | null;
  room_code: string | null;
  status: string;
  checkin: string | null;
  checkout: string | null;
  created_at: string;
  location: string | null;
  room_type: string | null;
  total_adults: number | null;
  total_children: number | null;
  total_rooms: number | null;
  payment_status: string;
  assignedRoomIds?: number[];
}

interface FoodOrderRow {
  id: number;
  booking_id: number | null;
  room_id: number | null;
  item_name: string;
  price: number;
  timestamp: string;
}

export default function Profile() {
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [foodOrders, setFoodOrders] = useState<FoodOrderRow[]>([]);
  const [costQueryCharges, setCostQueryCharges] = useState(0);
  const [myQueries, setMyQueries] = useState<{ id: number; booking_id: number; room_id: number | null; description: string; status: string; amount: number; created_at: string }[]>([]);
  const [activeSection, setActiveSection] = useState<string>('info');
  const [loading, setLoading] = useState(true);
  const [selectedQueryBooking, setSelectedQueryBooking] = useState<number | null>(null);

  // Scroll to booking status if navigated with state
  useEffect(() => {
    const state = location.state as { scrollTo?: string } | null;
    if (state?.scrollTo === 'booking-status') {
      setActiveSection('bookings');
      window.history.replaceState({}, document.title);
    } else if (state?.scrollTo === 'food-orders') {
      setActiveSection('food');
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');

  const [selectedQueryOption, setSelectedQueryOption] = useState<string | null>(null);
  const [selectedQueryRoom, setSelectedQueryRoom] = useState<number | null>(null);
  const [querySuccess, setQuerySuccess] = useState('');

  const queryOptions = [
    { label: 'Extra Bed', description: 'Add an extra bed to your room', cost: 500 },
    { label: 'Extra Pillow / Blanket', description: 'Request additional pillows or blankets', cost: 0 },
    { label: 'Room Cleaning', description: 'Request immediate room cleaning service', cost: 0 },
    { label: 'Late Check-out', description: 'Extend your check-out time by a few hours', cost: 300 },
    { label: 'Early Check-in', description: 'Request early check-in for your next stay', cost: 200 },
    { label: 'Extend Stay (1 Night)', description: 'Add one more night to your current stay', cost: 1500 },
    { label: 'Room Upgrade', description: 'Upgrade to a higher room category', cost: 2000 },
    { label: 'Laundry Service', description: 'Request laundry pickup and delivery', cost: 400 },
    { label: 'Airport Transfer', description: 'Book a cab for airport pickup/drop', cost: 800 },
    { label: 'Extra Towels', description: 'Request additional towels for your room', cost: 0 },
    { label: 'Mini Bar Refill', description: 'Refill the mini bar in your room', cost: 350 },
    { label: 'Maintenance Request', description: 'Report AC, plumbing or electrical issues', cost: 0 },
  ];

  // Auto-fill booking selector if only one active booking
  useEffect(() => {
    const activeBookings = bookings.filter(b => b.status === 'Active');
    if (activeBookings.length === 1 && !selectedQueryBooking) {
      setSelectedQueryBooking(activeBookings[0].id);
    }
  }, [bookings, selectedQueryBooking]);

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/signup');
        return;
      }

      // Load profile from profiles table
      const { data: profileData } = await supabase
        .from('profiles')
        .select('name, email, phone')
        .eq('user_id', user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
      } else {
        setProfile({ name: user.user_metadata?.name || '', email: user.email || '', phone: user.user_metadata?.phone || '' });
      }

      // Load bookings by user_id or email
      const { data: bData } = await supabase
        .from('bookings')
        .select('*')
        .or(`user_id.eq.${user.id},email.eq.${user.email}`)
        .order('id', { ascending: false });

      if (bData) {
        // Fetch assigned room IDs for all bookings
        const bookingIds = bData.map(b => b.id);
        let roomIdMap: Record<number, number[]> = {};
        if (bookingIds.length > 0) {
          const { data: brData } = await supabase
            .from('booked_rooms')
            .select('booking_id, room_id')
            .in('booking_id', bookingIds);
          if (brData) {
            brData.forEach(br => {
              if (!roomIdMap[br.booking_id]) roomIdMap[br.booking_id] = [];
              roomIdMap[br.booking_id].push(br.room_id);
            });
          }
        }

        const enrichedBookings = bData.map(b => ({
          ...b,
          assignedRoomIds: roomIdMap[b.id] || [],
        }));
        setBookings(enrichedBookings);

        if (bookingIds.length > 0) {
          const { data: fData } = await supabase
            .from('food_orders')
            .select('*')
            .in('booking_id', bookingIds)
            .order('id', { ascending: false });

          if (fData) setFoodOrders(fData);
        }

        // Load cost queries for user's bookings
        const { data: allCqData } = await supabase
          .from('cost_queries')
          .select('id, booking_id, room_id, description, status, amount, created_at')
          .in('booking_id', bookingIds)
          .order('id', { ascending: false });
        if (allCqData) {
          setMyQueries(allCqData);
          setCostQueryCharges(allCqData.filter(q => q.status === 'Accepted').reduce((s, q) => s + q.amount, 0));
        }
      }

      setLoading(false);
    };

    loadProfile();
  }, [navigate]);

  // Realtime subscription to auto-update when bookings payment_status changes
  useEffect(() => {
    if (bookings.length === 0) return;
    const channel = supabase
      .channel('profile-bookings-payment')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'bookings' },
        (payload: any) => {
          const updated = payload.new;
          if (updated && bookings.some(b => b.id === updated.id)) {
            setBookings(prev => prev.map(b => b.id === updated.id ? { ...b, ...updated } : b));
          }
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [bookings.length]);

  useEffect(() => {
    if (bookings.length === 0) return;
    const bookingIds = bookings.map(b => b.id);

    const channel = supabase
      .channel('profile-cost-queries')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'cost_queries' },
        (payload: any) => {
          const row = payload.new || payload.old;
          if (row && bookingIds.includes(row.booking_id)) {
            // Re-fetch cost queries
            supabase
              .from('cost_queries')
              .select('id, booking_id, room_id, description, status, amount, created_at')
              .in('booking_id', bookingIds)
              .order('id', { ascending: false })
              .then(({ data }) => {
                if (data) {
                  setMyQueries(data);
                  setCostQueryCharges(data.filter(q => q.status === 'Accepted').reduce((s, q) => s + q.amount, 0));
                }
              });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [bookings]);

  const totalRoomCharges = bookings.filter(b => b.status !== 'Rejected').reduce((sum, b) => {
    const prices: Record<string, number> = { 'STD': 3500, 'DLX': 6000, 'STE': 12000, 'PRE': 18000 };
    const prefix = b.room_code?.substring(0, 3) || '';
    const perNight = prices[prefix] || 5000;
    const numRooms = b.total_rooms || 1;
    return sum + perNight * b.nights * numRooms;
  }, 0);
  const totalFoodCharges = foodOrders.reduce((sum, o) => sum + o.price, 0);
  const totalBill = totalRoomCharges + totalFoodCharges + costQueryCharges;

  // Calculate paid amounts based on separate payment fields
  // Room charges: paid when payment_status = 'Completed' (set from bookings tab)
  const paidRoomBookings = bookings.filter(b => b.payment_status === 'Completed' && b.status !== 'Rejected');
  const paidRoomCharges = paidRoomBookings.reduce((sum, b) => {
    const prices: Record<string, number> = { 'STD': 3500, 'DLX': 6000, 'STE': 12000, 'PRE': 18000 };
    const prefix = b.room_code?.substring(0, 3) || '';
    const numRooms = b.total_rooms || 1;
    return sum + (prices[prefix] || 5000) * b.nights * numRooms;
  }, 0);
  
  // Food + Query charges: paid when services_payment_status = 'Completed' (set from customer data tab)
  const servicesPaidBookings = bookings.filter(b => (b as any).services_payment_status === 'Completed' && b.status !== 'Rejected');
  const servicesPaidBookingIds = servicesPaidBookings.map(b => b.id);
  const paidFoodCharges = foodOrders.filter(o => o.booking_id && servicesPaidBookingIds.includes(o.booking_id)).reduce((s, o) => s + o.price, 0);
  const paidQueryCharges = myQueries.filter(q => q.status === 'Accepted' && servicesPaidBookingIds.includes(q.booking_id)).reduce((s, q) => s + q.amount, 0);
  const totalPaid = paidRoomCharges + paidFoodCharges + paidQueryCharges;
  const outstandingAmount = totalBill - totalPaid;

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError('');
    setPwSuccess('');
    if (newPw !== confirmPw) { setPwError('Passwords do not match.'); return; }
    if (newPw.length < 6) { setPwError('Password must be at least 6 characters.'); return; }

    const { error } = await supabase.auth.updateUser({ password: newPw });
    if (error) {
      setPwError(error.message);
    } else {
      setPwSuccess('Password updated successfully!');
      setNewPw(''); setConfirmPw('');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
    window.location.reload();
  };

  const handleQuerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQueryBooking || !selectedQueryOption) return;
    const { data: { user } } = await supabase.auth.getUser();
    const booking = bookings.find(b => b.id === selectedQueryBooking);
    const option = queryOptions.find(o => o.label === selectedQueryOption);
    const description = option ? `${option.label}${option.cost > 0 ? ` (₹${option.cost})` : ''}` : selectedQueryOption;
    
    const { data: inserted } = await supabase.from('cost_queries').insert({
      booking_id: selectedQueryBooking,
      guest_name: profile?.name || booking?.name || '',
      description,
      amount: option?.cost || 0,
      user_id: user?.id || null,
      room_id: selectedQueryRoom || null,
    }).select('id, booking_id, description, status, amount, created_at, room_id').single();

    if (inserted) {
      setMyQueries(prev => [inserted, ...prev]);
    }
    setQuerySuccess('Your query has been submitted. Our team will review it shortly.');
    setSelectedQueryOption(null);
    setSelectedQueryRoom(null);
    setSelectedQueryBooking(null);
    setTimeout(() => setQuerySuccess(''), 4000);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <p className="text-muted-foreground">Loading profile...</p>
    </div>
  );

  if (!profile) return null;

  const statusColor = (s: string) => {
    switch (s) {
      case 'Active': return 'bg-green-500/20 text-green-400';
      case 'Booked': return 'bg-emerald-500/20 text-emerald-400';
      case 'Completed': return 'bg-blue-500/20 text-blue-400';
      case 'Rejected': return 'bg-red-500/20 text-red-400';
      case 'Pending': return 'bg-yellow-500/20 text-yellow-400';
      default: return 'bg-yellow-500/20 text-yellow-400';
    }
  };

  const sections = [
    { id: 'info', label: 'Personal Info', icon: User },
    { id: 'bookings', label: 'Booking Status', icon: CalendarDays },
    { id: 'stay', label: 'Update Stay', icon: MessageSquare },
    { id: 'food', label: 'Food Orders', icon: UtensilsCrossed },
    { id: 'payment', label: 'Payment Status', icon: CreditCard },
    { id: 'password', label: 'Update Password', icon: Lock },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar variant="light" />
      <div className="flex-1 pt-28 pb-16 px-4 md:px-8 max-w-6xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="font-display text-3xl md:text-4xl text-foreground">
            Welcome, <span className="text-primary">{profile.name}</span>
          </h1>
          <p className="text-muted-foreground mt-1">Manage your profile, bookings, and orders</p>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-64 shrink-0">
            <div className="bg-card rounded-xl border border-border p-4 space-y-1">
              {sections.map(s => (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    activeSection === s.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent/50'
                  }`}
                >
                  <s.icon className="h-4 w-4" /> {s.label}
                </button>
              ))}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors mt-4"
              >
                <LogOut className="h-4 w-4" /> Log Out
              </button>
            </div>
          </div>

          <div className="flex-1">
            {activeSection === 'info' && (
              <div className="bg-card rounded-xl border border-border p-6">
                <h2 className="font-display text-xl mb-6">Personal Information</h2>
                <div className="grid gap-4">
                  <div className="flex items-center gap-4 p-4 bg-accent/30 rounded-lg">
                    <User className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Full Name</p>
                      <p className="font-medium">{profile.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-accent/30 rounded-lg">
                    <Mail className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Email Address</p>
                      <p className="font-medium">{profile.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-accent/30 rounded-lg">
                    <Phone className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Phone Number</p>
                      <p className="font-medium">{profile.phone || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'bookings' && (
              <div className="bg-card rounded-xl border border-border p-6">
                <h2 className="font-display text-xl mb-6">Booking Status</h2>
                {bookings.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No bookings yet. <a href="/hotels" className="text-primary hover:underline">Book a room now!</a></p>
                ) : (
                  <div className="space-y-4">
                    {bookings.map(b => (
                      <div key={b.id} className="border border-border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold">Booking #{b.id}</p>
                            <p className="text-sm text-muted-foreground">{b.location || 'N/A'} — {b.room_type || b.room_code || 'N/A'}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor(b.status)}`}>
                            {b.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm mt-3">
                          <div><span className="text-muted-foreground">Nights:</span> {b.nights}</div>
                          <div><span className="text-muted-foreground">Check-in:</span> {b.checkin || 'N/A'}</div>
                          <div><span className="text-muted-foreground">Check-out:</span> {b.checkout || 'N/A'}</div>
                          <div><span className="text-muted-foreground">Guests:</span> {b.total_adults || 0}A, {b.total_children || 0}C — {b.total_rooms || 1} Room{(b.total_rooms || 1) > 1 ? 's' : ''}</div>
                        </div>
                        {b.assignedRoomIds && b.assignedRoomIds.length > 0 && (
                          <div className="text-sm mt-2">
                            <span className="text-muted-foreground">Assigned Room{b.assignedRoomIds.length > 1 ? 's' : ''}:</span>
                            <span className="ml-1 font-medium">
                              {b.assignedRoomIds.map(id => `#${id}`).join(', ')}
                            </span>
                          </div>
                        )}
                        {b.status === 'Booked' && (
                          <div className="mt-3 pt-3 border-t border-border">
                            <p className="text-sm text-emerald-400">Your booking has been accepted. Waiting for check-in activation by staff.</p>
                          </div>
                        )}
                        {b.status === 'Active' && (
                          <div className="mt-4 pt-3 border-t border-border">
                            <button
                              onClick={() => navigate('/food-menu', { state: { bookingId: b.id } })}
                              className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                            >
                              <UtensilsCrossed className="h-4 w-4" /> Order Food
                            </button>
                          </div>
                        )}
                        {b.status === 'Rejected' && (
                          <div className="mt-3 pt-3 border-t border-border">
                            <p className="text-sm text-red-400">Your booking request was rejected. Please contact support or try a different date/room.</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeSection === 'stay' && (
              <div className="bg-card rounded-xl border border-border p-6">
                <h2 className="font-display text-xl mb-6">Update Stay & Queries</h2>
                {bookings.filter(b => b.status === 'Active' || b.status === 'Booked').length > 0 ? (
                  <div className="space-y-4">
                    <div className="border border-border rounded-lg p-4">
                      <p className="font-semibold mb-2">Active / Upcoming Stays</p>
                      {bookings.filter(b => b.status === 'Active' || b.status === 'Booked').map(b => (
                        <div key={b.id} className="text-sm p-2 bg-accent/30 rounded mb-2">
                          Booking #{b.id} — Room{b.assignedRoomIds && b.assignedRoomIds.length > 0 ? ` ${b.assignedRoomIds.map(id => `#${id}`).join(', ')}` : b.room_id ? ` #${b.room_id}` : ' N/A'} — {b.checkin} to {b.checkout} — <span className={`font-medium ${b.status === 'Active' ? 'text-green-400' : 'text-yellow-400'}`}>{b.status}</span>
                        </div>
                      ))}
                    </div>
                    {bookings.some(b => b.status === 'Active') ? (
                      <>
                        <form onSubmit={handleQuerySubmit} className="space-y-3">
                        {myQueries.length > 0 && (
                          <div className="border border-border rounded-lg p-4 mb-4">
                            <p className="font-semibold mb-3 text-sm">Your Submitted Queries</p>
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                              {myQueries.map(q => (
                                <div key={q.id} className="flex items-center justify-between text-sm p-2.5 bg-accent/20 rounded-lg">
                                  <div className="flex-1 min-w-0">
                                    <p className="truncate font-medium">{q.description}</p>
                                    <p className="text-xs text-muted-foreground">Booking #{q.booking_id}{q.room_id ? ` · Room #${q.room_id}` : ''}</p>
                                  </div>
                                  <div className="flex items-center gap-3 ml-3">
                                    {q.status === 'Accepted' && q.amount > 0 && (
                                      <span className="text-xs font-semibold text-primary">₹{q.amount}</span>
                                    )}
                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                      q.status === 'Accepted' ? 'bg-green-500/20 text-green-400' :
                                      q.status === 'Rejected' ? 'bg-red-500/20 text-red-400' :
                                      'bg-yellow-500/20 text-yellow-400'
                                    }`}>{q.status}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                          <label className="text-sm font-medium mb-2 flex items-center gap-2 text-foreground">
                            <CalendarDays className="h-4 w-4 text-muted-foreground" /> Select Booking
                          </label>
                          <select
                            value={selectedQueryBooking || ''}
                            onChange={e => {
                              setSelectedQueryBooking(Number(e.target.value));
                              setSelectedQueryRoom(null);
                            }}
                            required
                            className="w-full border border-input rounded-xl px-4 py-3.5 bg-background text-foreground focus:ring-2 focus:ring-ring/50 focus:border-primary focus:outline-none transition-all duration-300 appearance-none cursor-pointer"
                          >
                            <option value="">Choose a booking...</option>
                            {bookings.filter(b => b.status === 'Active').map(b => (
                              <option key={b.id} value={b.id}>
                                Booking #{b.id} — {b.location || 'N/A'} — {b.room_type || 'N/A'}
                              </option>
                            ))}
                          </select>

                          {selectedQueryBooking && (() => {
                            const selectedBooking = bookings.find(b => b.id === selectedQueryBooking);
                            const roomIds = selectedBooking?.assignedRoomIds && selectedBooking.assignedRoomIds.length > 0
                              ? selectedBooking.assignedRoomIds
                              : selectedBooking?.room_id ? [selectedBooking.room_id] : [];
                            return roomIds.length > 0 ? (
                              <>
                                <label className="text-sm font-medium mb-2 flex items-center gap-2 text-foreground">
                                  <CalendarDays className="h-4 w-4 text-muted-foreground" /> Select Room Number
                                </label>
                                <select
                                  value={selectedQueryRoom || ''}
                                  onChange={e => setSelectedQueryRoom(Number(e.target.value))}
                                  className="w-full border border-input rounded-xl px-4 py-3.5 bg-background text-foreground focus:ring-2 focus:ring-ring/50 focus:border-primary focus:outline-none transition-all duration-300 appearance-none cursor-pointer"
                                >
                                  <option value="">Choose a room...</option>
                                  {roomIds.map(rid => (
                                    <option key={rid} value={rid}>Room #{rid}</option>
                                  ))}
                                </select>
                              </>
                            ) : null;
                          })()}

                          <label className="text-sm font-medium block">Select a Query</label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                            {queryOptions.map(opt => (
                              <button
                                key={opt.label}
                                type="button"
                                onClick={() => setSelectedQueryOption(opt.label)}
                                className={`text-left p-3 rounded-xl border transition-all duration-200 ${
                                  selectedQueryOption === opt.label
                                    ? 'border-primary bg-primary/10 ring-2 ring-primary/30'
                                    : 'border-border bg-accent/20 hover:border-primary/40 hover:bg-accent/40'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium text-foreground">{opt.label}</span>
                                  {opt.cost > 0 ? (
                                    <span className="text-xs font-semibold text-primary">₹{opt.cost}</span>
                                  ) : (
                                    <span className="text-xs font-medium text-green-400">Free</span>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">{opt.description}</p>
                              </button>
                            ))}
                          </div>
                          <button type="submit" disabled={!selectedQueryOption} className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2">
                            Submit Query
                          </button>
                        </form>
                        {querySuccess && <p className="text-green-400 text-sm">{querySuccess}</p>}
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground">Query submission is available only when your booking is active.</p>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No active or upcoming stays.</p>
                )}
              </div>
            )}

            {activeSection === 'food' && (
              <div className="bg-card rounded-xl border border-border p-6">
                <h2 className="font-display text-xl mb-6">Food Orders</h2>
                {foodOrders.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No food orders yet.</p>
                ) : (
                  <div className="overflow-x-auto max-h-96 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border text-muted-foreground">
                          <th className="text-left py-3 px-2">#</th>
                          <th className="text-left py-3 px-2">Item</th>
                          <th className="text-left py-3 px-2">Price</th>
                          <th className="text-left py-3 px-2">Room</th>
                          <th className="text-left py-3 px-2">Booking</th>
                          <th className="text-left py-3 px-2">Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          const grouped = foodOrders.reduce((acc, o) => {
                            const key = `${o.booking_id}-${o.room_id}-${o.item_name}-${o.price}`;
                            if (!acc[key]) {
                              acc[key] = { ...o, quantity: 1 };
                            } else {
                              acc[key].quantity += 1;
                            }
                            return acc;
                          }, {} as Record<string, FoodOrderRow & { quantity: number }>);
                          return Object.values(grouped).map((o, idx) => {
                            const roomDisplay = o.room_id ? `${o.room_id}` : 'N/A';
                            return (
                            <tr key={`${o.booking_id}-${o.item_name}-${idx}`} className="border-b border-border/50">
                              <td className="py-3 px-2">{idx + 1}</td>
                              <td className="py-3 px-2">{o.item_name} x {o.quantity}</td>
                              <td className="py-3 px-2">₹{o.price * o.quantity}</td>
                              <td className="py-3 px-2">{roomDisplay}</td>
                              <td className="py-3 px-2">#{o.booking_id}</td>
                              <td className="py-3 px-2">{o.timestamp ? new Date(o.timestamp).toLocaleString() : 'N/A'}</td>
                            </tr>
                            );
                          });
                        })()}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeSection === 'payment' && (
              <div className="bg-card rounded-xl border border-border p-6">
                <h2 className="font-display text-xl mb-6">Payment Status</h2>
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div className="p-6 bg-accent/30 rounded-xl border border-border text-center">
                    <p className="text-sm text-muted-foreground mb-2">Total Bill Amount</p>
                    <p className="text-3xl font-bold text-foreground">₹{totalBill.toLocaleString()}</p>
                    <div className="mt-3 text-xs text-muted-foreground space-y-1">
                      <p>Room Charges: ₹{totalRoomCharges.toLocaleString()}</p>
                      {totalFoodCharges > 0 && <p>Food Orders: ₹{totalFoodCharges.toLocaleString()}</p>}
                      {costQueryCharges > 0 && <p>Cost Queries: ₹{costQueryCharges.toLocaleString()}</p>}
                    </div>
                  </div>
                  <div className="p-6 bg-accent/30 rounded-xl border border-border text-center">
                    <p className="text-sm text-muted-foreground mb-2">Outstanding Amount</p>
                    <p className={`text-3xl font-bold ${outstandingAmount > 0 ? 'text-yellow-400' : 'text-green-400'}`}>
                      ₹{outstandingAmount.toLocaleString()}
                    </p>
                    <div className="mt-3 text-xs text-muted-foreground space-y-1">
                      {outstandingAmount <= 0 ? (
                        <p>All payments cleared ✓</p>
                      ) : (
                        <>
                          <p>Room: ₹{(totalRoomCharges - paidRoomCharges).toLocaleString()} {paidRoomCharges >= totalRoomCharges ? '✓ Paid' : '— Pending'}</p>
                          {totalFoodCharges > 0 && <p>Food: ₹{(totalFoodCharges - paidFoodCharges).toLocaleString()} {paidFoodCharges >= totalFoodCharges ? '✓ Paid' : '— Pending'}</p>}
                          {costQueryCharges > 0 && <p>Queries: ₹{(costQueryCharges - paidQueryCharges).toLocaleString()} {paidQueryCharges >= costQueryCharges ? '✓ Paid' : '— Pending'}</p>}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Per-booking payment actions */}
                <h3 className="font-display text-lg mb-4">Booking Payments</h3>
                <div className="space-y-3">
                  {bookings.filter(b => b.status !== 'Rejected' && b.status !== 'Pending').map(b => {
                    const prices: Record<string, number> = { 'STD': 3500, 'DLX': 6000, 'STE': 12000, 'PRE': 18000 };
                    const prefix = b.room_code?.substring(0, 3) || '';
                    const perNight = prices[prefix] || 5000;
                    const numRooms = b.total_rooms || 1;
                    const bookingTotal = perNight * b.nights * numRooms;
                    const bookingFoodTotal = foodOrders.filter(o => o.booking_id === b.id).reduce((s, o) => s + o.price, 0);
                    const bookingQueryCharges = myQueries.filter(q => q.booking_id === b.id && q.status === 'Accepted').reduce((s, q) => s + q.amount, 0);
                    const grandTotal = bookingTotal + bookingFoodTotal + bookingQueryCharges;

                    return (
                      <div key={b.id} className="border border-border rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div>
                          <p className="font-semibold text-sm">Booking #{b.id} — {b.location || 'N/A'}</p>
                          <p className="text-xs text-muted-foreground">
                            Room: ₹{bookingTotal.toLocaleString()}
                            {bookingFoodTotal > 0 && ` + Food: ₹${bookingFoodTotal.toLocaleString()}`}
                            {bookingQueryCharges > 0 && ` + Queries: ₹${bookingQueryCharges.toLocaleString()}`}
                            {' '}= ₹{grandTotal.toLocaleString()}
                          </p>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${b.payment_status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                              Room: {b.payment_status === 'Completed' ? 'Paid' : 'Pending'}
                            </span>
                            {(bookingFoodTotal > 0 || bookingQueryCharges > 0) && (
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${(b as any).services_payment_status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                {bookingFoodTotal > 0 && bookingQueryCharges > 0 ? 'Food+Queries' : bookingFoodTotal > 0 ? 'Food' : 'Queries'}: {(b as any).services_payment_status === 'Completed' ? 'Paid' : 'Pending'}
                              </span>
                            )}
                          </div>
                        </div>
                        {grandTotal > 0 && (b.payment_status !== 'Completed' || ((bookingFoodTotal > 0 || bookingQueryCharges > 0) && (b as any).services_payment_status !== 'Completed')) && (
                          <button
                            onClick={() => {}}
                            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                          >
                            <CreditCard className="h-4 w-4" /> Complete Payment
                          </button>
                        )}
                      </div>
                    );
                  })}
                  {bookings.filter(b => b.status !== 'Rejected' && b.status !== 'Pending').length === 0 && (
                    <p className="text-muted-foreground text-center py-4">No billable bookings yet.</p>
                  )}
                </div>
              </div>
            )}

            {activeSection === 'password' && (
              <div className="bg-card rounded-xl border border-border p-6 max-w-md">
                <h2 className="font-display text-xl mb-6">Update Password</h2>
                {pwError && <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm rounded-lg p-3 mb-4">{pwError}</div>}
                {pwSuccess && <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm rounded-lg p-3 mb-4">{pwSuccess}</div>}
                <form onSubmit={handlePasswordUpdate} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input type={showPw ? 'text' : 'password'} value={newPw} onChange={e => setNewPw(e.target.value)} required minLength={6}
                        className="w-full border border-input rounded-lg px-4 py-3 pl-10 bg-background text-foreground focus:ring-2 focus:ring-ring focus:outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Confirm New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input type={showPw ? 'text' : 'password'} value={confirmPw} onChange={e => setConfirmPw(e.target.value)} required minLength={6}
                        className="w-full border border-input rounded-lg px-4 py-3 pl-10 bg-background text-foreground focus:ring-2 focus:ring-ring focus:outline-none" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => setShowPw(!showPw)} className="text-sm text-muted-foreground hover:text-foreground">
                      {showPw ? <EyeOff className="h-4 w-4 inline mr-1" /> : <Eye className="h-4 w-4 inline mr-1" />}
                      {showPw ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  <button type="submit" className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors">
                    Update Password
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
