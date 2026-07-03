import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

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
const About = React.lazy(() => import('./pages/About'));
const Contact = React.lazy(() => import('./pages/Contact'));
const Blog = React.lazy(() => import('./pages/Blog'));
const AdminSignup = React.lazy(() => import('./pages/AdminSignup'));
const StaffJoin = React.lazy(() => import('./pages/StaffJoin'));

// Wrapper for pages with Navbar and Footer
const PageLayout = ({ children }) => (
  <>
    <Navbar />
    <main>{children}</main>
    <Footer />
  </>
);

const App = () => {
  return (
    <NotificationProvider>
      <AuthProvider>
        <Router>
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

            {/* Authenticated Routes with Layout */}
            <Route path="/home" element={<ProtectedRoute><PageLayout><Home /></PageLayout></ProtectedRoute>} />
            <Route path="/get-quote" element={<ProtectedRoute><PageLayout><GetQuote /></PageLayout></ProtectedRoute>} />
            <Route path="/request-submitted/:id" element={<ProtectedRoute><PageLayout><RequestSubmitted /></PageLayout></ProtectedRoute>} />
            <Route path="/my-requests" element={<ProtectedRoute><PageLayout><MyRequests /></PageLayout></ProtectedRoute>} />
            <Route path="/track/:id" element={<ProtectedRoute><PageLayout><TrackRequest /></PageLayout></ProtectedRoute>} />
            
            <Route path="/insurance" element={<ProtectedRoute><PageLayout><Insurance /></PageLayout></ProtectedRoute>} />
            <Route path="/insurance/:slug/quote" element={<ProtectedRoute><PageLayout><InsuranceQuote /></PageLayout></ProtectedRoute>} />
            <Route path="/roadside" element={<ProtectedRoute><PageLayout><Roadside /></PageLayout></ProtectedRoute>} />
            <Route path="/end-of-life" element={<ProtectedRoute><PageLayout><EndOfLife /></PageLayout></ProtectedRoute>} />
            
            <Route path="/search" element={<ProtectedRoute><PageLayout><Search /></PageLayout></ProtectedRoute>} />
            <Route path="/garage/:id" element={<ProtectedRoute><PageLayout><GarageDetail /></PageLayout></ProtectedRoute>} />
            <Route path="/garage/:id/book" element={<ProtectedRoute><PageLayout><BookGarage /></PageLayout></ProtectedRoute>} />
            <Route path="/service/:slug" element={<ProtectedRoute><PageLayout><ServiceDetail /></PageLayout></ProtectedRoute>} />
            <Route path="/services" element={<ProtectedRoute><PageLayout><Services /></PageLayout></ProtectedRoute>} />
            
            <Route path="/my-bookings" element={<ProtectedRoute><PageLayout><MyBookings /></PageLayout></ProtectedRoute>} />
            <Route path="/booking/confirm/:id" element={<ProtectedRoute><PageLayout><BookingConfirm /></PageLayout></ProtectedRoute>} />
            
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
            <Route path="/admin/create-staff" element={
              <ProtectedRoute roles={['manager', 'superadmin']}>
                <PageLayout><CreateStaff /></PageLayout>
              </ProtectedRoute>
            } />
          </Routes>
        </Suspense>
        </Router>
      </AuthProvider>
    </NotificationProvider>
  );
};

export default App;
