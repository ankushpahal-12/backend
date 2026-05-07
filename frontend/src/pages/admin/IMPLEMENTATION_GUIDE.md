# Real-Time User Management System - Implementation Guide

## Overview

This document explains the complete real-time user management system with live event tracking, notifications, and API integration for the admin panel.

## Architecture

### Backend (Node.js/Express)

#### New Endpoints Added

1. **POST `/api/admin/users`** - Create new user
2. **PATCH `/api/admin/users/:id/role`** - Update user role
3. **PATCH `/api/admin/users/:id/block`** - Block user
4. **PATCH `/api/admin/users/:id/unblock`** - Unblock user
5. **Existing** - All other endpoints maintained

#### Database Schema Updates

New fields added to User model:
- `isBlocked` (Boolean) - User block status
- `blockedReason` (String) - Reason for blocking
- `blockedAt` (Date) - When user was blocked

### Frontend Architecture

#### Component Hierarchy

```
UsersPageWithRealtime
├── Header with Search & Filters
├── Stats Cards (Total, Active, Inactive, Blocked)
├── Loader (Real-time event display)
├── ToastContainer (Notifications)
├── UserTable
│   └── UserActions
├── EventLogViewer (Real-time event tracking)
└── Modals
    ├── AddUserModal (API integrated)
    ├── DeleteUserModal (API integrated)
    ├── ResetPasswordModal (API integrated)
    ├── ChangeRoleModal (API integrated)
    ├── BanUserModal (API integrated)
    ├── UnblockUserModal (API integrated)
    ├── ForceLogoutModal (API integrated)
    └── EditUserModal
```

## Hooks Usage

### useUserManagement Hook

Manages all user operations with real-time event tracking.

```typescript
import { useUserManagement } from '../hooks';

const MyComponent = () => {
  const {
    loading,           // Loading state
    error,            // Error message
    eventLog,         // Array of all events
    createUser,       // Function: (data) => Promise<void>
    deleteUser,       // Function: (userId) => Promise<void>
    updateUserRole,   // Function: (userId, role) => Promise<void>
    blockUser,        // Function: (userId, reason?) => Promise<void>
    unblockUser,      // Function: (userId) => Promise<void>
    resetPassword,    // Function: (userId, password) => Promise<void>
    terminateSession, // Function: (userId, sessionId) => Promise<void>
    clearEventLog,    // Function: () => void
    getLatestEvent,   // Function: () => UserEventLog | null
  } = useUserManagement(
    (event) => {
      // Optional callback for real-time event updates
      console.log('Event:', event);
    }
  );

  const handleCreateUser = async () => {
    try {
      await createUser({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password@123',
        role: 'user'
      });
      // Success notification handled automatically
    } catch (err) {
      // Error handled, display toast
    }
  };
};
```

### useToast Hook

Manages toast notifications system-wide.

```typescript
import { useToast } from '../hooks';

const MyComponent = () => {
  const {
    toasts,        // Array of all toasts
    addToast,      // Custom toast
    removeToast,   // Remove by ID
    clearAll,      // Clear all toasts
    success,       // Success toast
    error,         // Error toast
    info,          // Info toast
    processing,    // Processing toast (no auto-close)
  } = useToast();

  // Usage examples
  const handleAction = async () => {
    const processingId = processing('Creating user...', 'Processing');
    
    try {
      await api.createUser(data);
      success('User created successfully!', 'Success');
      removeToast(processingId);
    } catch (err) {
      error(err.message, 'Error');
    }
  };
};
```

## Component Usage

### Loader Component

Displays with real-time event messages during operations.

```typescript
import { Loader } from '../components/ui';

<Loader 
  isVisible={loading}
  message={eventLog[0]?.message || 'Processing...'}
/>
```

**Features:**
- Fixed position overlay
- Semi-transparent backdrop with blur
- Animated entrance/exit
- Custom CSS-based spinner loader
- Real-time message updates

### Toast/Notification System

```typescript
import { ToastContainer } from '../components/ui';

<ToastContainer
  toasts={toasts}
  onRemove={removeToast}
  position="top-right"  // 'top-right' | 'bottom-right' | 'top-center'
/>
```

**Toast Types:**
- `success` - Green, 3s duration
- `error` - Red, 5s duration
- `info` - Blue, 4s duration
- `processing` - Blue, no auto-close

### EventLogViewer Component

Real-time display of all operations.

```typescript
import { EventLogViewer } from '../components/ui';

<EventLogViewer
  events={eventLog}
  onClear={clearEventLog}
  maxHeight="400px"
  compact  // Collapsible version
/>
```

**Features:**
- Real-time event display
- Color-coded event types
- Timestamps for each event
- Error messages with details
- Collapsible compact mode
- Clear all button

## API Service Layer

### File: `frontend/src/pages/admin/services/adminApi.ts`

All API calls are centralized here with proper error handling.

```typescript
import * as adminApi from '../services/adminApi';

// Get all users
const users = await adminApi.getAllUsers(page, limit);

// Get single user
const user = await adminApi.getUser(userId);

// Create user
const newUser = await adminApi.createUser({
  name: 'John',
  email: 'john@example.com',
  password: 'Pass@123',
  role: 'user'
});

// Update role
await adminApi.updateUserRole(userId, 'admin');

// Block user
await adminApi.blockUser(userId, 'Reason for blocking');

// Unblock user
await adminApi.unblockUser(userId);

// Reset password
await adminApi.resetUserPassword(userId, 'NewPass@123');

// Terminate session
await adminApi.terminateSession(userId, sessionId);

// Delete user
await adminApi.deleteUser(userId);

// Get stats
const stats = await adminApi.getSystemStats();
```

## Modal Integration Example

Each modal now integrates with the API and shows loading states.

### AddUserModal

```typescript
<AddUserModal
  open={addUserOpen}
  onClose={() => setAddUserOpen(false)}
  onUserCreated={() => {
    // Refresh users list
    refreshUsersList();
  }}
/>
```

**Features:**
- Form validation
- Real-time error display
- Loading state with spinner
- Toast notifications on success/error
- Auto-closes on success

### DeleteUserModal

```typescript
<DeleteUserModal
  open={deleteOpen}
  user={selectedUser}
  onClose={() => setDeleteOpen(false)}
  onUserDeleted={() => {
    // Refresh users list
    refreshUsersList();
  }}
/>
```

**Features:**
- Safety confirmations
- Detailed warning about permanent deletion
- Real-time API call with loading
- Success notification

## Event Tracking System

### Event Types

```typescript
type UserEvent = 
  | 'creating_user'
  | 'user_created'
  | 'deleting_user'
  | 'user_deleted'
  | 'updating_role'
  | 'role_updated'
  | 'blocking_user'
  | 'user_blocked'
  | 'unblocking_user'
  | 'user_unblocked'
  | 'resetting_password'
  | 'password_reset'
  | 'terminating_session'
  | 'session_terminated'
  | 'fetching_users'
  | 'users_fetched'
  | 'error';
```

### Event Log Structure

```typescript
interface UserEventLog {
  type: UserEvent;
  message: string;
  timestamp: Date;
  userId?: string;
  error?: Error;
}
```

### Event Flow

1. User initiates action (e.g., create user)
2. Hook emits "creating_user" event
3. Loader shows with event message
4. API call in progress
5. Hook emits "user_created" event on success
6. Toast notification displayed
7. EventLogViewer updated with event
8. UI refreshes if callback provided

## File Structure

```
frontend/src/pages/admin/
├── hooks/
│   ├── index.ts
│   ├── useUserManagement.ts    (User operations with events)
│   └── useToast.ts             (Toast notifications)
├── components/
│   ├── ui/
│   │   ├── index.ts
│   │   ├── Loader.tsx          (Real-time loader)
│   │   ├── Loader.css          (Loader styles)
│   │   ├── Toast.tsx           (Toast system)
│   │   └── EventLogViewer.tsx  (Event tracking display)
│   └── users/
│       ├── AddUserModal.tsx
│       ├── DeleteUserModal.tsx
│       ├── ChangeRoleModal.tsx
│       ├── BanUserModal.tsx
│       ├── UnblockUserModal.tsx
│       ├── ResetPasswordModal.tsx
│       ├── ForceLogoutModal.tsx
│       └── UserTable.tsx
├── services/
│   └── adminApi.ts             (API integration)
└── pages/
    └── UsersPageWithRealtime.tsx (Complete example)
```

## Backend File Structure

```
backend/
├── controllers/
│   └── adminController.js      (New endpoints added)
├── routes/
│   └── adminRoutes.js          (Updated routes)
├── models/
│   └── User.js                 (New fields: isBlocked, blockedReason, blockedAt)
```

## Usage Example - Complete Flow

```typescript
import { useState, useCallback } from 'react';
import { useUserManagement, useToast } from '../hooks';
import { Loader, ToastContainer, EventLogViewer } from '../components/ui';
import AddUserModal from '../components/users/AddUserModal';

const UsersManagement = () => {
  const [addUserOpen, setAddUserOpen] = useState(false);
  
  // Hook for user operations
  const { loading, eventLog, clearEventLog } = useUserManagement(
    useCallback((event) => {
      console.log('User action:', event.type, event.message);
    }, [])
  );
  
  // Hook for notifications
  const { toasts, removeToast } = useToast();

  return (
    <>
      {/* Show loader with current event */}
      <Loader
        isVisible={loading}
        message={eventLog[0]?.message || 'Processing...'}
      />
      
      {/* Toast notifications */}
      <ToastContainer
        toasts={toasts}
        onRemove={removeToast}
        position="top-right"
      />
      
      {/* Event tracking */}
      <EventLogViewer
        events={eventLog}
        onClear={clearEventLog}
        compact
      />
      
      {/* UI with modals */}
      <AddUserModal
        open={addUserOpen}
        onClose={() => setAddUserOpen(false)}
        onUserCreated={() => {
          // Refresh data
        }}
      />
    </>
  );
};
```

## Error Handling

All errors are automatically:
1. Caught by the hook
2. Logged to `eventLog` with type 'error'
3. Displayed as error toast
4. Shown in EventLogViewer

```typescript
const { error, eventLog } = useUserManagement();

// Error is in eventLog
const lastError = eventLog.find(e => e.type === 'error');
console.error(lastError?.message, lastError?.error);
```

## Performance Considerations

1. **Debounced Search** - Implement search debounce to reduce API calls
2. **Pagination** - Events are paginated in EventLogViewer
3. **Lazy Loading** - EventLogViewer uses virtual scrolling
4. **Memoization** - Used in all components to prevent re-renders

## Future Enhancements

1. WebSocket real-time updates
2. Batch operations
3. Advanced filtering
4. Export users to CSV
5. User activity audit log
6. Role-based permissions editor
7. Scheduled tasks
8. Email notifications

## Troubleshooting

### Loader not appearing
- Check `loading` prop is being passed
- Verify hook is properly initialized
- Check z-index conflicts

### Toasts not appearing
- Ensure `ToastContainer` is rendered
- Check `toasts` array is being updated
- Verify `onRemove` callback is working

### Events not tracking
- Verify hook callback is provided
- Check eventLog array updates
- Ensure operations complete successfully

### API calls failing
- Check backend is running on correct port
- Verify authentication token is included
- Check CORS settings
- Review network tab in DevTools

## Support

For issues or questions, refer to the backend routes and controller implementations.
