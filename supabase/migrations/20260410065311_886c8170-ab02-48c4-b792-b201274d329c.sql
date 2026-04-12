ALTER TABLE public.food_orders DROP COLUMN IF EXISTS room_code;
ALTER TABLE public.food_orders ADD COLUMN room_id bigint;