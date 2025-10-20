# Copilot Instructions for DodamReact

This document provides essential context for AI coding agents working in the DodamReact codebase.

## Project Architecture

This is a React-based e-commerce and plan management platform with the following key areas:

### Core Components
- `src/admin/` - Admin dashboard and management interfaces
- `src/Product/` - Product catalog and details
- `src/Plan/` - Subscription plan management
- `src/logistics/` - Delivery and logistics management
- `src/member/` - User authentication and profile management
- `src/pages/CommunityPage/` - Community features including notices, events and inquiries

### Data Flow
1. API calls use axios through `src/utils/api.js` which sets up:
   - Base URL: `http://localhost:8080` (configurable via env)
   - Default headers with JSON content type
   - Credentials included for session management
   - Response interceptors for error normalization

2. Context providers in `src/contexts/`:
   - `AuthContext` - User authentication state
   - `CartContext` - Shopping cart management
   - `ThemeContext` - Theme customization
   - `AdminContext` - Admin panel state management

### Routing Structure
- Main app routes in `src/App.js`
- Admin routes in `src/admin/Admin.js` with lazy-loaded components
- Nested routing for features like products, plans, and community pages

## Key Development Patterns

### State Management
- Use React Context for global state (auth, cart, theme)
- Component-local state with useState for UI state
- Async data fetching in useEffect with loading/error states

### API Integration
```js
import { api } from "../utils/api";

// Example API call pattern
const fetchData = async () => {
  try {
    const { data } = await api.get("/endpoint");
    setData(data);
  } catch (e) {
    setError("Error message");
  } finally {
    setLoading(false);
  }
};
```

### Component Structure
- Page components handle routing and data fetching
- Feature components focus on UI and user interaction
- Shared components in `src/components/`
- Admin components follow a pattern of list/detail/form views

### Error Handling
- API errors are normalized through interceptors
- Components should handle loading and error states
- Use try/catch blocks for async operations

## Integration Points

### Backend Integration
- REST API endpoints at `http://localhost:8080`
- Session-based authentication (JSESSIONID cookie)
- File uploads handled through multipart/form-data
- Consistent error response format through API interceptors

### Third-party Services
- OAuth authentication support
- Image hosting integration
- Payment processing (implementation details in payment services)

## Development Workflow

### Local Development
1. Start development server: `npm start`
2. Backend should be running on port 8080
3. Environment variables through `.env` for API configuration

### Testing
- Use Jest for unit tests
- Component testing with React Testing Library
- Integration tests for critical user flows

## Common Patterns to Follow

1. Route Protection:
```jsx
// Check auth state in protected routes
if (loading) return <div>Loading...</div>;
if (!member) return <div>Login required</div>;
```

2. Data Fetching:
```jsx
// Use loading and error states
const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
```

3. Form Handling:
```jsx
// Controlled form components with validation
const [formData, setFormData] = useState(initialState);
const handleInputChange = (e) => {
  setFormData(prev => ({...prev, [e.target.name]: e.target.value}));
};
```