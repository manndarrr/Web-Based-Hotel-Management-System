import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { insertBooking, getAllBookings, updateBookingStatus as dbUpdateBookingStatus, insertFoodOrder, type DbBooking } from '@/services/database';
import { supabase } from '@/integrations/supabase/client';

// Types
export interface Room {
  id: number;
  location: string;
  type: string;
  roomCode: string;
  price: number;
  image: string;
  status: 'Available' | 'Booked' | 'Active' | 'Completed';
}

export interface Booking {
  id: number;
  name: string;
  email: string;
  nights: number;
  roomId: number;
  roomCode: string;
  status: 'Booked' | 'Active' | 'Completed' | 'Rejected';
  checkin: string;
  checkout: string;
}

export interface FoodOrder {
  id: number;
  bookingId: number;
  itemName: string;
  price: number;
  timestamp: string;
}

export interface CostQuery {
  id: number;
  bookingId: number;
  roomId: number | null;
  guestName: string;
  description: string;
  amount: number;
  status: 'Pending' | 'Accepted' | 'Rejected';
  createdAt: string;
}

export interface InventoryItem {
  id: number;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minStock: number;
  lastUpdated: string;
}

export interface MenuItem {
  name: string;
  price: number;
}

export interface CategorizedMenu {
  [category: string]: MenuItem[];
}

// Generate rooms
function generateRooms(): Room[] {
  const rooms: Room[] = [];
  const locations = [
    { name: 'Goa', prefix: 'goa', deluxePrice: 3000, execPrice: 5500, royalPrice: 12000 },
    { name: 'Srinagar', prefix: 'sri', deluxePrice: 4000, execPrice: 6500, royalPrice: 15000 },
    { name: 'Jaipur', prefix: 'jai', deluxePrice: 3500, execPrice: 6000, royalPrice: 14000 },
    { name: 'Udaipur', prefix: 'udp', deluxePrice: 4500, execPrice: 7000, royalPrice: 16000 },
    { name: 'Shimla', prefix: 'shm', deluxePrice: 3200, execPrice: 5800, royalPrice: 13000 },
    { name: 'Manali', prefix: 'mnl', deluxePrice: 3000, execPrice: 5500, royalPrice: 12000 },
    { name: 'Kerala', prefix: 'ker', deluxePrice: 3800, execPrice: 6200, royalPrice: 14500 },
    { name: 'Darjeeling', prefix: 'drj', deluxePrice: 2800, execPrice: 5000, royalPrice: 11000 },
    { name: 'Rishikesh', prefix: 'rsh', deluxePrice: 2500, execPrice: 4500, royalPrice: 10000 },
    { name: 'Agra', prefix: 'agr', deluxePrice: 3200, execPrice: 5800, royalPrice: 13000 },
    { name: 'Mumbai', prefix: 'mum', deluxePrice: 5000, execPrice: 8000, royalPrice: 18000 },
    { name: 'Delhi', prefix: 'del', deluxePrice: 4500, execPrice: 7500, royalPrice: 17000 },
    { name: 'Bangalore', prefix: 'blr', deluxePrice: 3500, execPrice: 6000, royalPrice: 13500 },
    { name: 'Kolkata', prefix: 'kol', deluxePrice: 3000, execPrice: 5200, royalPrice: 11500 },
    { name: 'Chennai', prefix: 'che', deluxePrice: 3200, execPrice: 5500, royalPrice: 12500 },
  ];
  let id = 100;
  for (const loc of locations) {
    for (let i = 0; i < 10; i++) rooms.push({ id: ++id, location: loc.name, type: 'Deluxe City View', roomCode: `${loc.prefix}-del`, price: loc.deluxePrice, image: '/images/goa_del.jpeg', status: 'Available' });
    for (let i = 0; i < 4; i++) rooms.push({ id: ++id, location: loc.name, type: 'Executive Suite', roomCode: `${loc.prefix}-exec`, price: loc.execPrice, image: '/images/goa_exec.jpeg', status: 'Available' });
    for (let i = 0; i < 3; i++) rooms.push({ id: ++id, location: loc.name, type: 'Royal Suite', roomCode: `${loc.prefix}-roy`, price: loc.royalPrice, image: '/images/goa_roy.jpeg', status: 'Available' });
  }
  return rooms;
}

// Generate 1000+ historical food orders for analytics
const allMenuItems = [
  { name: 'Paneer Butter Masala', price: 350 }, { name: 'Chicken Tikka Biryani', price: 450 },
  { name: 'Wood-Fired Margherita Pizza', price: 550 }, { name: 'Classic Tiramisu', price: 300 },
  { name: 'Authentic Mutton Rogan Josh', price: 650 }, { name: 'Gushtaba', price: 700 },
  { name: 'Traditional Kashmiri Kahwa Tea', price: 150 }, { name: 'Authentic Goan Fish Curry', price: 550 },
  { name: 'Chicken Cafreal', price: 480 }, { name: 'Bebinca', price: 250 },
  { name: 'Fresh Lime Soda', price: 120 }, { name: 'Mint Mojito', price: 180 },
  { name: 'Dal Makhani', price: 320 }, { name: 'Butter Naan', price: 80 },
  { name: 'Prawn Balchao', price: 620 }, { name: 'Lamb Seekh Kebab', price: 520 },
  { name: 'Mango Lassi', price: 140 }, { name: 'Chocolate Lava Cake', price: 350 },
  { name: 'Caesar Salad', price: 280 }, { name: 'Mushroom Risotto', price: 480 },
];

function generateHistoricalOrders(): FoodOrder[] {
  const orders: FoodOrder[] = [];
  for (let i = 1; i <= 1200; i++) {
    const item = allMenuItems[Math.floor(Math.random() * allMenuItems.length)];
    const daysAgo = Math.floor(Math.random() * 90);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    date.setHours(Math.floor(Math.random() * 14) + 7);
    orders.push({
      id: i,
      bookingId: Math.floor(Math.random() * 200) + 1,
      itemName: item.name,
      price: item.price,
      timestamp: date.toISOString(),
    });
  }
  return orders;
}

function generateInventory(): InventoryItem[] {
  return [
    { id: 1, name: 'Basmati Rice', category: 'Grains', quantity: 45, unit: 'kg', minStock: 20, lastUpdated: new Date().toISOString() },
    { id: 2, name: 'Chicken Breast', category: 'Meat', quantity: 12, unit: 'kg', minStock: 15, lastUpdated: new Date().toISOString() },
    { id: 3, name: 'Paneer', category: 'Dairy', quantity: 8, unit: 'kg', minStock: 5, lastUpdated: new Date().toISOString() },
    { id: 4, name: 'Tomatoes', category: 'Vegetables', quantity: 18, unit: 'kg', minStock: 10, lastUpdated: new Date().toISOString() },
    { id: 5, name: 'Onions', category: 'Vegetables', quantity: 25, unit: 'kg', minStock: 15, lastUpdated: new Date().toISOString() },
    { id: 6, name: 'Mutton', category: 'Meat', quantity: 6, unit: 'kg', minStock: 10, lastUpdated: new Date().toISOString() },
    { id: 7, name: 'Prawns', category: 'Seafood', quantity: 4, unit: 'kg', minStock: 5, lastUpdated: new Date().toISOString() },
    { id: 8, name: 'Butter', category: 'Dairy', quantity: 3, unit: 'kg', minStock: 5, lastUpdated: new Date().toISOString() },
    { id: 9, name: 'Fresh Cream', category: 'Dairy', quantity: 7, unit: 'L', minStock: 4, lastUpdated: new Date().toISOString() },
    { id: 10, name: 'Mozzarella', category: 'Dairy', quantity: 5, unit: 'kg', minStock: 3, lastUpdated: new Date().toISOString() },
    { id: 11, name: 'Flour (Maida)', category: 'Grains', quantity: 30, unit: 'kg', minStock: 10, lastUpdated: new Date().toISOString() },
    { id: 12, name: 'Cooking Oil', category: 'Oils', quantity: 15, unit: 'L', minStock: 8, lastUpdated: new Date().toISOString() },
    { id: 13, name: 'Garam Masala', category: 'Spices', quantity: 2, unit: 'kg', minStock: 1, lastUpdated: new Date().toISOString() },
    { id: 14, name: 'Saffron', category: 'Spices', quantity: 0.1, unit: 'kg', minStock: 0.05, lastUpdated: new Date().toISOString() },
    { id: 15, name: 'Fish (Fresh)', category: 'Seafood', quantity: 8, unit: 'kg', minStock: 5, lastUpdated: new Date().toISOString() },
    { id: 16, name: 'Eggs', category: 'Dairy', quantity: 120, unit: 'pcs', minStock: 50, lastUpdated: new Date().toISOString() },
    { id: 17, name: 'Lemon', category: 'Fruits', quantity: 40, unit: 'pcs', minStock: 20, lastUpdated: new Date().toISOString() },
    { id: 18, name: 'Mint Leaves', category: 'Herbs', quantity: 3, unit: 'kg', minStock: 1, lastUpdated: new Date().toISOString() },
    { id: 19, name: 'Milk', category: 'Dairy', quantity: 20, unit: 'L', minStock: 10, lastUpdated: new Date().toISOString() },
    { id: 20, name: 'Sugar', category: 'Grains', quantity: 15, unit: 'kg', minStock: 5, lastUpdated: new Date().toISOString() },
  ];
}

function generateCostQueries(): CostQuery[] {
  return [];
}

async function loadCostQueriesFromDb(): Promise<CostQuery[]> {
  const { data } = await supabase.from('cost_queries').select('*').order('id', { ascending: false });
  if (!data) return [];
  return data.map((q: any) => ({
    id: q.id,
    bookingId: q.booking_id,
    roomId: q.room_id ?? null,
    guestName: q.guest_name,
    description: q.description,
    amount: q.amount,
    status: q.status as 'Pending' | 'Accepted' | 'Rejected',
    createdAt: q.created_at,
  }));
}

// Context
interface HotelState {
  rooms: Room[];
  bookings: Booking[];
  foodOrders: FoodOrder[];
  costQueries: CostQuery[];
  inventory: InventoryItem[];
  activeBookingId: number | null;
  staffLoggedIn: boolean;
  staffDestination: string | null;
  dbBookings: DbBooking[];
  dbLoading: boolean;
}

interface HotelContextType extends HotelState {
  bookRoom: (location: string, roomType: string, name: string, email: string, checkin: string, checkout: string) => Promise<number | null>;
  addFoodOrders: (bookingId: number, items: { name: string; price: number }[]) => void;
  checkout: (bookingId: number) => { stay: Booking; room: Room; foodItems: FoodOrder[]; roomTotal: number; foodTotal: number; grandTotal: number } | null;
  setActiveBooking: (id: number | null) => void;
  staffLogin: (password: string) => boolean;
  staffDestination: string | null;
  staffLogout: () => void;
  updateCostQuery: (id: number, status: 'Accepted' | 'Rejected', amount?: number) => Promise<void>;
  updateInventory: (id: number, quantity: number) => void;
  getMenu: (location: string) => CategorizedMenu;
  getRoomCategories: (location: string) => { type: string; price: number; image: string }[];
  updateBookingStatus: (id: number, status: 'Booked' | 'Active' | 'Completed' | 'Rejected') => Promise<void>;
  refreshDbBookings: () => Promise<void>;
  refreshCostQueries: () => Promise<void>;
  submitCostQuery: (bookingId: number, guestName: string, description: string, userId?: string) => Promise<void>;
}

const HotelContext = createContext<HotelContextType | null>(null);

export function useHotel() {
  const ctx = useContext(HotelContext);
  if (!ctx) throw new Error('useHotel must be used within HotelProvider');
  return ctx;
}

export function HotelProvider({ children }: { children: React.ReactNode }) {
  const [rooms, setRooms] = useState<Room[]>(generateRooms);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [foodOrders, setFoodOrders] = useState<FoodOrder[]>(generateHistoricalOrders);
  const [costQueries, setCostQueries] = useState<CostQuery[]>(generateCostQueries);
  const [inventory, setInventory] = useState<InventoryItem[]>(generateInventory);
  const [activeBookingId, setActiveBookingId] = useState<number | null>(null);
  const [staffLoggedIn, setStaffLoggedIn] = useState(false);
  const [staffDestination, setStaffDestination] = useState<string | null>(null);
  const [dbBookings, setDbBookings] = useState<DbBooking[]>([]);
  const [dbLoading, setDbLoading] = useState(true);

  // Load bookings and cost queries from Supabase on mount + realtime
  useEffect(() => {
    const init = async () => {
      try {
        const [bookingsData, queriesData] = await Promise.all([
          getAllBookings(),
          loadCostQueriesFromDb(),
        ]);
        setDbBookings(bookingsData);
        setCostQueries(queriesData);
      } catch (err) {
        console.error('Failed to load data:', err);
      } finally {
        setDbLoading(false);
      }
    };
    init();

    // Realtime subscriptions for live updates
    const channel = supabase
      .channel('hotel-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, async () => {
        const data = await getAllBookings();
        setDbBookings(data);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'food_orders' }, async () => {
        // Trigger a re-render signal for food orders
        const data = await getAllBookings();
        setDbBookings(data);
        // Also refresh food orders state
        setFoodOrders(prev => [...prev]); // force re-render
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cost_queries' }, async () => {
        const data = await loadCostQueriesFromDb();
        setCostQueries(data);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms' }, async () => {
        // Rooms changed - refresh bookings to reflect
        const data = await getAllBookings();
        setDbBookings(data);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const refreshDbBookings = useCallback(async () => {
    const bookingsData = await getAllBookings();
    setDbBookings(bookingsData);
  }, []);

  const bookRoom = useCallback(async (location: string, roomType: string, name: string, email: string, checkin: string, checkout: string) => {
    const available = rooms.find(r => r.location === location && r.type === roomType && r.status === 'Available');
    if (!available) return null;

    const checkinDate = new Date(checkin);
    const checkoutDate = new Date(checkout);
    let nights = Math.ceil((checkoutDate.getTime() - checkinDate.getTime()) / (1000 * 60 * 60 * 24));
    if (nights <= 0) nights = 1;

    const bookingId = await insertBooking(name, email, nights, available.id, available.roomCode, checkin, checkout);

    const booking: Booking = {
      id: bookingId, name, email, nights, roomId: available.id,
      roomCode: available.roomCode, status: 'Booked', checkin, checkout,
    };

    setBookings(prev => [...prev, booking]);
    setRooms(prev => prev.map(r => r.id === available.id ? { ...r, status: 'Booked' as const } : r));
    setActiveBookingId(bookingId);

    await refreshDbBookings();
    return bookingId;
  }, [rooms, refreshDbBookings]);

  const addFoodOrders = useCallback((bookingId: number, items: { name: string; price: number }[]) => {
    const newOrders = items.map((item, i) => {
      insertFoodOrder(bookingId, item.name, item.price);
      return {
        id: foodOrders.length + i + 1,
        bookingId,
        itemName: item.name,
        price: item.price,
        timestamp: new Date().toISOString(),
      };
    });
    setFoodOrders(prev => [...prev, ...newOrders]);
  }, [foodOrders.length]);

  const checkoutFn = useCallback((bookingId: number) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return null;
    const room = rooms.find(r => r.id === booking.roomId);
    if (!room) return null;

    const foodItems = foodOrders.filter(f => f.bookingId === bookingId);
    const roomTotal = booking.nights * room.price;
    const foodTotal = foodItems.reduce((sum, f) => sum + f.price, 0);

    setRooms(prev => prev.map(r => r.id === room.id ? { ...r, status: 'Completed' as const } : r));
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'Completed' as const } : b));
    setActiveBookingId(null);

    dbUpdateBookingStatus(bookingId, 'Completed');
    refreshDbBookings();

    setTimeout(() => {
      setRooms(prev => prev.map(r => r.id === room.id ? { ...r, status: 'Available' as const } : r));
    }, 5000);

    return { stay: booking, room, foodItems, roomTotal, foodTotal, grandTotal: roomTotal + foodTotal };
  }, [bookings, rooms, foodOrders, refreshDbBookings]);

  const updateBookingStatusFn = useCallback(async (id: number, status: 'Booked' | 'Active' | 'Completed' | 'Rejected') => {
    await dbUpdateBookingStatus(id, status);

    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));

    const booking = bookings.find(b => b.id === id) || dbBookings.find(b => b.id === id);
    if (booking) {
      const roomId = 'roomId' in booking ? booking.roomId : booking.room_id;
      if (status === 'Active') {
        setRooms(prev => prev.map(r => r.id === roomId ? { ...r, status: 'Active' as const } : r));
      } else if (status === 'Rejected') {
        setRooms(prev => prev.map(r => r.id === roomId ? { ...r, status: 'Available' as const } : r));
      } else if (status === 'Completed') {
        setRooms(prev => prev.map(r => r.id === roomId ? { ...r, status: 'Available' as const } : r));
      }
    }

    await refreshDbBookings();
  }, [bookings, dbBookings, refreshDbBookings]);

  const STAFF_PASSWORDS: Record<string, string> = {
    'shriemp190001': 'Srinagar',
    'canemp403515': 'Goa',
    'jaiemp302001': 'Jaipur',
    'allemp688001': 'Kerala',
    'agremp282001': 'Agra',
  };

  const staffLogin = useCallback((password: string) => {
    const dest = STAFF_PASSWORDS[password];
    if (dest) {
      setStaffLoggedIn(true);
      setStaffDestination(dest);
      return true;
    }
    return false;
  }, []);

  const refreshCostQueries = useCallback(async () => {
    const data = await loadCostQueriesFromDb();
    setCostQueries(data);
  }, []);

  const submitCostQuery = useCallback(async (bookingId: number, guestName: string, description: string, userId?: string) => {
    await supabase.from('cost_queries').insert({
      booking_id: bookingId,
      guest_name: guestName,
      description,
      user_id: userId || null,
    });
    await refreshCostQueries();
  }, [refreshCostQueries]);

  const updateCostQuery = useCallback(async (id: number, status: 'Accepted' | 'Rejected', amount?: number) => {
    const updateData: any = { status };
    if (amount !== undefined) updateData.amount = amount;
    await supabase.from('cost_queries').update(updateData).eq('id', id);
    await refreshCostQueries();
  }, [refreshCostQueries]);

  const updateInventory = useCallback((id: number, quantity: number) => {
    setInventory(prev => prev.map(item => item.id === id ? { ...item, quantity, lastUpdated: new Date().toISOString() } : item));
  }, []);

  const getMenu = useCallback((location: string): CategorizedMenu => {
    const menu: CategorizedMenu = {
      'Indian Authentic': [{ name: 'Paneer Butter Masala', price: 350 }, { name: 'Chicken Tikka Biryani', price: 450 }, { name: 'Dal Makhani', price: 320 }, { name: 'Butter Naan', price: 80 }],
      'Italian Classics': [{ name: 'Wood-Fired Margherita Pizza', price: 550 }, { name: 'Classic Tiramisu', price: 300 }, { name: 'Mushroom Risotto', price: 480 }],
    };
    if (location === 'Srinagar') {
      menu['Kashmiri Specials'] = [
        { name: 'Authentic Mutton Rogan Josh', price: 650 },
        { name: 'Gushtaba (Minced Mutton Balls)', price: 700 },
        { name: 'Traditional Kashmiri Kahwa Tea', price: 150 },
      ];
    } else if (location === 'Goa') {
      menu['Goan Specials'] = [
        { name: 'Authentic Goan Fish Curry', price: 550 },
        { name: 'Chicken Cafreal', price: 480 },
        { name: 'Bebinca (Traditional Layered Dessert)', price: 250 },
        { name: 'Prawn Balchao', price: 620 },
      ];
    }
    menu['Beverages'] = [{ name: 'Fresh Lime Soda', price: 120 }, { name: 'Mint Mojito', price: 180 }, { name: 'Mango Lassi', price: 140 }];
    return menu;
  }, []);

  const getRoomCategories = useCallback((location: string) => {
    const seen = new Set<string>();
    return rooms.filter(r => r.location === location).filter(r => {
      if (seen.has(r.type)) return false;
      seen.add(r.type);
      return true;
    }).map(r => ({ type: r.type, price: r.price, image: r.image }));
  }, [rooms]);

  return (
    <HotelContext.Provider value={{
      rooms, bookings, foodOrders, costQueries, inventory, activeBookingId, staffLoggedIn, staffDestination, dbBookings, dbLoading,
      bookRoom, addFoodOrders, checkout: checkoutFn, setActiveBooking: setActiveBookingId,
      staffLogin, staffLogout: () => { setStaffLoggedIn(false); setStaffDestination(null); }, updateCostQuery, updateInventory, getMenu, getRoomCategories,
      updateBookingStatus: updateBookingStatusFn, refreshDbBookings, refreshCostQueries, submitCostQuery,
    }}>
      {children}
    </HotelContext.Provider>
  );
}
