# Local Storage Data Guide

## Where Data is Stored

Your User Portfolio app stores data in the browser's **LocalStorage** in two places:

### 1. **REGISTERED_USERS** - For Login
- **Key**: `REGISTERED_USERS`
- **Location**: Browser's LocalStorage
- **Data**: User credentials indexed by email
- **Example**:
```json
{
  "user1@email.com": {
    "username": "john",
    "email": "user1@email.com",
    "password": "mypassword123",
    "name": "",
    "role": "",
    "about": "",
    "skills": [],
    "projects": [],
    "contact": {
      "email": "user1@email.com",
      "github": ""
    }
  }
}
```

### 2. **PORTFOLIO_DATA** - For Profile Display
- **Key**: `PORTFOLIO_DATA`
- **Location**: Browser's LocalStorage
- **Data**: User portfolio indexed by username
- **Same structure as REGISTERED_USERS**

### 3. **authToken** - For Session Management
- **Key**: `authToken`
- **Location**: Browser's LocalStorage
- **Data**: User session token

### 4. **currentUser** - Current Logged In User
- **Key**: `currentUser`
- **Location**: Browser's LocalStorage
- **Data**: Username of currently logged in user

---

## How to View Your Data

### Option 1: Browser Developer Tools
1. Open your browser (Chrome, Firefox, Edge)
2. Press **F12** to open Developer Tools
3. Go to **Application** tab (or **Storage** tab)
4. Click **Local Storage** → **http://localhost:4200**
5. You'll see all 4 keys with their data

### Option 2: Check in Console
Open browser console and paste:
```javascript
console.log(JSON.parse(localStorage.getItem('REGISTERED_USERS')));
console.log(JSON.parse(localStorage.getItem('PORTFOLIO_DATA')));
console.log(JSON.parse(localStorage.getItem('authToken')));
console.log(localStorage.getItem('currentUser'));
```

---

## How to Clear Data (Reset Everything)

### Option 1: Clear from Browser DevTools
1. Open Developer Tools (F12)
2. Go to **Application** → **Local Storage**
3. Right-click on **http://localhost:4200**
4. Select **Clear**

### Option 2: Clear from Console
```javascript
localStorage.clear();
```

### Option 3: Clear Specific Keys
```javascript
// Clear one key at a time
localStorage.removeItem('REGISTERED_USERS');
localStorage.removeItem('PORTFOLIO_DATA');
localStorage.removeItem('authToken');
localStorage.removeItem('currentUser');
```

---

## "Already Exists" Error Fix

If you get **"Username or Email already exists"** message:

### This means:
- You already registered with that email
- OR you already have that username

### Solutions:

**Option A: Use Different Email/Username**
- Register with a new email address (e.g., user2@email.com)
- Use a different username

**Option B: Clear All Data and Start Fresh**
```javascript
// In browser console:
localStorage.clear();
// Then refresh page and try again
```

**Option C: Clear Only Registration Data**
```javascript
// Keep other data but reset registrations:
localStorage.removeItem('REGISTERED_USERS');
localStorage.removeItem('PORTFOLIO_DATA');
```

---

## Testing Flow

1. **First Registration**: Register with email1@email.com, username1
   - ✅ Success
   
2. **Try Same Email Again**: Register with email1@email.com, username2
   - ❌ "Already exists" (email is already used)
   
3. **Different Email**: Register with email2@email.com, username1
   - ❌ "Already exists" (username is already used)
   
4. **Clear Data**: `localStorage.clear()`
   - ✅ All data deleted
   
5. **Register Again**: Register with email1@email.com, username1
   - ✅ Success (data was cleared)

---

## Important Notes

⚠️ **Data is NOT synced across devices** - Each device has its own localStorage
⚠️ **Data is per browser** - Chrome, Firefox, Safari each have separate storage
⚠️ **Data persists after closing browser** - It stays until you clear it
⚠️ **Not a server database** - This is local browser storage only
