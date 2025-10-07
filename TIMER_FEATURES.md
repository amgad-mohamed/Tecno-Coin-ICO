# Timer Management and ICO Pause Features

## Overview
This document describes the new features added to the Nefe Presale Token Next.js App:

1. **ICO Contract Pause Status Management**
2. **MongoDB Timer Management System**

## 1. ICO Contract Pause Status Management

### Features
- **Real-time Status Display**: Shows current ICO pause status (Active/Paused)
- **Admin Control**: Admins can pause/resume the ICO contract
- **Visual Indicators**: Clear color-coded status with action buttons
- **Smart Contract Integration**: Directly interacts with the ICO contract's pause function

### Implementation
- Added `useGetPauseStatus` hook to read contract pause state
- Added pause/resume functionality with `pause` contract function
- Integrated into ICO Management tab in admin dashboard
- Real-time status updates with visual feedback

### Usage
1. Navigate to Admin Dashboard → ICO tab
2. View current ICO status (Active/Paused)
3. Click "Pause ICO" to pause or "Resume ICO" to resume
4. Status updates immediately after transaction confirmation

## 2. MongoDB Timer Management System

### Features
- **CRUD Operations**: Create, Read, Update, Delete timers
- **Timer Types**: ICO, Staking, and General timers
- **Status Management**: Active/Inactive timer states
- **Date Range Support**: Start and end time configuration
- **Metadata Support**: Additional custom data storage
- **Real-time Updates**: Immediate UI updates after operations

### Database Schema
```typescript
interface Timer {
  _id: string;
  name: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  isActive: boolean;
  type: "ICO" | "STAKING" | "GENERAL";
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}
```

### API Endpoints
- `GET /api/timers` - Fetch timers with optional filters
- `POST /api/timers` - Create new timer
- `PUT /api/timers` - Update existing timer
- `DELETE /api/timers` - Delete timer

### Timer Management Component
- **Form Validation**: Ensures start time < end time
- **Type Selection**: Dropdown for timer categories
- **Status Toggle**: Activate/deactivate timers
- **Edit Mode**: In-place editing of existing timers
- **Delete Confirmation**: Prevents accidental deletions
- **Real-time Status**: Shows timer status (Active, Inactive, Expired, Upcoming)

### Usage
1. Navigate to Admin Dashboard → Timers tab
2. Click "Add Timer" to create new timer
3. Fill in timer details (name, type, start/end times, description)
4. Use action buttons to edit, delete, or toggle timer status
5. View all timers with their current status

## Technical Implementation

### Files Added/Modified
- `models/Timer.ts` - MongoDB Timer model
- `app/api/timers/route.ts` - Timer API endpoints
- `app/hooks/useTimers.ts` - Timer management hook
- `app/components/TimerManagement.tsx` - Timer management UI
- `app/services/useICOContract.ts` - Added pause status functionality
- `app/admin/page.tsx` - Integrated both features into admin dashboard

### Dependencies
- MongoDB with Mongoose
- React hooks for state management
- Framer Motion for animations
- React Icons for UI elements

### Security Features
- Admin-only access to timer management
- Input validation and sanitization
- Confirmation dialogs for destructive actions
- Error handling and user feedback

## Future Enhancements
- Timer notifications and alerts
- Bulk timer operations
- Timer templates and presets
- Integration with external calendar systems
- Advanced scheduling (recurring timers)
- Timer analytics and reporting

## Testing
- Test timer creation with various date ranges
- Verify pause/resume functionality with ICO contract
- Test timer status updates and deletions
- Validate form inputs and error handling
- Test admin access restrictions