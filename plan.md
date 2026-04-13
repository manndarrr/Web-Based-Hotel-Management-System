## Plan: Destination-Specific Employee Dashboards

### Summary

Each of the 5 hotel destinations gets its own employee login password. When a staff member logs in, they only see bookings, food orders, cost queries, rooms, and customer data for their assigned destination.

### Destination-Password Mapping


| Destination         | Location Key | Password      |
| ------------------- | ------------ | ------------- |
| Srinagar, Kashmir   | Srinagar     | shriemp190001 |
| Candolim, Goa       | Goa          | canemp403515  |
| Jaipur, Rajasthan   | Jaipur       | jaiemp302001  |
| Alleppey, Kerala    | Kerala       | allemp688001  |
| Agra, Uttar Pradesh | Agra         | agremp282001  |


Remove the master password `admin123` and also the demo password suggestion..

### Steps

**1. Fix build errors** -- Replace any remaining `'booking_rooms'` references with `'booked_rooms'` in FoodMenu.tsx, Profile.tsx, StaffDashboard.tsx (if the build cache is stale, trigger a rebuild).

**2. Update HotelContext** (`src/context/HotelContext.tsx`)

- Change `staffLoggedIn: boolean` to `staffLoggedIn: boolean; staffDestination: string | null`
- Update `staffLogin` to check against all 5 passwords, returning the matched destination (or `'all'` for admin)
- Store `staffDestination` in state
- Expose `staffDestination` via context

**3. Update StaffLogin** (`src/pages/StaffLogin.tsx`)

- Remove the demo password hint or update it
- Show destination name on successful login redirect

**4. Update StaffDashboard** (`src/pages/StaffDashboard.tsx`)

- Read `staffDestination` from context
- Filter `dbBookings` by `location` matching the staff destination (skip filter if `'all'`)
- Filter food orders by matching booking IDs (bookings at that destination)
- Filter cost queries by matching booking IDs
- Filter rooms by `location`
- Filter customer data (derived from bookings) by destination
- Filter analytics data by destination
- Show the destination name in the dashboard header

**5. No database changes needed** -- The `bookings` table already has a `location` column, and food_orders/cost_queries link to bookings via `booking_id`. Rooms have a `location` column. All filtering is done client-side.

### Technical Details

- The location keys in the DB (`Srinagar`, `Goa`, `Jaipur`, `Kerala`, `Agra`) match the destination slugs used in `destinations.ts`
- Food orders and cost queries will be filtered by first collecting booking IDs for the destination, then filtering orders/queries by those IDs
- Inventory is local state (not DB-backed), so it will remain shared across all dashboards