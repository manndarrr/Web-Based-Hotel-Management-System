
CREATE TABLE public.cost_queries (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  booking_id BIGINT NOT NULL,
  user_id UUID,
  guest_name TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  amount INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.cost_queries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read cost_queries" ON public.cost_queries FOR SELECT USING (true);
CREATE POLICY "Anyone can create cost_queries" ON public.cost_queries FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update cost_queries" ON public.cost_queries FOR UPDATE USING (true);
