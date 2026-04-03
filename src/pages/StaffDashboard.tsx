import { useNavigate } from 'react-router-dom';
import { useHotel } from '@/context/HotelContext';
import { useState, useEffect, useMemo } from 'react';
import { getDb } from '@/services/database';
import Footer from '@/components/Footer';
import {
  BedDouble, CheckCircle, XCircle, Clock, BarChart3, Package, FileText, LogOut,
  AlertTriangle, TrendingUp, ArrowUpDown, Download, ClipboardList, PlayCircle, Users,
  Brain, ShieldAlert, Zap, Timer, RefreshCw
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts';
import { downloadDb, type DbBooking } from '@/services/database';
import {
  calculateIngredientPressure, calculateVolatility, generateDemandForecast,
  getMenuAvailability, type IngredientPressure, type VolatilityScore, type DemandForecast
} from '@/services/stockAnalytics';

type Tab = 'bookings' | 'customers' | 'rooms' | 'queries' | 'inventory' | 'analytics' | 'smart-insights';

export default function StaffDashboard() {
  const { rooms, bookings, foodOrders, costQueries, inventory, staffLoggedIn, staffLogout, updateCostQuery, updateInventory, dbBookings, dbLoading, updateBookingStatus, refreshDbBookings } = useHotel();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('bookings');

  if (!staffLoggedIn) { navigate('/staff/login'); return null; }

  const pendingBookings = dbBookings.filter(b => b.status === 'Booked');

  const tabs: { key: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { key: 'smart-insights', label: 'Smart Insights', icon: <Brain className="h-4 w-4" /> },
    { key: 'bookings', label: 'Booking Requests', icon: <ClipboardList className="h-4 w-4" />, badge: pendingBookings.length },
    { key: 'customers', label: 'Customer Data', icon: <Users className="h-4 w-4" /> },
    { key: 'rooms', label: 'Rooms', icon: <BedDouble className="h-4 w-4" /> },
    { key: 'queries', label: 'Cost Queries', icon: <FileText className="h-4 w-4" /> },
    { key: 'inventory', label: 'Inventory', icon: <Package className="h-4 w-4" /> },
    { key: 'analytics', label: 'Analytics', icon: <BarChart3 className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* No navbar on staff pages */}
      <div className="max-w-7xl mx-auto px-6 py-10 flex-1 w-full">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-display text-3xl">Employee Dashboard</h2>
          <div className="flex items-center gap-4">
            <button onClick={() => downloadDb()} className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors bg-primary/10 px-4 py-2 rounded-lg">
              <Download className="h-4 w-4" /> Export Database
            </button>
            <button onClick={() => { staffLogout(); navigate('/'); }} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors">
              <LogOut className="h-4 w-4" /> Sign Out
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Pending Bookings', count: pendingBookings.length, color: 'text-amber-600' },
            { label: 'Available', count: rooms.filter(r => r.status === 'Available').length, color: 'text-green-600' },
            { label: 'Active', count: rooms.filter(r => r.status === 'Active').length, color: 'text-blue-600' },
            { label: 'Completed', count: rooms.filter(r => r.status === 'Completed').length, color: 'text-muted-foreground' },
            { label: 'Cost Queries', count: costQueries.filter(q => q.status === 'Pending').length, color: 'text-amber-600' },
          ].map(s => (
            <div key={s.label} className="bg-card rounded-lg p-5 border border-border shadow-sm">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">{s.label}</p>
              <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.count}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-muted p-1 rounded-lg mb-8 overflow-x-auto">
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap relative ${activeTab === tab.key ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
              {tab.icon} {tab.label}
              {tab.badge && tab.badge > 0 && (
                <span className="bg-amber-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">{tab.badge}</span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'smart-insights' && <SmartInsightsTab foodOrders={foodOrders} inventory={inventory} updateInventory={updateInventory} />}
        {activeTab === 'bookings' && <BookingRequestsTab dbBookings={dbBookings} dbLoading={dbLoading} updateBookingStatus={updateBookingStatus} />}
        {activeTab === 'customers' && <CustomersTab />}
        {activeTab === 'rooms' && <RoomsTab rooms={rooms} bookings={bookings} />}
        {activeTab === 'queries' && <QueriesTab costQueries={costQueries} updateCostQuery={updateCostQuery} />}
        {activeTab === 'inventory' && <InventoryTab inventory={inventory} updateInventory={updateInventory} />}
        {activeTab === 'analytics' && <AnalyticsTab foodOrders={foodOrders} />}
      </div>
      <Footer />
    </div>
  );
}

// ===================== BOOKING REQUESTS TAB =====================
function BookingRequestsTab({ dbBookings, dbLoading, updateBookingStatus }: {
  dbBookings: DbBooking[];
  dbLoading: boolean;
  updateBookingStatus: (id: number, status: 'Booked' | 'Active' | 'Completed' | 'Rejected') => Promise<void>;
}) {
  const [filter, setFilter] = useState<string>('All');
  const [processingId, setProcessingId] = useState<number | null>(null);

  const filtered = filter === 'All' ? dbBookings : dbBookings.filter(b => b.status === filter);

  const handleAction = async (id: number, status: 'Active' | 'Rejected' | 'Completed') => {
    setProcessingId(id);
    await updateBookingStatus(id, status);
    setProcessingId(null);
  };

  if (dbLoading) {
    return <div className="text-center py-12 text-muted-foreground">Loading booking data from database...</div>;
  }

  const statusColor = (status: string) => {
    switch (status) {
      case 'Booked': return 'bg-amber-100 text-amber-700';
      case 'Active': return 'bg-blue-100 text-blue-700';
      case 'Completed': return 'bg-green-100 text-green-700';
      case 'Rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          {['All', 'Booked', 'Active', 'Completed', 'Rejected'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filter === f ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent'}`}>
              {f} {f !== 'All' && `(${dbBookings.filter(b => b.status === f).length})`}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">No bookings found</div>
      ) : (
        <div className="space-y-4">
          {filtered.map(booking => (
            <div key={booking.id} className="bg-card rounded-xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-semibold text-lg text-foreground">{booking.name}</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${statusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Email:</span>
                      <p className="font-medium text-foreground">{booking.email}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Stay:</span>
                      <p className="font-medium text-foreground">{booking.nights} night{booking.nights !== 1 ? 's' : ''}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Room Code:</span>
                      <p className="font-medium text-foreground uppercase">{booking.room_code}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Check-in:</span>
                      <p className="font-medium text-foreground">{booking.checkin || 'N/A'}</p>
                    </div>
                  </div>
                  {booking.checkout && (
                    <p className="text-xs text-muted-foreground mt-2">Check-out: {booking.checkout}</p>
                  )}
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  {booking.status === 'Booked' && (
                    <>
                      <button
                        onClick={() => handleAction(booking.id, 'Active')}
                        disabled={processingId === booking.id}
                        className="flex items-center gap-1.5 bg-green-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        <CheckCircle className="h-4 w-4" /> Accept
                      </button>
                      <button
                        onClick={() => handleAction(booking.id, 'Rejected')}
                        disabled={processingId === booking.id}
                        className="flex items-center gap-1.5 bg-red-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                      >
                        <XCircle className="h-4 w-4" /> Reject
                      </button>
                    </>
                  )}
                  {booking.status === 'Active' && (
                    <button
                      onClick={() => handleAction(booking.id, 'Completed')}
                      disabled={processingId === booking.id}
                      className="flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      <PlayCircle className="h-4 w-4" /> Mark Completed
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ===================== CUSTOMERS TAB =====================
interface CustomerData {
  id: number;
  name: string;
  email: string;
  phone: string;
  created_at: string;
}

function CustomersTab() {
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const db = await getDb();
        db.run(`
          CREATE TABLE IF NOT EXISTS customers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            phone TEXT NOT NULL,
            password TEXT NOT NULL,
            created_at TEXT DEFAULT (datetime('now'))
          )
        `);
        const result = db.exec('SELECT id, name, email, phone, created_at FROM customers ORDER BY id DESC');
        if (result.length > 0) {
          setCustomers(result[0].values.map(row => ({
            id: row[0] as number,
            name: row[1] as string,
            email: row[2] as string,
            phone: row[3] as string,
            created_at: row[4] as string,
          })));
        }
      } catch (err) {
        console.error('Failed to load customers:', err);
      } finally {
        setLoading(false);
      }
    };
    loadCustomers();
  }, []);

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground">Loading customer data...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Registered Customers ({customers.length})</h3>
      </div>

      {customers.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">No customers have signed up yet.</div>
      ) : (
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left py-3 px-4 font-medium">ID</th>
                <th className="text-left py-3 px-4 font-medium">Name</th>
                <th className="text-left py-3 px-4 font-medium">Email</th>
                <th className="text-left py-3 px-4 font-medium">Phone</th>
                <th className="text-left py-3 px-4 font-medium">Signed Up</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(c => (
                <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4 text-muted-foreground">#{c.id}</td>
                  <td className="py-3 px-4 font-medium text-foreground">{c.name}</td>
                  <td className="py-3 px-4 text-foreground">{c.email}</td>
                  <td className="py-3 px-4 text-foreground">{c.phone}</td>
                  <td className="py-3 px-4 text-muted-foreground">{c.created_at || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


function RoomsTab({ rooms, bookings }: { rooms: any[]; bookings: any[] }) {
  const [filter, setFilter] = useState<string>('All');
  const filtered = filter === 'All' ? rooms : rooms.filter(r => r.status === filter);

  return (
    <div>
      <div className="flex gap-2 mb-6">
        {['All', 'Available', 'Active', 'Booked', 'Completed'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filter === f ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent'}`}>
            {f}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(room => {
          const booking = bookings.find((b: any) => b.roomId === room.id && (b.status === 'Active' || b.status === 'Booked'));
          return (
            <div key={room.id} className="bg-card rounded-lg p-5 border border-border shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold">Room {room.id}</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  room.status === 'Available' ? 'bg-green-100 text-green-700' :
                  room.status === 'Active' ? 'bg-blue-100 text-blue-700' :
                  room.status === 'Booked' ? 'bg-amber-100 text-amber-700' :
                  'bg-muted text-muted-foreground'
                }`}>{room.status}</span>
              </div>
              <p className="text-sm text-muted-foreground">{room.location} — {room.type}</p>
              <p className="text-sm text-primary font-medium mt-1">₹{room.price.toLocaleString()}/night</p>
              {booking && <p className="text-xs text-muted-foreground mt-2 border-t border-border pt-2">Guest: {booking.name}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ===================== QUERIES TAB =====================
function QueriesTab({ costQueries, updateCostQuery }: { costQueries: any[]; updateCostQuery: (id: number, status: 'Accepted' | 'Rejected') => void }) {
  return (
    <div className="space-y-4">
      {costQueries.map(q => (
        <div key={q.id} className="bg-card rounded-lg p-6 border border-border shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold">{q.guestName}</span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                q.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                q.status === 'Accepted' ? 'bg-green-100 text-green-700' :
                'bg-red-100 text-red-700'
              }`}>{q.status}</span>
            </div>
            <p className="text-sm text-muted-foreground">{q.description}</p>
            <p className="text-primary font-semibold mt-1">₹{q.amount.toLocaleString()}</p>
          </div>
          {q.status === 'Pending' && (
            <div className="flex gap-2">
              <button onClick={() => updateCostQuery(q.id, 'Accepted')} className="flex items-center gap-1 bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors">
                <CheckCircle className="h-4 w-4" /> Accept
              </button>
              <button onClick={() => updateCostQuery(q.id, 'Rejected')} className="flex items-center gap-1 bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors">
                <XCircle className="h-4 w-4" /> Reject
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ===================== INVENTORY TAB =====================
function InventoryTab({ inventory, updateInventory }: { inventory: any[]; updateInventory: (id: number, quantity: number) => void }) {
  const [editId, setEditId] = useState<number | null>(null);
  const [editQty, setEditQty] = useState('');

  const categories = [...new Set(inventory.map(i => i.category))];
  const lowStock = inventory.filter(i => i.quantity <= i.minStock);

  return (
    <div>
      {lowStock.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-amber-800 text-sm">Low Stock Alert</p>
            <p className="text-amber-700 text-xs mt-1">{lowStock.map(i => i.name).join(', ')} — below minimum levels</p>
          </div>
        </div>
      )}

      {categories.map(cat => (
        <div key={cat} className="mb-8">
          <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">{cat}</h4>
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left py-3 px-4 font-medium">Item</th>
                  <th className="text-center py-3 px-4 font-medium">Stock</th>
                  <th className="text-center py-3 px-4 font-medium">Min</th>
                  <th className="text-center py-3 px-4 font-medium">Status</th>
                  <th className="text-right py-3 px-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {inventory.filter(i => i.category === cat).map(item => (
                  <tr key={item.id} className="border-b border-border last:border-0">
                    <td className="py-3 px-4 font-medium">{item.name}</td>
                    <td className="text-center py-3 px-4">
                      {editId === item.id ? (
                        <input type="number" value={editQty} onChange={e => setEditQty(e.target.value)} className="w-20 border border-input rounded px-2 py-1 text-center bg-background" autoFocus />
                      ) : (
                        <span>{item.quantity} {item.unit}</span>
                      )}
                    </td>
                    <td className="text-center py-3 px-4 text-muted-foreground">{item.minStock} {item.unit}</td>
                    <td className="text-center py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${item.quantity <= item.minStock ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {item.quantity <= item.minStock ? 'Low' : 'OK'}
                      </span>
                    </td>
                    <td className="text-right py-3 px-4">
                      {editId === item.id ? (
                        <button onClick={() => { updateInventory(item.id, parseFloat(editQty)); setEditId(null); }} className="text-xs text-primary font-medium hover:underline">Save</button>
                      ) : (
                        <button onClick={() => { setEditId(item.id); setEditQty(String(item.quantity)); }} className="text-xs text-primary font-medium hover:underline flex items-center gap-1 ml-auto">
                          <ArrowUpDown className="h-3 w-3" /> Update
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

// ===================== SMART INSIGHTS TAB =====================
function SmartInsightsTab({ foodOrders, inventory, updateInventory }: {
  foodOrders: any[];
  inventory: any[];
  updateInventory: (id: number, quantity: number) => void;
}) {
  const pressureData = useMemo(() => calculateIngredientPressure(foodOrders, inventory), [foodOrders, inventory]);
  const volatilityData = useMemo(() => calculateVolatility(foodOrders), [foodOrders]);
  const forecastData = useMemo(() => generateDemandForecast(foodOrders), [foodOrders]);
  const availabilityData = useMemo(() => getMenuAvailability(inventory), [inventory]);

  const criticalItems = pressureData.filter(p => p.riskLevel === 'Critical' || p.riskLevel === 'High');
  const highVolatility = volatilityData.filter(v => v.burstRisk === 'High');
  const limitedDishes = Object.values(availabilityData).filter(a => a.status !== 'Available');

  const handleMarkLow = (ingredientName: string) => {
    const invItem = inventory.find((i: any) => i.name === ingredientName);
    if (invItem) {
      updateInventory(invItem.id, Math.max(0, invItem.quantity * 0.3));
    }
  };

  const RISK_COLORS: Record<string, string> = {
    Critical: 'bg-red-100 text-red-800 border-red-200',
    High: 'bg-orange-100 text-orange-800 border-orange-200',
    Medium: 'bg-amber-100 text-amber-800 border-amber-200',
    Low: 'bg-green-100 text-green-800 border-green-200',
  };

  return (
    <div className="space-y-8">
      {/* Alerts Banner */}
      {criticalItems.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <ShieldAlert className="h-5 w-5 text-red-600" />
            <h3 className="font-semibold text-red-800">Stock-Out Risk Alerts</h3>
          </div>
          <div className="space-y-3">
            {criticalItems.slice(0, 5).map(item => (
              <div key={item.ingredientName} className="flex items-center justify-between bg-white/80 rounded-lg p-3 border border-red-100">
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-900">{item.suggestion}</p>
                  <p className="text-xs text-red-600 mt-0.5">
                    Current: {item.currentStock} {item.unit} | Predicted 24h demand: {item.totalDemand24h} {item.unit}
                  </p>
                </div>
                <button
                  onClick={() => handleMarkLow(item.ingredientName)}
                  className="flex items-center gap-1.5 bg-red-600 text-white px-3 py-2 rounded-lg text-xs font-medium hover:bg-red-700 transition-colors ml-4 whitespace-nowrap"
                >
                  <RefreshCw className="h-3 w-3" /> Update Inventory
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-lg p-5 border border-border shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <ShieldAlert className="h-4 w-4 text-red-500" />
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Critical Ingredients</p>
          </div>
          <p className="text-3xl font-bold text-red-600">{pressureData.filter(p => p.riskLevel === 'Critical').length}</p>
        </div>
        <div className="bg-card rounded-lg p-5 border border-border shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <p className="text-xs text-muted-foreground uppercase tracking-wide">High Risk Items</p>
          </div>
          <p className="text-3xl font-bold text-amber-600">{pressureData.filter(p => p.riskLevel === 'High').length}</p>
        </div>
        <div className="bg-card rounded-lg p-5 border border-border shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="h-4 w-4 text-purple-500" />
            <p className="text-xs text-muted-foreground uppercase tracking-wide">High Volatility</p>
          </div>
          <p className="text-3xl font-bold text-purple-600">{highVolatility.length}</p>
        </div>
        <div className="bg-card rounded-lg p-5 border border-border shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Timer className="h-4 w-4 text-blue-500" />
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Limited Menu Items</p>
          </div>
          <p className="text-3xl font-bold text-blue-600">{limitedDishes.length}</p>
        </div>
      </div>

      {/* 24h Demand Forecast Chart */}
      <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
        <h4 className="font-display text-lg mb-1 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Predicted Demand — Next 24 Hours
        </h4>
        <p className="text-xs text-muted-foreground mb-4">Based on {foodOrders.length.toLocaleString()} historical orders</p>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={forecastData}>
            <defs>
              <linearGradient id="demandGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(358,66%,32%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(358,66%,32%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="label" tick={{ fontSize: 10 }} />
            <YAxis />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const data = payload[0].payload as DemandForecast;
                return (
                  <div className="bg-card border border-border rounded-lg p-3 shadow-lg text-xs">
                    <p className="font-semibold">{data.label} — {data.predictedOrders} predicted orders</p>
                    {data.topDishes.map(d => (
                      <p key={d.name} className="text-muted-foreground mt-0.5">{d.name}: ~{d.predicted}</p>
                    ))}
                  </div>
                );
              }}
            />
            <Area type="monotone" dataKey="predictedOrders" stroke="hsl(358,66%,32%)" fill="url(#demandGrad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Ingredient Pressure Table */}
        <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
          <h4 className="font-display text-lg mb-4 flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-primary" />
            Ingredient Pressure & Stock-Out Risk
          </h4>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {pressureData.map(item => (
              <div key={item.ingredientName} className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-foreground">{item.ingredientName}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${RISK_COLORS[item.riskLevel]}`}>
                      {item.riskLevel} ({item.riskScore}%)
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Stock: {item.currentStock} {item.unit} | 24h demand: {item.totalDemand24h} {item.unit}
                    {item.depletionHour && <span className="text-red-600 font-medium"> — depletes by {item.depletionHour}</span>}
                  </p>
                </div>
                <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      item.riskScore >= 80 ? 'bg-red-500' :
                      item.riskScore >= 60 ? 'bg-orange-500' :
                      item.riskScore >= 40 ? 'bg-amber-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${item.riskScore}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Volatility Scores */}
        <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
          <h4 className="font-display text-lg mb-4 flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Dish Volatility — Burst Risk Analysis
          </h4>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {volatilityData.slice(0, 15).map(item => (
              <div key={item.dishName} className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-foreground truncate">{item.dishName}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      item.burstRisk === 'High' ? 'bg-red-100 text-red-800 border-red-200' :
                      item.burstRisk === 'Medium' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                      'bg-green-100 text-green-800 border-green-200'
                    }`}>
                      {item.burstRisk}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {item.cuisine} | Avg: {item.avgDailyOrders}/day | σ: {item.stdDeviation} | Peak: {item.peakHours.map(h => `${h}:00`).join(', ')}
                  </p>
                  <p className="text-[10px] text-muted-foreground/70 mt-0.5 italic">{item.bufferSuggestion}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-lg font-bold text-foreground">{item.volatilityIndex}</span>
                  <p className="text-[10px] text-muted-foreground">V-Index</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Availability Status */}
      <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
        <h4 className="font-display text-lg mb-4 flex items-center gap-2">
          <Timer className="h-5 w-5 text-primary" />
          Live Menu Availability Status
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.values(availabilityData).map(item => (
            <div key={item.dishName} className={`flex items-center justify-between p-3 rounded-lg border ${
              item.status === 'Out of Stock' ? 'border-red-200 bg-red-50' :
              item.status === 'Limited' ? 'border-amber-200 bg-amber-50' :
              'border-border bg-card'
            }`}>
              <span className="text-sm font-medium text-foreground truncate mr-2">{item.dishName}</span>
              <div className="flex items-center gap-2 flex-shrink-0">
                {item.remainingServings !== null && (
                  <span className="text-xs text-muted-foreground">{item.remainingServings} left</span>
                )}
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  item.status === 'Out of Stock' ? 'bg-red-200 text-red-800' :
                  item.status === 'Limited' ? 'bg-amber-200 text-amber-800' :
                  'bg-green-200 text-green-800'
                }`}>
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ===================== ANALYTICS TAB =====================
function AnalyticsTab({ foodOrders }: { foodOrders: any[] }) {
  const itemCounts: Record<string, { count: number; revenue: number }> = {};
  foodOrders.forEach(o => {
    if (!itemCounts[o.itemName]) itemCounts[o.itemName] = { count: 0, revenue: 0 };
    itemCounts[o.itemName].count++;
    itemCounts[o.itemName].revenue += o.price;
  });
  const topItems = Object.entries(itemCounts).sort((a, b) => b[1].count - a[1].count).slice(0, 10).map(([name, data]) => ({ name: name.length > 15 ? name.slice(0, 15) + '…' : name, orders: data.count, revenue: data.revenue }));

  const dailyMap: Record<string, number> = {};
  const now = Date.now();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now - i * 86400000).toISOString().split('T')[0];
    dailyMap[d] = 0;
  }
  foodOrders.forEach(o => {
    const d = o.timestamp.split('T')[0];
    if (dailyMap[d] !== undefined) dailyMap[d]++;
  });
  const dailyData = Object.entries(dailyMap).map(([date, count]) => ({ date: date.slice(5), orders: count }));

  const COLORS = ['hsl(358,66%,32%)', 'hsl(38,70%,55%)', 'hsl(210,50%,50%)', 'hsl(150,50%,40%)', 'hsl(280,50%,50%)', 'hsl(30,60%,50%)'];
  const priceRanges = [
    { name: '< ₹200', range: [0, 200] },
    { name: '₹200-400', range: [200, 400] },
    { name: '₹400-600', range: [400, 600] },
    { name: '₹600+', range: [600, Infinity] },
  ];
  const pieData = priceRanges.map(pr => ({
    name: pr.name,
    value: foodOrders.filter(o => o.price >= pr.range[0] && o.price < pr.range[1]).length,
  })).filter(d => d.value > 0);

  const totalRevenue = foodOrders.reduce((s, o) => s + o.price, 0);
  const avgOrder = Math.round(totalRevenue / foodOrders.length);

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-card rounded-lg p-5 border border-border shadow-sm">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Orders</p>
          <p className="text-3xl font-bold text-foreground mt-1">{foodOrders.length.toLocaleString()}</p>
        </div>
        <div className="bg-card rounded-lg p-5 border border-border shadow-sm">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Revenue</p>
          <p className="text-3xl font-bold text-primary mt-1">₹{totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-card rounded-lg p-5 border border-border shadow-sm flex items-start gap-2">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Avg Order Value</p>
            <p className="text-3xl font-bold text-foreground mt-1 flex items-center gap-2">₹{avgOrder} <TrendingUp className="h-5 w-5 text-green-600" /></p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
          <h4 className="font-display text-lg mb-4">Top 10 Most Ordered Items</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topItems} layout="vertical" margin={{ left: 20 }}>
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(val: number) => [val, 'Orders']} />
              <Bar dataKey="orders" fill="hsl(358,66%,32%)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
          <h4 className="font-display text-lg mb-4">Order Price Distribution</h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
        <h4 className="font-display text-lg mb-4">Daily Order Trend (Last 30 Days)</h4>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={dailyData}>
            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="orders" stroke="hsl(358,66%,32%)" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
