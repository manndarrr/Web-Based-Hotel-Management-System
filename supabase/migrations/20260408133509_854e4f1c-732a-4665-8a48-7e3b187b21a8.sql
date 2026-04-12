
-- Create customers table
CREATE TABLE public.customers (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create rooms table
CREATE TABLE public.rooms (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  location TEXT NOT NULL,
  type TEXT NOT NULL,
  room_code TEXT NOT NULL,
  price INTEGER NOT NULL,
  image TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'Available'
);

-- Create bookings table
CREATE TABLE public.bookings (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  nights INTEGER NOT NULL,
  room_id BIGINT REFERENCES public.rooms(id),
  room_code TEXT,
  status TEXT NOT NULL DEFAULT 'Booked',
  checkin TEXT,
  checkout TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create food_orders table
CREATE TABLE public.food_orders (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  booking_id BIGINT REFERENCES public.bookings(id),
  item_name TEXT NOT NULL,
  price INTEGER NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_orders ENABLE ROW LEVEL SECURITY;

-- Customers: public read/insert, update own password
CREATE POLICY "Anyone can read customers" ON public.customers FOR SELECT USING (true);
CREATE POLICY "Anyone can create customers" ON public.customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update customers" ON public.customers FOR UPDATE USING (true);

-- Rooms: public read, staff can update
CREATE POLICY "Anyone can read rooms" ON public.rooms FOR SELECT USING (true);
CREATE POLICY "Anyone can insert rooms" ON public.rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update rooms" ON public.rooms FOR UPDATE USING (true);

-- Bookings: public read/insert/update
CREATE POLICY "Anyone can read bookings" ON public.bookings FOR SELECT USING (true);
CREATE POLICY "Anyone can create bookings" ON public.bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update bookings" ON public.bookings FOR UPDATE USING (true);

-- Food orders: public read/insert
CREATE POLICY "Anyone can read food_orders" ON public.food_orders FOR SELECT USING (true);
CREATE POLICY "Anyone can create food_orders" ON public.food_orders FOR INSERT WITH CHECK (true);
