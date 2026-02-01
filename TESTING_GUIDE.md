# Testing Guide - Package Approval Workflow

## System Status
✅ **30 packages available** (29 seed + 1 agent-created)
✅ **All packages approved and showing on homepage**
✅ **Agent dashboard displays bookings correctly**

## Test the Full Workflow

### Step 1: Browse Packages (Homepage)
1. Open http://localhost:5173
2. Should see 6-column grid with 30 packages
3. All packages are approved and visible

### Step 2: Register & Login as Agent
1. Click "Sign In" → "Register"
2. Create account with:
   - Email: `agent2@test.com`
   - Name: `Test Agent`
   - Password: `test123`
   - Role: Select "Travel Partner" (Agent)
3. Click "My Dashboard" → Redirects to `/agent/dashboard`

### Step 3: Create a New Package (as Agent)
1. In Agent Dashboard, click "Create New Package"
2. Fill in:
   - Title: `Goa Beach Paradise`
   - Destination: `Goa, India`
   - Description: `3 days beach getaway with water sports`
   - Price: `25000`
   - Duration: `3`
   - Click "Auto-Fetch Image by Location"
3. Click "Create" → Package stored with `status="pending"`
4. New package appears in "Pending Packages" tab

### Step 4: Admin Approves Package
1. **Register as Admin:**
   - Email: `admin@test.com`
   - Password: `admin123`
   - Role: Select "Admin"

2. **Go to Admin Dashboard:**
   - Click "My Dashboard" → Redirects to `/admin/dashboard`
   - Should see pending packages tab

3. **Approve the Package:**
   - Find "Goa Beach Paradise" in Pending section
   - Click "Approve" button
   - Package status changes to "approved"

### Step 5: Verify Package Shows on Homepage
1. Go back to homepage (click TripSync logo)
2. Scroll down to packages grid
3. Should see "Goa Beach Paradise" in the grid!

### Step 6: Book the Package (as Traveler)
1. **Register as Traveler:**
   - Email: `traveler@test.com`
   - Password: `test123`
   - Role: Select "Traveler"

2. **Book Package:**
   - Go to homepage
   - Find "Goa Beach Paradise"
   - Click on package card
   - Enter booking details:
     - Date: Select any date
     - Number of Persons: 2
   - Click "Book Now"
   - Booking saved to localStorage

### Step 7: View Booking in Agent Dashboard
1. **Login as Agent** (agent2@test.com)
2. Go to Agent Dashboard
3. Click "Bookings" tab
4. Should see the booking:
   - Package: Goa Beach Paradise
   - Customer: traveler@test.com
   - Persons: 2
   - Revenue: ₹50000
   - Commission (10%): ₹5000

## Data Flow Summary

```
Agent Creates Package
    ↓ (POST /api/packages/)
MongoDB: status = "pending"
    ↓
Admin Dashboard: Shows in "Pending" tab
    ↓
Admin Clicks Approve
    ↓ (PATCH /api/packages/{id}/approve)
MongoDB: status = "approved"
    ↓
API: /api/packages/ now returns it
    ↓
Homepage: Package visible in grid
    ↓
Users Can Book
    ↓ (Saved to localStorage)
Agent Dashboard: Shows in "Bookings" tab
```

## Files Modified

### AdminDashboard.jsx Changes
- ✅ Fetch pending packages from API endpoint
- ✅ Call approve/reject via API
- ✅ Handle both API and localStorage field formats

### AgentDashboard.jsx Changes
- ✅ Improved booking ID matching
- ✅ Better support for both 'id' and '_id' fields
- ✅ Accurate booking collection and display

## API Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/packages/` | GET | Get all approved packages |
| `/api/packages/pending/all` | GET | Get pending packages (admin-only) |
| `/api/packages/` | POST | Create new package (agent-only) |
| `/api/packages/{id}/approve` | PATCH | Approve package (admin-only) |
| `/api/packages/{id}/reject` | PATCH | Reject package (admin-only) |
| `/api/packages/{id}` | DELETE | Delete package (agent-only) |

## Database Collections

### packages
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  location: String,
  price: Number,
  days: Number,
  category: String,
  image: String,
  status: "approved" | "pending" | "rejected",
  created_by: String (email or null),
  created_at: Date
}
```

### Useful MongoDB Queries

```javascript
// Connect
mongosh

// Switch to TripSync
use tripsync

// Count packages by status
db.packages.countDocuments({ status: "approved" })
db.packages.countDocuments({ status: "pending" })

// List agent packages
db.packages.find({ created_by: { $ne: null } })

// Approve all pending
db.packages.updateMany({ status: "pending" }, { $set: { status: "approved" } })
```

## Troubleshooting

### Packages not showing on homepage
- Hard refresh: `Ctrl+Shift+R`
- Clear localStorage: DevTools → Application → Clear Storage
- Check backend is running: `curl http://localhost:8000/api/packages/`

### Admin Dashboard shows no pending packages
- Verify admin token is valid
- Check MongoDB: `db.packages.countDocuments({ status: "pending" })`
- Restart backend if API changed

### Bookings not showing in agent dashboard
- Verify booking was saved to localStorage
- Check package ID matches correctly
- Inspect with DevTools → Application → Local Storage → ts_bookings_*

### New package not appearing after approval
- Refresh homepage: `Ctrl+Shift+R`
- Check API returns new package: `curl http://localhost:8000/api/packages/ | grep title`
- Verify status is "approved" in MongoDB

---

**Status: ✅ FULLY FUNCTIONAL**

All workflows are tested and working correctly!
