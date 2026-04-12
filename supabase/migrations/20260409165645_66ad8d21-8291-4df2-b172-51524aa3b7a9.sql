
ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_room_id_fkey;

ALTER TABLE public.bookings 
  ADD COLUMN IF NOT EXISTS location text,
  ADD COLUMN IF NOT EXISTS room_type text,
  ADD COLUMN IF NOT EXISTS total_adults integer DEFAULT 1,
  ADD COLUMN IF NOT EXISTS total_children integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_rooms integer DEFAULT 1;

ALTER TABLE public.bookings ALTER COLUMN status SET DEFAULT 'Pending';
