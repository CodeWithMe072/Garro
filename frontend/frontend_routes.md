# Garro Frontend Navigation Map 🗺️

Here is a clickable navigation map for your Garro React Frontend. When your Vite local development server is running (default port `5173`), you can click these links to jump directly to any page.

> 💡 **Note:** If your Vite dev server starts on a different port, simply replace `5173` in the browser URL bar with your running port.

---

### 1. Guest & Onboarding Pages (No Login Required)

| Local Link | Component / Page | Description / Working |
| :--- | :--- | :--- |
| [http://localhost:5173/](http://localhost:5173/) | `Landing.jsx` | Landing page for guest users showcasing the platform benefits. |
| [http://localhost:5173/login](http://localhost:5173/login) | `Login.jsx` | Authenticates Customers, Admins, and Staff members against the backend database. |
| [http://localhost:5173/signup](http://localhost:5173/signup) | `Signup.jsx` | Registration form for new Customer accounts. |
| [http://localhost:5173/verify-otp](http://localhost:5173/verify-otp) | `VerifyOtp.jsx` | Customer phone validation stage using a mock OTP code (`123456`). |
| [http://localhost:5173/admin-signup](http://localhost:5173/admin-signup) | `AdminSignup.jsx` | Administrator sign up (requires authorization key: `GARRO_ADMIN_2026`). |
| [http://localhost:5173/staff-join](http://localhost:5173/staff-join) | `StaffJoin.jsx` | Mechanic/Helper registration page (requires invite code: `GARRO_STAFF_2026`). |

---

### 2. Customer Platform Pages (Requires Customer Login)

| Local Link | Component / Page | Description / Working |
| :--- | :--- | :--- |
| [http://localhost:5173/home](http://localhost:5173/home) | `Home.jsx` | Customer home screen featuring quick actions, search, and core services. |
| [http://localhost:5173/search](http://localhost:5173/search) | `GarageList.jsx` | Browse and filter active workshops by city and service type from the backend. |
| [http://localhost:5173/my-bookings](http://localhost:5173/my-bookings) | `MyBookings.jsx` | Lists all booking requests placed by the customer, loaded dynamically. |
| [http://localhost:5173/insurance](http://localhost:5173/insurance) | `Insurance.jsx` | Portal to browse available car insurance packages. |
| [http://localhost:5173/roadside](http://localhost:5173/roadside) | `Roadside.jsx` | Roadside emergency portal (towing, battery assistance, puncture repairs). |
| [http://localhost:5173/emergency-pickup](http://localhost:5173/emergency-pickup) | `EmergencyPickup.jsx` | Direct tow booking form for stranded drivers. |
| [http://localhost:5173/end-of-life](http://localhost:5173/end-of-life) | `EndOfLife.jsx` | Scrapping and valuation form for junk/write-off cars. |
| [http://localhost:5173/services](http://localhost:5173/services) | `Services.jsx` | Index of all service categories supported by the platform. |

#### Dynamic Customer Pages (Depend on IDs or Slugs)
* **Garage Detail:** `http://localhost:5173/garage/:id`
  * *Example (Seeded Al Quoz Workshop):* [http://localhost:5173/garage/667c1b50428fc28104278456](http://localhost:5173/garage/667c1b50428fc28104278456)
  * *Purpose:* Displays reviews, phone, areas, and specific service rates for a garage.
* **Garage Service Booking Form:** `http://localhost:5173/garage/:id/book`
  * *Example (Book Al Quoz Workshop):* [http://localhost:5173/garage/667c1b50428fc28104278456/book](http://localhost:5173/garage/667c1b50428fc28104278456/book)
  * *Purpose:* Select car model, choose services, and submit booking requests to the database.
* **Service Details:** `http://localhost:5173/service/:slug`
  * *Example (Maintenance Details):* [http://localhost:5173/service/maintenance](http://localhost:5173/service/maintenance)
  * *Purpose:* Landing page explaining specific service details (e.g. brakes, AC).
* **Insurance Quote Request:** `http://localhost:5173/insurance/:slug/quote`
  * *Example (Full Cover Request):* [http://localhost:5173/insurance/comprehensive/quote](http://localhost:5173/insurance/comprehensive/quote)
  * *Purpose:* Custom insurance pricing quotation calculator.

---

### 3. Back-Office & Dashboards (Requires Admin/Staff Roles)

| Local Link | Component / Page | Description / Working |
| :--- | :--- | :--- |
| [http://localhost:5173/admin](http://localhost:5173/admin) | `AdminDashboard.jsx` | Main Admin Panel showing real-time booking counters, recent system orders, and the toggle for the **Auto-Assign Agent**. |
| [http://localhost:5173/admin/staff](http://localhost:5173/admin/staff) | `StaffDashboard.jsx` | Portal for mechanics/helpers showing the list of bookings assigned to them. |
| [http://localhost:5173/admin/manage-staff](http://localhost:5173/admin/manage-staff) | `StaffManagement.jsx` | Administrative list to monitor and review registered staff members. |
| [http://localhost:5173/admin/create-staff](http://localhost:5173/admin/create-staff) | `CreateStaff.jsx` | Form for Managers to add and authorize new service personnel. |

---

### 4. Static General Pages

| Local Link | Component / Page | Description / Working |
| :--- | :--- | :--- |
| [http://localhost:5173/about](http://localhost:5173/about) | `About.jsx` | General corporate background. |
| [http://localhost:5173/contact](http://localhost:5173/contact) | `Contact.jsx` | Customer support ticket submission. |
| [http://localhost:5173/blog](http://localhost:5173/blog) | `Blog.jsx` | General blog listings page. |
