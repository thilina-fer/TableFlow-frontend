### 1. Pages Built
- **Login (`/login`)**: Built with React Hook Form + Zod. Integrates with Redux for authentication state. Includes mock layouts and toggleable password visibility. Redirects to `/change-password` if it's the user's first login.
- **Change Password (`/change-password`)**: Ensures first-time users change their password. Includes validation for new password rules and confirmation matching.
- **Super Admin Login (`/superadmin/login`)**: Dedicated secure portal login for the Super Admin, updating the `superAdminSlice` in Redux.
- **Restaurant Registration (`/register`)**: Comprehensive 4-section form (Restaurant Info, Owner Details, Location, Branding) built with Shadcn components, fully responsive.
- **Registration Success (`/register/success`)**: A clean confirmation page displayed after a successful application submission.

### 2. API Functions Created
- **Auth API (`src/api/auth.api.ts`)**: Functions for `loginStaff`, `logoutStaff`, `getMe`, `refreshAccessToken`, and `changePassword`.
- **SuperAdmin API (`src/api/superadmin.api.ts`)**: Functions for `loginSuperAdmin`.
- **Registration API (`src/api/register.api.ts`)**: Functions for `registerRestaurant`.

### 3. How to Test
- **Login flow**:
  1. Navigate to `/login`.
  2. Enter valid credentials (or trigger a mock successful response).
  3. If `isFirstLogin` is returned as true, observe the redirect to `/change-password` and the amber warning banner.
  4. Complete the password change to be redirected to your role-specific dashboard.
- **Super Admin login flow**:
  1. Navigate to `/superadmin/login`.
  2. Log in and verify redirection to the `/superadmin` layout.
- **Registration form validation**:
  1. Navigate to `/register`.
  2. Attempt to submit with empty fields to verify Zod inline errors.
  3. Fill out the form correctly and submit.
- **Registration success page**:
  1. After successful registration, verify the redirect to `/register/success`.
  2. Click "Back to Home" to return to the login screen.
