# Budget CAR Frontend

React 18 + Vite frontend application for the Budget CAR student budgeting platform.

## 🏗️ Architecture

### Tech Stack
- **Framework**: React 18.3
- **Build Tool**: Vite 5.4
- **Routing**: React Router DOM 6.30
- **Styling**: Custom CSS with CSS Variables
- **Testing**: Vitest + Testing Library
- **State Management**: React Context API

### Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ExpenseForm.jsx  # Form for add/edit expenses
│   │   ├── ExpenseList.jsx  # Paginated expense table
│   │   ├── Modal.jsx        # Reusable modal dialog
│   │   ├── Spinner.jsx      # Loading spinner
│   │   ├── Header.jsx       # App header
│   │   ├── Footer.jsx       # App footer
│   │   └── Layout.jsx       # Page layout wrapper
│   │
│   ├── pages/              # Page components
│   │   ├── Landing.jsx      # Homepage
│   │   ├── Login.jsx        # Login page
│   │   ├── Register.jsx     # Registration page
│   │   ├── Dashboard.jsx    # User dashboard
│   │   ├── TrackExpense.jsx # Expense management
│   │   ├── TrackIncome.jsx  # Income management
│   │   └── Profile.jsx      # User profile
│   │
│   ├── context/            # React contexts
│   │   ├── AuthContext.jsx  # Authentication state
│   │   └── ToastContext.jsx # Toast notifications
│   │
│   ├── services/           # API service layer
│   │   ├── transactionService.js  # Transaction CRUD
│   │   └── categoryService.js     # Category operations
│   │
│   ├── utils/              # Utility functions
│   │   ├── api.js          # API request wrapper
│   │   ├── date.js         # Date formatting
│   │   └── currency.js     # Currency conversion
│   │
│   ├── config/             # Configuration
│   │   └── api.js          # API endpoints
│   │
│   ├── styles/             # CSS files
│   │   ├── common.css      # Base styles & variables
│   │   ├── expenseForm.css
│   │   ├── expenseList.css
│   │   ├── modal.css
│   │   ├── toast.css
│   │   └── spinner.css
│   │
│   ├── App.jsx             # Root component with routing
│   └── main.jsx            # Entry point
│
├── tests/                  # Test files
│   ├── setup.js           # Test configuration
│   ├── date.test.js       # Date utilities tests
│   ├── currency.test.js   # Currency utilities tests
│   └── api.test.js        # API utilities tests
│
├── public/                # Static assets
├── .env.example          # Environment template
├── package.json          # Dependencies
├── vite.config.js        # Vite configuration
├── vitest.config.js      # Test configuration
└── README.md             # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
```

### Development

```bash
# Start development server
npm run dev
# → http://localhost:5173

# Run tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🎨 Design System

### CSS Variables

All colors and design tokens are defined in `src/styles/common.css`:

```css
:root {
  /* Colors */
  --primary: #3b82f6;
  --success: #22c55e;
  --warning: #f59e0b;
  --danger: #dc2626;
  --text: #1f2937;
  --muted: #6b7280;
  --bg: #f5f9f6;
  --panel: #ffffff;
  
  /* Layout */
  --radius: 16px;
  --shadow: 0 10px 30px rgba(0, 0, 0, .08);
}
```

### Component Patterns

#### Button Styles
```jsx
<button className="btn primary">Primary</button>
<button className="btn secondary">Secondary</button>
<button className="btn danger">Delete</button>
<button className="btn small">Small Button</button>
```

#### Form Fields
```jsx
<div className="field">
  <label htmlFor="amount">Amount</label>
  <input
    id="amount"
    type="number"
    className={errors.amount ? 'error' : ''}
  />
  {errors.amount && (
    <span className="error-message">{errors.amount}</span>
  )}
</div>
```

#### Panels
```jsx
<section className="panel">
  <h2>Section Title</h2>
  <p>Content goes here</p>
</section>
```

## 🔌 API Integration

### Configuration

API base URL is configured via environment variable:

```bash
# .env
VITE_API_BASE_URL=http://localhost:8000
```

### Using Services

```javascript
import { listTransactions, createTransaction } from './services/transactionService';
import { useAuth } from './context/AuthContext';

function MyComponent() {
  const { getToken } = useAuth();
  
  async function loadData() {
    const token = getToken();
    const params = { type: 'expense', page: 1, limit: 20 };
    const data = await listTransactions(params, token);
  }
}
```

### API Endpoints

```javascript
// GET /api/transactions - List transactions
await listTransactions(params, token);

// POST /api/transactions - Create transaction
await createTransaction(data, token);

// PUT /api/transactions/:id - Update transaction
await updateTransaction(id, data, token);

// DELETE /api/transactions/:id - Delete transaction
await deleteTransaction(id, token);
```

## 🎯 Features

### Implemented

#### Authentication
- User registration with validation
- Login with JWT tokens
- Token storage in localStorage
- Protected routes
- Logout functionality

#### Expense Management (Story 4.3)
- ✅ Add/Edit expense form with validation
- ✅ Paginated expense list (20/50/100 per page)
- ✅ Sortable columns (date, amount)
- ✅ Advanced filters (category, date range, amount, search)
- ✅ Filter state persists in URL
- ✅ Edit via modal
- ✅ Delete with confirmation
- ✅ Inline category creation
- ✅ Toast notifications
- ✅ Mobile responsive

#### UI Components
- Toast notifications (success/error/warning/info)
- Modal dialogs with keyboard support
- Loading spinners
- Form validation with inline errors
- Responsive navigation

### Validation Rules

#### Expense Form
- **Amount**: Required, must be > 0
- **Category**: Required
- **Date**: Required, cannot be in future
- **Description**: Optional, max 200 characters

## 🧪 Testing

### Unit Tests

Tests are written with Vitest and cover utility functions:

```bash
# Run all tests
npm test

# Run specific test file
npm test -- date.test.js

# Run with coverage
npm run test:coverage
```

### Test Files
- `tests/date.test.js` - Date formatting and conversion
- `tests/currency.test.js` - Currency conversion and formatting
- `tests/api.test.js` - API utility functions

### Writing Tests

```javascript
import { describe, it, expect } from 'vitest';
import { formatCurrency } from '../src/utils/currency';

describe('Currency Utils', () => {
  it('should format cents as currency', () => {
    expect(formatCurrency(1299)).toBe('$12.99');
  });
});
```

## 📦 Components

### ExpenseForm

Form component for adding/editing expenses.

**Props:**
- `transaction` (object, optional) - Existing transaction for editing
- `onSuccess` (function, optional) - Callback after successful save
- `onCancel` (function, optional) - Callback for cancel button

**Features:**
- Client-side validation
- Inline category creation
- Date defaults to today
- Currency input with decimal support
- Loading states

### ExpenseList

Paginated table with filtering and sorting.

**Features:**
- URL-based filter state
- Sort by date or amount
- Filter by category, date range, amount range
- Search by description
- Edit via modal
- Delete with confirmation
- Responsive table design

### Modal

Reusable modal dialog component.

**Props:**
- `isOpen` (boolean) - Control visibility
- `onClose` (function) - Close handler
- `title` (string) - Modal title
- `size` (string) - 'small', 'medium', 'large'
- `children` - Modal content

**Features:**
- Escape key to close
- Click outside to close
- Prevents body scroll when open
- Smooth animations

### Toast Notifications

Global notification system via context.

**Usage:**
```javascript
import { useToast } from './context/ToastContext';

function MyComponent() {
  const toast = useToast();
  
  toast.success('Operation successful!');
  toast.error('Something went wrong');
  toast.warning('Please be careful');
  toast.info('For your information');
}
```

**Features:**
- Auto-dismiss after 5 seconds
- Click to dismiss
- Multiple toasts stack
- Different types (success, error, warning, info)

## 🔐 Authentication

### Auth Context

Provides authentication state and functions:

```javascript
import { useAuth } from './context/AuthContext';

function MyComponent() {
  const {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
    register,
    getToken
  } = useAuth();
}
```

### Protected Routes

```javascript
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>
```

## 🎨 Styling Guidelines

### CSS Organization
- Use CSS variables for colors and spacing
- Keep component styles in separate files
- Mobile-first responsive design
- Use semantic class names

### Responsive Breakpoints
```css
/* Mobile: default */

/* Tablet: 768px */
@media (max-width: 768px) { }

/* Mobile: 600px */
@media (max-width: 600px) { }
```

### Best Practices
- Use flexbox/grid for layouts
- Keep specificity low
- Avoid !important
- Use CSS variables for theming
- Test on multiple screen sizes

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

Output will be in `dist/` directory.

### Environment Variables

For production, set:
```bash
VITE_API_BASE_URL=https://api.yoursite.com
```

### Serving

```bash
# Preview production build locally
npm run preview

# Or use a static file server
npx serve dist
```

## 🐛 Common Issues

### API calls failing
- Check VITE_API_BASE_URL in .env
- Verify backend is running
- Check browser console for errors
- Ensure you're logged in (JWT required)

### Styles not loading
- Verify imports in main.jsx
- Check file paths
- Clear browser cache
- Restart dev server

### Tests failing
- Run `npm install` to ensure dependencies are current
- Check test file paths
- Verify imports in test files
- Clear test cache: `npm test -- --clearCache`

## 📚 Resources

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [React Router Documentation](https://reactrouter.com/)
- [Vitest Documentation](https://vitest.dev/)

## 🤝 Contributing

1. Follow existing code style
2. Write tests for new features
3. Update documentation
4. Test on multiple browsers
5. Ensure mobile responsiveness

---

**Questions?** Check the main [project README](../README.md) or create an issue.
