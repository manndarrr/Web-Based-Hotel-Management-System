import { useNavigate } from 'react-router-dom';
import { useHotel } from '@/context/HotelContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnimatedSection from '@/components/AnimatedSection';
import { UtensilsCrossed, LogOut, MapPin, BedDouble, Moon, IndianRupee, Sparkles, Clock } from 'lucide-react';

export default function Dashboard() {
  const { activeBookingId, bookings, rooms, foodOrders } = useHotel();
  const navigate = useNavigate();

  const booking = bookings.find(b => b.id === activeBookingId);
  const room = booking ? rooms.find(r => r.id === booking.roomId) : null;
  const guestFoodOrders = foodOrders.filter(f => f.bookingId === activeBookingId);
  const foodTotal = guestFoodOrders.reduce((s, f) => s + f.price, 0);

  if (!booking || !room) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 flex items-center justify-center pt-24">
          <AnimatedSection>
            <div className="text-center glass rounded-2xl p-14 border border-border/50 shadow-xl">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                <BedDouble className="h-7 w-7 text-muted-foreground" />
              </div>
              <h2 className="font-display text-2xl text-foreground mb-3">No Active Stay</h2>
              <p className="text-muted-foreground text-sm mb-6">Book a room to access your guest portal.</p>
              <button onClick={() => navigate('/')} className="bg-primary text-primary-foreground px-8 py-3.5 rounded-xl font-medium hover:bg-primary/90 transition-all duration-300">
                Explore Rooms
              </button>
            </div>
          </AnimatedSection>
        </div>
        <Footer />
      </div>
    );
  }

  const statusConfig = {
    Active: { bg: 'bg-green-500/10', text: 'text-green-600', dot: 'bg-green-500' },
    Booked: { bg: 'bg-blue-500/10', text: 'text-blue-600', dot: 'bg-blue-500' },
    Completed: { bg: 'bg-muted', text: 'text-muted-foreground', dot: 'bg-muted-foreground' },
    Available: { bg: 'bg-muted', text: 'text-muted-foreground', dot: 'bg-muted-foreground' },
  };
  const sc = statusConfig[room.status];

  const infoItems = [
    { icon: MapPin, label: 'Location', value: `Radison ${room.location}` },
    { icon: BedDouble, label: 'Room', value: `${room.type} • Room ${room.id}` },
    { icon: Moon, label: 'Duration', value: `${booking.nights} Night${booking.nights > 1 ? 's' : ''}` },
    { icon: IndianRupee, label: 'Rate', value: `₹${room.price.toLocaleString()}/night` },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Header */}
      <section className="relative pt-28 pb-16 overflow-hidden">
        <div className="absolute inset-0 hotel-gradient opacity-5" />
        <div className="max-w-5xl mx-auto px-6 relative">
          <AnimatedSection>
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="h-5 w-5 text-hotel-gold" />
              <p className="text-hotel-gold font-medium tracking-[0.2em] uppercase text-xs">Guest Portal</p>
            </div>
            <h1 className="font-display text-3xl md:text-4xl text-foreground mb-1">
              Welcome, {booking.name}
            </h1>
            <p className="text-muted-foreground text-sm">Manage your stay, order dining, and checkout — all in one place.</p>
          </AnimatedSection>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 pb-20 -mt-4 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stay Info */}
          <AnimatedSection className="lg:col-span-2" delay={0}>
            <div className="bg-card rounded-2xl shadow-lg p-8 border border-border/50 h-full">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-display text-xl text-foreground">Stay Details</h3>
                <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${sc.bg} ${sc.text}`}>
                  <span className={`w-2 h-2 rounded-full ${sc.dot} animate-pulse`} />
                  {room.status}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {infoItems.map((item, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-accent/30 border border-border/30">
                    <div className="shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <item.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">{item.label}</p>
                      <p className="text-sm font-medium text-foreground">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedSection>

          {/* Quick Actions */}
          <AnimatedSection delay={150}>
            <div className="bg-card rounded-2xl shadow-lg p-8 border border-border/50 h-full flex flex-col gap-4">
              <h3 className="font-display text-xl text-foreground mb-2">Quick Actions</h3>

              <button
                onClick={() => navigate('/menu')}
                className="flex items-center gap-3 p-4 rounded-xl bg-foreground text-background font-semibold hover:bg-foreground/90 transition-all duration-300 hover:-translate-y-0.5 shadow-md group"
              >
                <UtensilsCrossed className="h-5 w-5" />
                <div className="text-left">
                  <p className="text-sm">Order Dining</p>
                  <p className="text-xs opacity-60 font-normal">Browse in-room menu</p>
                </div>
                <span className="ml-auto text-xs opacity-40 group-hover:opacity-60">→</span>
              </button>

              <button
                onClick={() => navigate('/checkout')}
                className="flex items-center gap-3 p-4 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all duration-300 hover:-translate-y-0.5 shadow-md group"
              >
                <LogOut className="h-5 w-5" />
                <div className="text-left">
                  <p className="text-sm">Check Out</p>
                  <p className="text-xs opacity-60 font-normal">View invoice & pay</p>
                </div>
                <span className="ml-auto text-xs opacity-40 group-hover:opacity-60">→</span>
              </button>

              {/* Food tab summary */}
              <div className="mt-auto p-5 rounded-xl bg-accent/40 border border-border/30">
                <p className="text-xs text-muted-foreground mb-1">Running Food Tab</p>
                <p className="font-display text-2xl text-foreground">₹{foodTotal.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">{guestFoodOrders.length} item{guestFoodOrders.length !== 1 ? 's' : ''} ordered</p>
              </div>
            </div>
          </AnimatedSection>
        </div>

        {/* Recent orders */}
        {guestFoodOrders.length > 0 && (
          <AnimatedSection delay={300} className="mt-6">
            <div className="bg-card rounded-2xl shadow-lg p-8 border border-border/50">
              <h3 className="font-display text-xl text-foreground mb-6 flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" /> Recent Orders
              </h3>
              <div className="space-y-3">
                {guestFoodOrders.slice(-5).reverse().map((order, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-accent/20 border border-border/20">
                    <div>
                      <p className="text-sm font-medium text-foreground">{order.itemName}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-foreground">₹{order.price.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedSection>
        )}
      </div>

      <Footer />
    </div>
  );
}
