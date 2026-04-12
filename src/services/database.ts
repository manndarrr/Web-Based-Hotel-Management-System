import { supabase } from '@/integrations/supabase/client';

// --- Types ---

export interface DbBooking {
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
  user_id: string | null;
  payment_status: string;
}


export interface DbFoodOrder {
  id: number;
  booking_id: number;
  item_name: string;
  price: number;
  timestamp: string;
}

// --- Booking operations ---

export async function insertBooking(
  name: string, email: string, nights: number, roomId: number,
  roomCode: string, checkin: string, checkout: string
): Promise<number> {
  // Get current user's id if logged in
  const { data: { user } } = await supabase.auth.getUser();
  const user_id = user?.id || null;

  const { data, error } = await supabase
    .from('bookings')
    .insert({ name, email, nights, room_id: String(roomId), room_code: roomCode, status: 'Booked', checkin, checkout, user_id } as any)
    .select('id')
    .single();

  if (error) throw error;

  // Update room status
  await supabase.from('rooms').update({ status: 'Booked' }).eq('id', roomId);

  return data.id;
}

export async function getAllBookings(): Promise<DbBooking[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .order('id', { ascending: false });

  if (error) throw error;
  return (data || []).map(row => ({
    id: row.id,
    name: row.name,
    email: row.email,
    nights: row.nights,
    room_id: row.room_id,
    room_code: row.room_code,
    status: row.status,
    checkin: row.checkin,
    checkout: row.checkout,
    created_at: row.created_at || '',
    location: row.location,
    room_type: row.room_type,
    total_adults: row.total_adults,
    total_children: row.total_children,
    total_rooms: row.total_rooms,
    user_id: row.user_id,
    payment_status: (row as any).payment_status || 'Pending',
  }));
}

export async function updateBookingStatus(id: number, status: 'Booked' | 'Active' | 'Completed' | 'Rejected'): Promise<void> {
  if (status === 'Active') {
    // When activating, find available rooms matching booking's location & room_type
    const { data: booking } = await supabase.from('bookings').select('location, room_type, room_id, total_rooms').eq('id', id).single();
    if (!booking) throw new Error('Booking not found');

    const totalRoomsNeeded = booking.total_rooms || 1;

    // Check if rooms are already assigned via booked_rooms
    const { data: existingAssignments } = await supabase.from('booked_rooms').select('room_id').eq('booking_id', id);
    
    if ((!existingAssignments || existingAssignments.length === 0) && !booking.room_id && booking.location && booking.room_type) {
      // Find available rooms of the requested type at the requested location
      const { data: availableRooms, error: roomError } = await supabase
        .from('rooms')
        .select('id, room_code')
        .eq('location', booking.location)
        .eq('type', booking.room_type)
        .eq('status', 'Available')
        .limit(totalRoomsNeeded);

      if (roomError || !availableRooms || availableRooms.length === 0) {
        throw new Error('No available room of the requested type at this location');
      }

      if (availableRooms.length < totalRoomsNeeded) {
        throw new Error(`Only ${availableRooms.length} rooms available out of ${totalRoomsNeeded} requested`);
      }

      // Insert into booked_rooms for each assigned room
      const bookingRoomInserts = availableRooms.map(r => ({ booking_id: id, room_id: r.id }));
      const { error: brError } = await supabase.from('booked_rooms').insert(bookingRoomInserts);
      if (brError) throw brError;

      // Update booking with all room IDs and room codes
      const roomIdsList = availableRooms.map(r => String(r.id)).join(', ');
      const roomCodeSingle = availableRooms[0].room_code;
      const { error: assignError } = await supabase.from('bookings').update({
        status: 'Active',
        room_id: roomIdsList,
        room_code: roomCodeSingle,
      }).eq('id', id);
      if (assignError) throw assignError;

      // Mark all assigned rooms as Active
      const roomIds = availableRooms.map(r => r.id);
      await supabase.from('rooms').update({ status: 'Active' }).in('id', roomIds);
      return;
    }

    // If rooms were already assigned
    const { error } = await supabase.from('bookings').update({ status: 'Active' }).eq('id', id);
    if (error) throw error;

    // Update all assigned rooms to Active
    if (existingAssignments && existingAssignments.length > 0) {
      const roomIds = existingAssignments.map(a => a.room_id);
      await supabase.from('rooms').update({ status: 'Active' }).in('id', roomIds);
    } else if (booking.room_id) {
      const roomIdNums = booking.room_id.split(',').map(s => Number(s.trim())).filter(n => !isNaN(n));
      if (roomIdNums.length > 0) await supabase.from('rooms').update({ status: 'Active' }).in('id', roomIdNums);
    }
    return;
  }

  // For other statuses (Booked, Completed, Rejected)
  const { error } = await supabase.from('bookings').update({ status }).eq('id', id);
  if (error) throw error;

  // Release or update all assigned rooms
  const { data: assignments } = await supabase.from('booked_rooms').select('room_id').eq('booking_id', id);
  const { data: booking } = await supabase.from('bookings').select('room_id').eq('id', id).single();

  let roomStatus = 'Available';
  if (status === 'Booked') roomStatus = 'Booked';

  if (assignments && assignments.length > 0) {
    const roomIds = assignments.map(a => a.room_id);
    await supabase.from('rooms').update({ status: roomStatus }).in('id', roomIds);
    // If releasing rooms (completed/rejected), clean up booked_rooms
    if (status === 'Completed' || status === 'Rejected') {
      await supabase.from('booked_rooms').delete().eq('booking_id', id);
    }
  } else if (booking?.room_id) {
    const roomIdNums = booking.room_id.split(',').map(s => Number(s.trim())).filter(n => !isNaN(n));
    if (roomIdNums.length > 0) await supabase.from('rooms').update({ status: roomStatus }).in('id', roomIdNums);
  }
}

export async function getAllDbRooms() {
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .order('id', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function insertFoodOrder(bookingId: number, itemName: string, price: number): Promise<void> {
  const { error } = await supabase
    .from('food_orders')
    .insert({ booking_id: bookingId, item_name: itemName, price });
  if (error) throw error;
}


// --- Food order read operations ---

export async function getAllFoodOrders(): Promise<DbFoodOrder[]> {
  const { data, error } = await supabase
    .from('food_orders')
    .select('*')
    .order('id', { ascending: false });

  if (error) throw error;
  return (data || []).map(row => ({
    id: row.id,
    booking_id: row.booking_id || 0,
    item_name: row.item_name,
    price: row.price,
    timestamp: row.timestamp || '',
  }));
}
