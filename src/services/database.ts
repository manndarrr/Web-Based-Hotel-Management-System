import initSqlJs, { Database } from 'sql.js';

let db: Database | null = null;
let dbReady: Promise<Database> | null = null;

export async function getDb(): Promise<Database> {
  if (db) return db;
  if (dbReady) return dbReady;

  dbReady = (async () => {
    const SQL = await initSqlJs({
      locateFile: (file: string) => `https://sql.js.org/dist/${file}`,
    });

    // Try to load existing db from localStorage
    const saved = localStorage.getItem('hotel_db');
    if (saved) {
      const arr = Uint8Array.from(atob(saved), c => c.charCodeAt(0));
      db = new SQL.Database(arr);
    } else {
      // Load the seed database from public folder
      try {
        const response = await fetch('/hotel.db');
        const buffer = await response.arrayBuffer();
        db = new SQL.Database(new Uint8Array(buffer));
      } catch {
        db = new SQL.Database();
      }
      // Ensure tables exist with correct schema
      db.run(`
        CREATE TABLE IF NOT EXISTS rooms (
          id INTEGER PRIMARY KEY,
          location TEXT,
          type TEXT,
          room_code TEXT,
          price INTEGER,
          image TEXT,
          status TEXT DEFAULT 'Available'
        )
      `);
      db.run(`
        CREATE TABLE IF NOT EXISTS bookings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          nights INTEGER NOT NULL,
          room_id INTEGER,
          room_code TEXT,
          status TEXT DEFAULT 'Booked',
          checkin TEXT,
          checkout TEXT,
          created_at TEXT DEFAULT (datetime('now'))
        )
      `);
      db.run(`
        CREATE TABLE IF NOT EXISTS food_orders (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          booking_id INTEGER,
          item_name TEXT,
          price INTEGER,
          timestamp TEXT DEFAULT (datetime('now'))
        )
      `);
      // Add checkin/checkout columns if missing (from seed db)
      try { db.run('ALTER TABLE bookings ADD COLUMN checkin TEXT'); } catch {}
      try { db.run('ALTER TABLE bookings ADD COLUMN checkout TEXT'); } catch {}
      try { db.run('ALTER TABLE bookings ADD COLUMN created_at TEXT DEFAULT (datetime("now"))'); } catch {}
    }
    saveDb();
    return db!;
  })();

  return dbReady;
}

export function saveDb() {
  if (!db) return;
  const data = db.export();
  const base64 = btoa(String.fromCharCode(...data));
  localStorage.setItem('hotel_db', base64);
}

export function exportDbFile(): Blob {
  if (!db) throw new Error('Database not initialized');
  const data = db.export();
  return new Blob([data], { type: 'application/x-sqlite3' });
}

export function downloadDb(filename = 'hotel.db') {
  const blob = exportDbFile();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// --- Booking operations ---

export interface DbBooking {
  id: number;
  name: string;
  email: string;
  nights: number;
  room_id: number;
  room_code: string;
  status: string;
  checkin: string;
  checkout: string;
  created_at: string;
}

export async function insertBooking(
  name: string, email: string, nights: number, roomId: number,
  roomCode: string, checkin: string, checkout: string
): Promise<number> {
  const database = await getDb();
  database.run(
    `INSERT INTO bookings (name, email, nights, room_id, room_code, status, checkin, checkout, created_at)
     VALUES (?, ?, ?, ?, ?, 'Booked', ?, ?, datetime('now'))`,
    [name, email, nights, roomId, roomCode, checkin, checkout]
  );
  const result = database.exec('SELECT last_insert_rowid()');
  const id = result[0]?.values[0]?.[0] as number;

  // Update room status to Booked
  database.run('UPDATE rooms SET status = ? WHERE id = ?', ['Booked', roomId]);
  saveDb();
  return id;
}

export async function getAllBookings(): Promise<DbBooking[]> {
  const database = await getDb();
  const result = database.exec(
    'SELECT id, name, email, nights, room_id, room_code, status, checkin, checkout, created_at FROM bookings ORDER BY id DESC'
  );
  if (!result[0]) return [];
  return result[0].values.map(row => ({
    id: row[0] as number,
    name: row[1] as string,
    email: row[2] as string,
    nights: row[3] as number,
    room_id: row[4] as number,
    room_code: row[5] as string,
    status: row[6] as string,
    checkin: row[7] as string || '',
    checkout: row[8] as string || '',
    created_at: row[9] as string || '',
  }));
}

export async function updateBookingStatus(id: number, status: 'Booked' | 'Active' | 'Completed' | 'Rejected'): Promise<void> {
  const database = await getDb();
  database.run('UPDATE bookings SET status = ? WHERE id = ?', [status, id]);

  // Also update the room status
  const booking = database.exec('SELECT room_id FROM bookings WHERE id = ?', [id]);
  if (booking[0]?.values[0]) {
    const roomId = booking[0].values[0][0] as number;
    if (status === 'Active') {
      database.run('UPDATE rooms SET status = ? WHERE id = ?', ['Active', roomId]);
    } else if (status === 'Completed') {
      database.run('UPDATE rooms SET status = ? WHERE id = ?', ['Completed', roomId]);
    } else if (status === 'Rejected') {
      database.run('UPDATE rooms SET status = ? WHERE id = ?', ['Available', roomId]);
    }
  }
  saveDb();
}

export async function insertFoodOrder(bookingId: number, itemName: string, price: number): Promise<void> {
  const database = await getDb();
  database.run(
    'INSERT INTO food_orders (booking_id, item_name, price) VALUES (?, ?, ?)',
    [bookingId, itemName, price]
  );
  saveDb();
}
