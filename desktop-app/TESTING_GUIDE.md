# Testing Guide - Activity Data Sync

## Quick Start Testing

### 1. Backend Setup
Make sure your backend is running:
```bash
cd backend
npm start
# Backend should be running on http://localhost:3000
```

### 2. Desktop App Setup
Start the desktop app:
```bash
cd desktop-app
npm run dev
# Or for Electron:
npm run electron:dev
```

### 3. Login
1. Open the app
2. Login with valid employee credentials
3. Allow camera access when prompted

## Testing the 10-Minute Sync

### Option A: Wait for Automatic Sync (Full Test)
1. Use the app normally for 10 minutes
2. Perform various activities (typing, writing, etc.)
3. After 10 minutes, watch for the sync notification
4. Check backend logs for received data

### Option B: Manual Trigger (Quick Test)
1. Use the app for a few seconds
2. Click the "Send Now" button
3. You should see either:
   - ✅ Success notification: "Activity data synced successfully!"
   - ❌ Error notification with error message

### Option C: Debug Mode Testing
1. Click "Show Debug" button
2. Observe the countdown: "Next sync: Xs"
3. Watch the countdown reach 0
4. Notification should appear automatically

## Expected Data Flow

### Frontend → Backend

**Request:**
```http
POST /api/activities/ingest
Authorization: Bearer <token>
Content-Type: application/json

{
  "interval_start": "2025-12-11T10:00:00.000Z",
  "interval_end": "2025-12-11T10:10:00.000Z",
  "typing": 245,
  "writing": 40,
  "reading": 120,
  "phone": 30,
  "gesturing": 15,
  "looking_away": 50,
  "idle": 80
}
```

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Activity batch ingested and scored successfully",
  "data": {
    "rawActivity": {
      "id": 123,
      "employee_id": 456,
      "interval_start": "2025-12-11T10:00:00.000Z",
      "interval_end": "2025-12-11T10:10:00.000Z",
      ...
    },
    "calculatedScore": {
      "id": 789,
      "employee_id": 456,
      "score_date": "2025-12-11",
      "productivity_score": 85.5,
      "engagement_score": 78.2,
      "overall_score": 81.85,
      "performance_grade": "B+",
      ...
    }
  }
}
```

**Error Response (400):**
```json
{
  "status": "error",
  "message": "Invalid activity inputs: Typing count exceeds 10-minute interval",
  "statusCode": 400
}
```

**Error Response (409 - Duplicate):**
```json
{
  "status": "error",
  "message": "Activity interval already exists for this time window",
  "statusCode": 409
}
```

## Verification Checklist

### Frontend
- [ ] Console shows: "Activity tracking started - will send data every 10 minutes"
- [ ] Console shows: "Sending activity batch: {...}" every 10 minutes
- [ ] Console shows: "Activity batch sent successfully" or error message
- [ ] Success/error notification appears in UI
- [ ] Debug mode shows countdown timer
- [ ] "Send Now" button works immediately

### Backend
- [ ] Backend receives POST request to /api/activities/ingest
- [ ] Request includes valid Bearer token
- [ ] Activity data is saved to activity_intervals table
- [ ] Daily scores are calculated and saved to calculated_scores table
- [ ] Proper HTTP status codes returned (200, 400, 409, 401)

### Database
Check the database after successful sync:

```sql
-- View raw activity intervals
SELECT * FROM activity_intervals 
WHERE employee_id = <your_employee_id>
ORDER BY interval_start DESC 
LIMIT 5;

-- View calculated daily scores
SELECT * FROM calculated_scores 
WHERE employee_id = <your_employee_id>
ORDER BY score_date DESC 
LIMIT 5;
```

## Common Issues & Solutions

### Issue: "Failed to sync activity data"
**Solutions:**
1. Check if backend is running
2. Verify token is valid (check browser console)
3. Check network tab for actual error response
4. Verify VITE_API_URL is correct in .env

### Issue: 409 Conflict - Duplicate interval
**Cause:** You already sent data for this time window
**Solution:** Wait for next 10-minute interval or restart the app

### Issue: 400 Bad Request
**Causes:**
- Activity values exceed 600 seconds
- Negative values
- Invalid timestamp format
**Solution:** Check console logs for validation errors

### Issue: 401 Unauthorized
**Cause:** Token expired or invalid
**Solution:** Logout and login again

### Issue: No data being sent
**Causes:**
- Camera not initialized
- Error state active
- User not logged in
**Solution:** 
1. Check camera status indicator
2. Verify login status
3. Check console for errors

## Advanced Testing

### Test with Multiple Activities
```javascript
// In browser console (after opening debug):
const stats = getCurrentStats();
console.log('Current accumulated times:', stats);
```

### Test Error Handling
1. Stop backend server
2. Click "Send Now"
3. Should see error notification
4. Restart backend
5. Data should sync on next attempt

### Test Authentication
1. Login
2. Wait for data to start accumulating
3. In another tab, logout from backend
4. Wait for 10-minute sync
5. Should redirect to login page (401 handling)

## Monitoring

### Backend Logs
Watch for these messages:
```
POST /api/activities/ingest 200
Activity batch ingested for employee: 456
Daily score updated for 2025-12-11
```

### Frontend Console
Watch for these messages:
```
Activity tracking started - will send data every 10 minutes
Sending activity batch: {...}
Activity batch sent successfully
```

### Network Tab
1. Open DevTools → Network
2. Filter by "ingest"
3. Watch for POST requests every 10 minutes
4. Check request payload and response

## Performance Testing

### Load Test
Run multiple desktop app instances:
```bash
# Terminal 1
npm run dev

# Terminal 2
npm run dev -- --port 5174

# Terminal 3  
npm run dev -- --port 5175
```

All should sync independently without conflicts.

### Long-Running Test
1. Start app in morning
2. Use normally throughout day
3. Check at end of day:
   - All 10-minute intervals recorded
   - No missing data
   - Daily scores calculated correctly
