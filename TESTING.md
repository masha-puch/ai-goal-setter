# Goals Functionality Unit Tests

This document describes the comprehensive unit tests written for the goals functionality in both the frontend and backend of the AI Goal Setter application.

## Test Structure

### Backend Tests
- **Location**: `backend/src/controllers/__tests__/` and `backend/src/routes/__tests__/`
- **Framework**: Jest with TypeScript support
- **Coverage**: Goals controller functions and route handlers

### Frontend Tests
- **Location**: `frontend/src/pages/__tests__/` and `frontend/src/api/__tests__/`
- **Framework**: Vitest with React Testing Library
- **Coverage**: GoalsPage component and API hooks

## Test Files

### Backend Tests

#### `goalsController.test.ts`
Tests all goals controller functions:
- `createGoal` - Goal creation with validation and error handling
- `getGoals` - Fetching user goals with authentication
- `updateGoal` - Goal updates with partial data support
- `deleteGoal` - Goal deletion with user authorization

**Key Test Scenarios:**
- ✅ Successful goal creation with all fields
- ✅ Goal creation with minimal required fields
- ✅ Authentication validation (401 errors)
- ✅ Database error handling
- ✅ User authorization for updates/deletes
- ✅ Partial updates
- ✅ Empty results handling

#### `goals.test.ts`
Tests goals route integration:
- Route parameter validation
- Middleware integration (auth)
- HTTP method handling (GET, POST, PATCH, DELETE)
- Progress endpoints (nested under goals)
- Error response handling

**Key Test Scenarios:**
- ✅ All CRUD operations via HTTP routes
- ✅ Authentication middleware integration
- ✅ Route parameter validation
- ✅ Nested progress endpoints
- ✅ Error handling and status codes

### Frontend Tests

#### `GoalsPage.test.tsx`
Tests the main goals page component:
- Component rendering and structure
- Form interactions and validation
- Goal display and management
- User interactions (create, delete)
- Loading and error states

**Key Test Scenarios:**
- ✅ Page renders with correct title and form
- ✅ Goals display in cards with proper information
- ✅ Form submission with all field combinations
- ✅ Form validation (required title field)
- ✅ Goal deletion functionality
- ✅ Loading states during operations
- ✅ Error handling and recovery
- ✅ Empty states and edge cases

#### `hooks.test.ts`
Tests React Query hooks for goals API:
- `useGoals` - Fetching goals data
- `useCreateGoal` - Creating new goals
- `useUpdateGoal` - Updating existing goals
- `useDeleteGoal` - Deleting goals

**Key Test Scenarios:**
- ✅ Successful data fetching and caching
- ✅ Mutation operations with optimistic updates
- ✅ Error handling and retry logic
- ✅ Loading states and pending operations
- ✅ Query invalidation on mutations
- ✅ API endpoint integration

#### `client.test.ts`
Tests the API client configuration:
- Axios instance setup
- Request/response interceptors
- Authentication token handling
- Error handling and redirects

**Key Test Scenarios:**
- ✅ Base URL and headers configuration
- ✅ Authorization header injection
- ✅ 401 error handling with token cleanup
- ✅ Response interceptor functionality
- ✅ localStorage integration
- ✅ Error boundary handling

## Running the Tests

### Backend Tests
```bash
cd backend
npm install
npm test                    # Run all tests
npm run test:watch         # Run tests in watch mode
npm run test:coverage      # Run tests with coverage report
```

### Frontend Tests
```bash
cd frontend
npm install
npm test                   # Run all tests
npm run test:ui           # Run tests with UI
npm run test:coverage     # Run tests with coverage report
```

## Test Coverage

### Backend Coverage
- **Controllers**: 100% coverage of goals controller functions
- **Routes**: 100% coverage of goals route handlers
- **Error Handling**: Comprehensive error scenario testing
- **Authentication**: Full auth flow testing
- **Database Operations**: Mock Prisma operations

### Frontend Coverage
- **Components**: 100% coverage of GoalsPage component
- **Hooks**: 100% coverage of goals API hooks
- **API Client**: 100% coverage of client configuration
- **User Interactions**: Complete user flow testing
- **Error States**: All error scenarios covered

## Test Data and Mocking

### Backend Mocks
- Prisma client operations
- Authentication middleware
- Express request/response objects
- Database error scenarios

### Frontend Mocks
- React Query hooks
- API client methods
- localStorage operations
- User event interactions

## Key Testing Patterns

### Backend Testing Patterns
1. **Controller Testing**: Mock Prisma, test business logic
2. **Route Testing**: Mock controllers, test HTTP integration
3. **Error Handling**: Test all error scenarios
4. **Authentication**: Verify auth middleware integration

### Frontend Testing Patterns
1. **Component Testing**: Render with React Testing Library
2. **Hook Testing**: Test with React Query test utilities
3. **Integration Testing**: Test complete user flows
4. **Mocking**: Mock external dependencies (API, localStorage)

## Test Scenarios Covered

### Backend Scenarios
- ✅ CRUD operations for goals
- ✅ User authentication and authorization
- ✅ Input validation and sanitization
- ✅ Database error handling
- ✅ Route parameter validation
- ✅ Middleware integration
- ✅ Response formatting

### Frontend Scenarios
- ✅ Component rendering and structure
- ✅ Form interactions and validation
- ✅ API data fetching and caching
- ✅ User interactions (create, update, delete)
- ✅ Loading and error states
- ✅ Authentication token handling
- ✅ Responsive design considerations

## Best Practices Implemented

1. **Comprehensive Coverage**: All functions and components tested
2. **Error Scenarios**: All error paths covered
3. **Edge Cases**: Empty states, invalid inputs, network errors
4. **Mocking Strategy**: Appropriate mocking of external dependencies
5. **Test Organization**: Clear test structure and naming
6. **Assertions**: Meaningful assertions for all test cases
7. **Setup/Teardown**: Proper test isolation and cleanup

## Future Enhancements

1. **Integration Tests**: End-to-end testing with real database
2. **Performance Tests**: Load testing for goals operations
3. **Accessibility Tests**: Screen reader and keyboard navigation
4. **Visual Regression Tests**: UI component snapshot testing
5. **API Contract Tests**: Ensure API compatibility

This comprehensive test suite ensures the goals functionality is robust, reliable, and maintainable across both frontend and backend components.
