import { useNavigate } from 'react-router-dom';
import { useHotel } from '@/context/HotelContext';
import { useState, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnimatedSection from '@/components/AnimatedSection';
import { ShoppingCart, ArrowLeft, Check, Sparkles, AlertTriangle, XCircle } from 'lucide-react';
import { getMenuAvailability } from '@/services/stockAnalytics';

export default function Menu() {
  const { activeBookingId, bookings, rooms, addFoodOrders, getMenu, inventory } = useHotel();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<{ name: string; price: number }[]>([]);

  const booking = bookings.find(b => b.id === activeBookingId);
  const room = booking ? rooms.find(r => r.id === booking.roomId) : null;

  const menu = room ? getMenu(room.location) : {};
  const availability = useMemo(() => getMenuAvailability(inventory), [inventory]);

  if (!booking || !room) { navigate('/'); return null; }

  const toggleItem = (item: { name: string; price: number }) => {
    const avail = availability[item.name];
    if (avail && avail.status === 'Out of Stock') return;
    setSelected(prev => prev.some(s => s.name === item.name) ? prev.filter(s => s.name !== item.name) : [...prev, item]);
  };

  const handleOrder = () => {
    if (selected.length > 0) {
      addFoodOrders(booking.id, selected);
      navigate('/dashboard');
    }
  };

  const total = selected.reduce((s, i) => s + i.price, 0);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 pt-28 pb-20 flex-1 w-full">
        <AnimatedSection>
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
            <ArrowLeft className="h-4 w-4" /> Back to Portal
          </button>

          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="h-5 w-5 text-hotel-gold" />
            <p className="text-hotel-gold font-medium tracking-[0.2em] uppercase text-xs">In-Room Dining</p>
          </div>
          <h2 className="font-display text-3xl text-foreground mb-2">Curated Menu</h2>
          <p className="text-muted-foreground text-sm mb-10">Tap items to add them to your order. Real-time availability shown.</p>
        </AnimatedSection>

        {Object.entries(menu).map(([category, items], catIdx) => (
          <AnimatedSection key={category} delay={catIdx * 100} className="mb-10">
            <h3 className="text-primary font-semibold text-sm uppercase tracking-wider mb-4 flex items-center gap-3">
              <span className="h-px flex-1 bg-border" />
              {category}
              <span className="h-px flex-1 bg-border" />
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {items.map(item => {
                const isSelected = selected.some(s => s.name === item.name);
                const avail = availability[item.name];
                const isOutOfStock = avail?.status === 'Out of Stock';
                const isLimited = avail?.status === 'Limited';

                return (
                  <button
                    key={item.name}
                    onClick={() => toggleItem(item)}
                    disabled={isOutOfStock}
                    className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all duration-300 text-left relative ${
                      isOutOfStock
                        ? 'bg-muted/50 border border-border/30 opacity-60 cursor-not-allowed'
                        : isSelected
                        ? 'bg-primary/10 border-2 border-primary/40 shadow-md'
                        : 'bg-card border border-border/50 hover:border-primary/20 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-300 flex-shrink-0 ${
                        isOutOfStock ? 'bg-red-100 border border-red-200' :
                        isSelected ? 'bg-primary text-primary-foreground' : 'bg-accent border border-border'
                      }`}>
                        {isOutOfStock ? <XCircle className="h-3.5 w-3.5 text-red-500" /> :
                         isSelected && <Check className="h-3.5 w-3.5" />}
                      </div>
                      <div className="min-w-0">
                        <span className={`font-medium text-sm block ${isOutOfStock ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                          {item.name}
                        </span>
                        {isOutOfStock && (
                          <span className="text-[10px] text-red-500 font-semibold flex items-center gap-1 mt-0.5">
                            <XCircle className="h-3 w-3" /> Out of Stock
                          </span>
                        )}
                        {isLimited && avail.remainingServings !== null && (
                          <span className="text-[10px] text-amber-600 font-semibold flex items-center gap-1 mt-0.5">
                            <AlertTriangle className="h-3 w-3" /> Only {avail.remainingServings} left!
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-muted-foreground font-semibold text-sm flex-shrink-0">₹{item.price}</span>
                  </button>
                );
              })}
            </div>
          </AnimatedSection>
        ))}

        {/* Sticky order bar */}
        <AnimatedSection delay={400}>
          <div className="sticky bottom-6 glass rounded-2xl shadow-2xl border border-border/50 p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">{selected.length} item{selected.length !== 1 ? 's' : ''} selected</p>
              <p className="font-display text-xl text-foreground">₹{total.toLocaleString()}</p>
            </div>
            <button
              onClick={handleOrder}
              disabled={selected.length === 0}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3.5 rounded-xl font-semibold hover:bg-primary/90 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:hover:translate-y-0"
            >
              <ShoppingCart className="h-4 w-4" /> Confirm Order
            </button>
          </div>
        </AnimatedSection>
      </div>
      <Footer />
    </div>
  );
}
