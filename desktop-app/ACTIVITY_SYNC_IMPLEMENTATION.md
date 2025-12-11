# Activity Tracking - 10 Minute Backend Sync

## Overview
The desktop app now automatically sends activity data to the backend every 10 minutes via the `/api/activities/ingest` endpoint.

## Implementation Details

### Files Modified/Created

#### 1. **New Hook: `useActivityTracking.js`**
Location: `desktop-app/src/hooks/useActivityTracking.js`

This hook manages activity tracking and automatic data submission:
- Tracks time spent in each activity (typing, writing, reading, phone, gesturing, looking away, idle)
- Automatically sends accumulated data every 10 minutes
- Converts activity durations from milliseconds to seconds for the API
- Handles success/error callbacks for UI notifications

**Key Features:**
- Activity time accumulation in real-time
- Automatic 10-minute interval timer
- Manual "Send Now" function for immediate submission
- Proper cleanup on unmount

#### 2. **Updated: `api.js`**
Location: `desktop-app/src/services/api.js`

Added new `activityAPI` object with methods:
- `ingestActivityBatch(data)` - Send 10-minute activity batch
- `getMyCalculatedScores()` - Get calculated performance scores
- `getMyDailyScores()` - Get daily aggregated scores
- `getMyPerformanceTrends()` - Get performance trends
- `getMyLatestActivity()` - Get latest activity data

#### 3. **Updated: `CameraMonitor.jsx`**
Location: `desktop-app/src/components/CameraMonitor.jsx`

Enhanced with:
- Integration of `useActivityTracking` hook
- Success/error notification system
- "Send Now" manual trigger button
- Debug info showing next sync time
- Visual feedback when data is synced

## Data Format

The activity data sent to the backend follows this structure:

```javascript
{
  interval_start: "2025-12-11T10:00:00.000Z",  // ISO 8601 timestamp
  interval_end: "2025-12-11T10:10:00.000Z",    // ISO 8601 timestamp
  typing: 245,        // seconds
  writing: 40,        // seconds
  reading: 120,       // seconds
  phone: 30,          // seconds
  gesturing: 15,      // seconds
  looking_away: 50,   // seconds
  idle: 80            // seconds
}
```

## Activity Mapping

The app maps UI activity names to backend field names:

| UI Activity    | Backend Field  | Description                    |
|---------------|----------------|--------------------------------|
| Typing        | typing         | Keyboard activity detected     |
| Writing       | writing        | Hand writing motion detected   |
| Reading       | reading        | Sitting and focused on screen  |
| Phone         | phone          | Phone to ear detected          |
| Gesturing     | gesturing      | Hand gestures detected         |
| Looking Away  | looking_away   | Gaze away from screen          |
| Sitting       | idle           | Default sitting position       |

## User Interface

### New Features:

1. **Send Now Button**: Manual trigger to send data immediately (useful for testing)

2. **Sync Notifications**: 
   - ✅ Green success notification when data syncs successfully
   - ❌ Red error notification if sync fails
   - Auto-dismisses after 3-5 seconds

3. **Debug Info**: 
   - Shows "Next sync: Xs" countdown
   - Displays "Data sent every 10 minutes" message

## Backend Endpoint

**Endpoint**: `POST /api/activities/ingest`

**Authentication**: Required (Bearer token)

**Expected Response**:
- `200 OK` - Activity data accepted and processed
- `400 Bad Request` - Invalid data format
- `409 Conflict` - Duplicate interval (already exists)
- `401 Unauthorized` - Invalid/missing token

## Testing

### Manual Testing:
1. Start the desktop app and log in
2. Allow camera access
3. Perform various activities (typing, writing, etc.)
4. Click "Send Now" to immediately test the sync
5. Check browser console for sync logs
6. Verify success/error notifications appear

### Automatic Testing:
1. Let the app run for 10+ minutes
2. Observe automatic sync notifications
3. Check backend logs for received data
4. Verify data in database

## Error Handling

The implementation includes comprehensive error handling:
- Network failures are caught and displayed to user
- Duplicate interval prevention (409 status)
- Invalid token handling (401 redirect to login)
- Validation errors shown in notifications
- Console logging for debugging

## Performance Considerations

- **Minimal Overhead**: Activity tracking uses simple state updates
- **Non-blocking**: Data submission happens asynchronously
- **Cleanup**: Proper cleanup on component unmount
- **Prevents Duplicates**: Won't send if already submitting
- **Graceful Degradation**: App continues working if sync fails

## Future Enhancements

Potential improvements:
- Offline queue for failed submissions
- Retry logic with exponential backoff
- Progress indicator during submission
- Detailed sync history view
- Configurable sync interval
- Background sync when app is minimized
