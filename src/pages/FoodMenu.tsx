import { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ShoppingCart, Plus, Minus, Trash2, X, TrendingUp, Flame, AlertTriangle, XCircle, ChevronRight, Sparkles } from 'lucide-react';
import { useHotel } from '@/context/HotelContext';
import { getMenuAvailability } from '@/services/stockAnalytics';
import orderDataset from '@/data/orderDataset.json';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface MenuItem {
  name: string;
  price: number;
  cuisine: string;
  image: string;
  badge?: 'chef' | 'limited' | 'soldout';
  orderCount: number;
}

interface CartItem extends MenuItem {
  quantity: number;
}

const CUISINE_TABS = ['North Indian', 'South Indian', 'Continental'] as const;
type Cuisine = typeof CUISINE_TABS[number];

const CUISINE_IMAGES: Record<string, string[]> = {
  'North Indian': [
    'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&h=300&fit=crop',
  ],
  'South Indian': [
    'https://images.unsplash.com/photo-1630383249896-424e482df921?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1567337710282-00832b415979?w=400&h=300&fit=crop',
  ],
  'Continental': [
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop',
  ],
};

function getImageForItem(name: string, cuisine: string, index: number): string {
  const images = CUISINE_IMAGES[cuisine] || CUISINE_IMAGES['Continental'];
  return images[index % images.length];
}

export default function FoodMenu() {
  const navigate = useNavigate();
  const location = useLocation();
  const bookingId = location.state?.bookingId as number | undefined;
  const { inventory } = useHotel();

  const [activeCuisine, setActiveCuisine] = useState<Cuisine>('North Indian');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [assignedRooms, setAssignedRooms] = useState<{ id: number; room_code: string }[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);

  // Fetch assigned rooms for the booking
  useEffect(() => {
    if (!bookingId) return;
    const fetchRooms = async () => {
      const { data: brData } = await supabase.from('booked_rooms').select('room_id').eq('booking_id', bookingId);
      if (brData && brData.length > 0) {
        const roomIds = brData.map(br => br.room_id);
        const { data: roomsData } = await supabase.from('rooms').select('id, room_code').in('id', roomIds);
        if (roomsData && roomsData.length > 0) {
          setAssignedRooms(roomsData);
          setSelectedRoomId(roomsData[0].id);
        }
      }
    };
    fetchRooms();
  }, [bookingId]);

  const allMenuItems = useMemo(() => {
    const itemMap: Record<string, { cuisine: string; price: number; count: number }> = {};
    (orderDataset as any[]).forEach((o: any) => {
      if (!itemMap[o.itemName]) {
        itemMap[o.itemName] = { cuisine: o.cuisine, price: o.price, count: 0 };
      }
      itemMap[o.itemName].count++;
    });
    return Object.entries(itemMap).map(([name, info], i) => ({
      name, cuisine: info.cuisine, price: info.price, orderCount: info.count,
      image: getImageForItem(name, info.cuisine, i),
    }));
  }, []);

  const availability = useMemo(() => getMenuAvailability(inventory), [inventory]);

  const menuItemsWithBadges: MenuItem[] = useMemo(() => {
    return allMenuItems.map(item => {
      const avail = availability[item.name];
      let badge: MenuItem['badge'] = undefined;
      if (avail?.status === 'Out of Stock') badge = 'soldout';
      else if (avail?.status === 'Limited') badge = 'limited';
      else if (item.orderCount >= 22) badge = 'chef';
      return { ...item, badge };
    });
  }, [allMenuItems, availability]);

  const trending = useMemo(() => {
    return [...menuItemsWithBadges].filter(i => i.badge !== 'soldout').sort((a, b) => b.orderCount - a.orderCount).slice(0, 3);
  }, [menuItemsWithBadges]);

  const filteredItems = useMemo(() => {
    return menuItemsWithBadges.filter(i => i.cuisine === activeCuisine);
  }, [menuItemsWithBadges, activeCuisine]);

  const addToCart = useCallback((item: MenuItem) => {
    if (item.badge === 'soldout') return;
    setCart(prev => {
      const existing = prev.find(c => c.name === item.name);
      if (existing) return prev.map(c => c.name === item.name ? { ...c, quantity: c.quantity + 1 } : c);
      return [...prev, { ...item, quantity: 1 }];
    });
  }, []);

  const updateQty = useCallback((name: string, delta: number) => {
    setCart(prev => prev.map(c => {
      if (c.name !== name) return c;
      const newQty = c.quantity + delta;
      return newQty <= 0 ? null : { ...c, quantity: newQty };
    }).filter(Boolean) as CartItem[]);
  }, []);

  const removeFromCart = useCallback((name: string) => {
    setCart(prev => prev.filter(c => c.name !== name));
  }, []);

  const totalItems = cart.reduce((s, c) => s + c.quantity, 0);
  const totalPrice = cart.reduce((s, c) => s + c.price * c.quantity, 0);

  const handlePlaceOrder = async () => {
    if (!bookingId || cart.length === 0) return;
    if (assignedRooms.length > 1 && !selectedRoomId) {
      toast.error('Please select a room number');
      return;
    }
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const roomId = assignedRooms.length > 0 ? selectedRoomId : null;
      const rows = cart.flatMap(c =>
        Array.from({ length: c.quantity }, () => ({
          booking_id: bookingId, item_name: c.name, price: c.price, user_id: user?.id || null,
          room_id: roomId,
        }))
      );
      const { error } = await supabase.from('food_orders').insert(rows as any);
      if (error) throw error;
      toast.success('Order placed successfully!');
      setCart([]);
      setCartOpen(false);
      navigate('/profile', { state: { scrollTo: 'food-orders' } });
    } catch (err: any) {
      toast.error('Failed to place order: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getBadgeEl = (badge?: MenuItem['badge']) => {
    if (!badge) return null;
    switch (badge) {
      case 'chef':
        return (
          <span className="absolute top-3 left-3 z-10 flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-hotel-gold text-foreground">
            <Flame className="h-3 w-3" /> Chef's Special
          </span>
        );
      case 'limited':
        return (
          <span className="absolute top-3 left-3 z-10 flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/90 text-white">
            <AlertTriangle className="h-3 w-3" /> Limited Portions
          </span>
        );
      case 'soldout':
        return (
          <span className="absolute top-3 left-3 z-10 flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-destructive/90 text-white">
            <XCircle className="h-3 w-3" /> Sold Out
          </span>
        );
    }
  };

  const cartItemCount = (name: string) => cart.find(c => c.name === name)?.quantity || 0;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar variant="light" />

      {/* Hero */}
      <div className="pt-24 pb-8 px-4 sm:px-6 text-center bg-secondary">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <p className="text-hotel-gold font-medium tracking-[0.25em] uppercase text-xs mb-2 flex items-center justify-center gap-2">
            <Sparkles className="h-4 w-4" /> In-Room Dining
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-2">Curated Menu</h1>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">Handcrafted dishes prepared by our award-winning chefs. Select items and place your order.</p>
        </motion.div>
      </div>

      {/* Trending Now */}
      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-hotel-gold" />
            <h2 className="text-foreground font-semibold text-lg">Trending Now</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {trending.map((item, i) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="relative rounded-2xl overflow-hidden group cursor-pointer bg-card border border-border shadow-sm hover:shadow-lg transition-shadow"
                onClick={() => addToCart(item)}
              >
                <div className="relative h-36 overflow-hidden">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                  <span className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-hotel-gold/20 text-hotel-gold border border-hotel-gold/30">
                    <TrendingUp className="h-3 w-3" /> #{i + 1}
                  </span>
                </div>
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-foreground font-semibold text-sm">{item.name}</h3>
                    <p className="text-muted-foreground text-xs mt-0.5">{item.orderCount} orders this month</p>
                  </div>
                  <span className="text-primary font-bold">₹{item.price}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Cuisine Tabs */}
      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {CUISINE_TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveCuisine(tab)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-300 ${
                activeCuisine === tab
                  ? 'bg-primary text-primary-foreground shadow-lg'
                  : 'bg-secondary text-muted-foreground hover:bg-accent'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Grid */}
      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 flex-1">
        <motion.div
          key={activeCuisine}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {filteredItems.map((item, i) => {
            const inCart = cartItemCount(item.name);
            const isSoldOut = item.badge === 'soldout';
            return (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`relative rounded-2xl overflow-hidden group transition-all duration-300 bg-card border shadow-sm ${
                  isSoldOut ? 'opacity-50 grayscale border-border' : 'hover:shadow-xl border-border'
                } ${inCart > 0 ? 'ring-2 ring-primary' : ''}`}
              >
                {getBadgeEl(item.badge)}

                <div className="relative h-44 overflow-hidden">
                  <img src={item.image} alt={item.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-foreground font-semibold text-sm leading-tight flex-1 mr-2">{item.name}</h3>
                    <span className="text-primary font-bold text-base whitespace-nowrap">₹{item.price}</span>
                  </div>

                  {isSoldOut ? (
                    <div className="flex items-center justify-center py-2 rounded-xl bg-destructive/10 text-destructive text-xs font-semibold">
                      Currently Unavailable
                    </div>
                  ) : inCart > 0 ? (
                    <div className="flex items-center justify-between bg-primary/10 rounded-xl px-3 py-2">
                      <motion.button
                        whileTap={{ scale: 0.85 }}
                        onClick={(e) => { e.stopPropagation(); updateQty(item.name, -1); }}
                        className="w-8 h-8 rounded-full flex items-center justify-center bg-muted text-foreground hover:bg-accent transition-colors"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </motion.button>
                      <motion.span
                        key={inCart}
                        initial={{ scale: 1.4 }}
                        animate={{ scale: 1 }}
                        className="text-primary font-bold text-lg"
                      >
                        {inCart}
                      </motion.span>
                      <motion.button
                        whileTap={{ scale: 0.85 }}
                        onClick={(e) => { e.stopPropagation(); addToCart(item); }}
                        className="w-8 h-8 rounded-full flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </motion.button>
                    </div>
                  ) : (
                    <motion.button
                      whileTap={{ scale: 0.92 }}
                      onClick={() => addToCart(item)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 bg-secondary text-foreground hover:bg-primary hover:text-primary-foreground"
                    >
                      <Plus className="h-4 w-4" /> Add to Cart
                    </motion.button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Sticky Order Bar */}
      <AnimatePresence>
        {totalItems > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="sticky bottom-0 z-40"
          >
            <div className="mx-4 sm:mx-auto sm:max-w-xl mb-4 rounded-2xl p-4 flex items-center justify-between backdrop-blur-xl shadow-2xl bg-card/95 border border-border">
              <div>
                <p className="text-muted-foreground text-xs">{totalItems} item{totalItems !== 1 ? 's' : ''}</p>
                <p className="text-foreground font-bold text-xl">₹{totalPrice.toLocaleString()}</p>
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setCartOpen(true)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg"
              >
                <ShoppingCart className="h-4 w-4" /> View Cart <ChevronRight className="h-4 w-4" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart Drawer */}
      <AnimatePresence>
        {cartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCartOpen(false)}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md flex flex-col bg-card shadow-2xl"
            >
              {/* Cart Header */}
              <div className="flex items-center justify-between p-5 border-b border-border">
                <div className="flex items-center gap-3">
                  <ShoppingCart className="h-5 w-5 text-primary" />
                  <h2 className="text-foreground font-bold text-lg">Your Order</h2>
                  <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">{totalItems}</span>
                </div>
                <button onClick={() => setCartOpen(false)} className="w-8 h-8 rounded-full flex items-center justify-center bg-muted text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-5 space-y-3">
                {cart.map(item => (
                  <motion.div
                    key={item.name}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-secondary"
                  >
                    <img src={item.image} alt={item.name} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-foreground text-sm font-medium truncate">{item.name}</h4>
                      <p className="text-primary text-sm font-bold">₹{item.price * item.quantity}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQty(item.name, -1)} className="w-7 h-7 rounded-full bg-muted text-foreground flex items-center justify-center hover:bg-accent">
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="text-foreground font-bold text-sm w-5 text-center">{item.quantity}</span>
                      <button onClick={() => updateQty(item.name, 1)} className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90">
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <button onClick={() => removeFromCart(item.name)} className="text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </motion.div>
                ))}
              </div>

              {/* Cart Footer */}
              <div className="p-5 border-t border-border space-y-4">
                {assignedRooms.length > 1 && (
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Select Room</label>
                    <div className="flex gap-2 flex-wrap">
                      {assignedRooms.map(room => (
                        <button
                          key={room.id}
                          onClick={() => setSelectedRoomId(room.id)}
                          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                            selectedRoomId === room.id
                              ? 'bg-primary text-primary-foreground shadow-md'
                              : 'bg-secondary text-muted-foreground hover:bg-accent'
                          }`}
                        >
                          Room {room.id}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">Total</span>
                  <span className="text-foreground font-bold text-2xl">₹{totalPrice.toLocaleString()}</span>
                </div>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handlePlaceOrder}
                  disabled={submitting || cart.length === 0}
                  className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg"
                >
                  {submitting ? 'Placing Order...' : 'Place Order'}
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
