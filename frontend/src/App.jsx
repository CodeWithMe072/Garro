import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { LanguageProvider } from './context/LanguageContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import SupportChatWidget from './components/SupportChatWidget';

// Lazy load pages
const Landing = React.lazy(() => import('./pages/Landing'));
const Home = React.lazy(() => import('./pages/Home'));
const Login = React.lazy(() => import('./pages/Login'));
const Signup = React.lazy(() => import('./pages/Signup'));
const VerifyOtp = React.lazy(() => import('./pages/VerifyOtp'));
const GetQuote = React.lazy(() => import('./pages/GetQuote'));
const RequestSubmitted = React.lazy(() => import('./pages/RequestSubmitted'));
const MyRequests = React.lazy(() => import('./pages/MyRequests'));
const TrackRequest = React.lazy(() => import('./pages/TrackRequest'));
const Insurance = React.lazy(() => import('./pages/Insurance'));
const InsuranceQuote = React.lazy(() => import('./pages/InsuranceQuote'));
const Roadside = React.lazy(() => import('./pages/Roadside'));
const EndOfLife = React.lazy(() => import('./pages/EndOfLife'));
const EmergencyPickup = React.lazy(() => import('./pages/EmergencyPickup'));
const Search = React.lazy(() => import('./pages/GarageList'));
const GarageDetail = React.lazy(() => import('./pages/GarageDetail'));
const BookGarage = React.lazy(() => import('./pages/BookGarage'));
const ServiceDetail = React.lazy(() => import('./pages/ServiceDetail'));
const Services = React.lazy(() => import('./pages/Services'));
const MyBookings = React.lazy(() => import('./pages/MyBookings'));
const BookingConfirm = React.lazy(() => import('./pages/BookingConfirm'));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));
const StaffDashboard = React.lazy(() => import('./pages/StaffDashboard'));
const StaffManagement = React.lazy(() => import('./pages/StaffManagement'));
const CreateStaff = React.lazy(() => import('./pages/CreateStaff'));
const GarageManagement = React.lazy(() => import('./pages/GarageManagement'));
const CatalogManagement = React.lazy(() => import('./pages/CatalogManagement'));
const Profile = React.lazy(() => import('./pages/Profile'));
const About = React.lazy(() => import('./pages/About'));
const Contact = React.lazy(() => import('./pages/Contact'));
const Blog = React.lazy(() => import('./pages/Blog'));
const AdminSignup = React.lazy(() => import('./pages/AdminSignup'));
const StaffJoin = React.lazy(() => import('./pages/StaffJoin'));
const PaymentPage = React.lazy(() => import('./pages/PaymentPage'));
const GarageLogin = React.lazy(() => import('./pages/GarageLogin'));
const GarageDashboard = React.lazy(() => import('./pages/GarageDashboard'));
const GarageJobs = React.lazy(() => import('./pages/GarageJobs'));
const GarageEarnings = React.lazy(() => import('./pages/GarageEarnings'));
const MyVehicles = React.lazy(() => import('./pages/MyVehicles'));
const MyInvoices = React.lazy(() => import('./pages/MyInvoices'));
const MyQuotes = React.lazy(() => import('./pages/MyQuotes'));
const BookingDetails = React.lazy(() => import('./pages/BookingDetails'));
const AdminQuoteBuilder = React.lazy(() => import('./pages/AdminQuoteBuilder'));
const AdminCustomers = React.lazy(() => import('./pages/AdminCustomers'));
const AdminComplaints = React.lazy(() => import('./pages/AdminComplaints'));
const AdminSettings = React.lazy(() => import('./pages/AdminSettings'));
const AdminReports = React.lazy(() => import('./pages/AdminReports'));
const AdminSupportChat = React.lazy(() => import('./pages/AdminSupportChat'));
const CustomerDashboard = React.lazy(() => import('./pages/CustomerDashboard'));

// Wrapper for pages with Navbar and Footer
const PageLayout = ({ children }) => (
  <>
    <Navbar />
    <main>{children}</main>
    <Footer />
  </>
);

// Role-based redirect for "/dashboard" links/notifications
const DashboardRedirect = () => {
  const { user } = useAuth();
  if (user?.role === 'manager' || user?.role === 'superadmin' || user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  } else if (user?.role === 'staff') {
    return <Navigate to="/admin/staff" replace />;
  } else if (user?.role === 'customer') {
    return <Navigate to="/customer/dashboard" replace />;
  }
  return <Navigate to="/home" replace />;
};

const CustomerSupportChatWrapper = () => {
  const { isAuthenticated, user } = useAuth();
  if (isAuthenticated && user?.role === 'customer') {
    return <SupportChatWidget />;
  }
  return null;
};

const App = () => {
  return (
    <LanguageProvider>
      <NotificationProvider>
        <AuthProvider>
        <Router>
          <CustomerSupportChatWrapper />
          <Suspense fallback={<div className="container mt-5"><h4>Loading...</h4></div>}>
            <Routes>
            {/* Standalone Route without Navbar/Footer */}
            <Route path="/" element={<Landing />} />

            {/* Public Routes without Layout */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/verify-otp" element={<VerifyOtp />} />
            <Route path="/admin-signup" element={<AdminSignup />} />
            <Route path="/staff-join" element={<StaffJoin />} />
            <Route path="/garage-login" element={<GarageLogin />} />

            {/* Authenticated Routes with Layout */}
            <Route path="/home" element={<ProtectedRoute><PageLayout><Home /></PageLayout></ProtectedRoute>} />
            <Route path="/customer/dashboard" element={<ProtectedRoute><PageLayout><CustomerDashboard /></PageLayout></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardRedirect /></ProtectedRoute>} />
            <Route path="/get-quote" element={<ProtectedRoute><PageLayout><GetQuote /></PageLayout></ProtectedRoute>} />
            <Route path="/request-submitted/:id" element={<ProtectedRoute><PageLayout><RequestSubmitted /></PageLayout></ProtectedRoute>} />
            <Route path="/my-requests" element={<ProtectedRoute><PageLayout><MyRequests /></PageLayout></ProtectedRoute>} />
            <Route path="/track/:id" element={<ProtectedRoute><PageLayout><TrackRequest /></PageLayout></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><PageLayout><Profile /></PageLayout></ProtectedRoute>} />
            <Route path="/my-vehicles" element={<ProtectedRoute><PageLayout><MyVehicles /></PageLayout></ProtectedRoute>} />
            <Route path="/my-invoices" element={<ProtectedRoute><PageLayout><MyInvoices /></PageLayout></ProtectedRoute>} />
            <Route path="/my-quotes" element={<ProtectedRoute><PageLayout><MyQuotes /></PageLayout></ProtectedRoute>} />
            <Route path="/booking/:id" element={<ProtectedRoute><PageLayout><BookingDetails /></PageLayout></ProtectedRoute>} />
            
            <Route path="/insurance" element={<ProtectedRoute><PageLayout><Insurance /></PageLayout></ProtectedRoute>} />
            <Route path="/insurance/:slug/quote" element={<ProtectedRoute><PageLayout><InsuranceQuote /></PageLayout></ProtectedRoute>} />
            <Route path="/roadside" element={<ProtectedRoute><PageLayout><Roadside /></PageLayout></ProtectedRoute>} />
            <Route path="/emergency-pickup" element={<ProtectedRoute><PageLayout><EmergencyPickup /></PageLayout></ProtectedRoute>} />
            <Route path="/end-of-life" element={<ProtectedRoute><PageLayout><EndOfLife /></PageLayout></ProtectedRoute>} />
            
            <Route path="/search" element={<ProtectedRoute><PageLayout><Search /></PageLayout></ProtectedRoute>} />
            <Route path="/garage/:id" element={<ProtectedRoute><PageLayout><GarageDetail /></PageLayout></ProtectedRoute>} />
            <Route path="/garage/:id/book" element={<ProtectedRoute><PageLayout><BookGarage /></PageLayout></ProtectedRoute>} />
            <Route path="/service/:slug" element={<ProtectedRoute><PageLayout><ServiceDetail /></PageLayout></ProtectedRoute>} />
            <Route path="/services" element={<ProtectedRoute><PageLayout><Services /></PageLayout></ProtectedRoute>} />
            
            <Route path="/my-bookings" element={<ProtectedRoute><PageLayout><MyBookings /></PageLayout></ProtectedRoute>} />
            <Route path="/booking/confirm/:id" element={<ProtectedRoute><PageLayout><BookingConfirm /></PageLayout></ProtectedRoute>} />
            <Route path="/payment" element={<ProtectedRoute><PageLayout><PaymentPage /></PageLayout></ProtectedRoute>} />
            
            <Route path="/about" element={<PageLayout><About /></PageLayout>} />
            <Route path="/contact" element={<PageLayout><Contact /></PageLayout>} />
            <Route path="/blog" element={<PageLayout><Blog /></PageLayout>} />

            {/* Dashboard Routes with Layout */}
            <Route path="/admin" element={
              <ProtectedRoute roles={['manager', 'superadmin']}>
                <PageLayout><AdminDashboard /></PageLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/staff" element={
              <ProtectedRoute roles={['staff', 'manager', 'superadmin']}>
                <PageLayout><StaffDashboard /></PageLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/manage-staff" element={
              <ProtectedRoute roles={['manager', 'superadmin']}>
                <PageLayout><StaffManagement /></PageLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/manage-garages" element={
              <ProtectedRoute roles={['manager', 'superadmin']}>
                <PageLayout><GarageManagement /></PageLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/catalog" element={
              <ProtectedRoute roles={['manager', 'superadmin']}>
                <PageLayout><CatalogManagement /></PageLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/customers" element={
              <ProtectedRoute roles={['manager', 'superadmin', 'admin']}>
                <PageLayout><AdminCustomers /></PageLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/complaints" element={
              <ProtectedRoute roles={['manager', 'superadmin', 'admin']}>
                <PageLayout><AdminComplaints /></PageLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/support" element={
              <ProtectedRoute roles={['manager', 'superadmin', 'admin', 'staff']}>
                <PageLayout><AdminSupportChat /></PageLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/settings" element={
              <ProtectedRoute roles={['manager', 'superadmin', 'admin']}>
                <PageLayout><AdminSettings /></PageLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/reports" element={
              <ProtectedRoute roles={['manager', 'superadmin', 'admin']}>
                <PageLayout><AdminReports /></PageLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/quote-builder" element={
              <ProtectedRoute roles={['manager', 'superadmin', 'admin']}>
                <PageLayout><AdminQuoteBuilder /></PageLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/create-staff" element={
              <ProtectedRoute roles={['manager', 'superadmin']}>
                <PageLayout><CreateStaff /></PageLayout>
              </ProtectedRoute>
            } />
            <Route path="/garage-portal" element={
              <ProtectedRoute roles={['garage']}>
                <GarageDashboard />
              </ProtectedRoute>
            } />
            <Route path="/garage-portal/jobs" element={
              <ProtectedRoute roles={['garage']}>
                <GarageJobs />
              </ProtectedRoute>
            } />
            <Route path="/garage-portal/earnings" element={
              <ProtectedRoute roles={['garage']}>
                <GarageEarnings />
              </ProtectedRoute>
            } />
          </Routes>
        </Suspense>
        </Router>
      </AuthProvider>
    </NotificationProvider>
    </LanguageProvider>
  );
};

export default App;
