import { Router, Route } from 'preact-router'
import { useAuth } from '../../contexts/AuthContext'
import { ProtectedRoute, PublicRoute } from './ProtectedRoute'

// Import placeholder components (will be created in later tasks)
import { HomePage } from '../pages/HomePage'
import { LoginPage } from '../pages/LoginPage'
import { UnauthorizedPage } from '../pages/UnauthorizedPage'
import { VerificationPendingPage } from '../pages/VerificationPendingPage'

// Patient components (placeholders)
import { PatientDashboard } from '../pages/patient/PatientDashboard'
import { PatientRegister } from '../pages/patient/PatientRegister'
import { PatientLogin } from '../pages/patient/PatientLogin'
import { MyAppointments } from '../pages/patient/MyAppointments'
import { SearchDoctor } from '../pages/patient/SearchDoctor'
import { DoctorProfile } from '../pages/patient/DoctorProfile'
import DoctorSelfProfile from '../pages/doctor/DoctorProfile'
import { Hospitals } from '../pages/patient/Hospitals'
import { Community } from '../pages/patient/Community'
import GroupPage from '../pages/patient/GroupPage'
import Payment from '../pages/patient/Payment'

// Doctor components (placeholders)
import { DoctorDashboard } from '../pages/doctor/DoctorDashboard'
import { DoctorRegister } from '../pages/doctor/DoctorRegister'
import ConsultationList from '../pages/doctor/ConsultationList'
import { ConsultationRoom } from '../pages/doctor/ConsultationRoom'
import ConsultationSummary from '../pages/doctor/ConsultationSummary'
import { Schedule } from '../pages/doctor/Schedule'
import { Prescriptions } from '../pages/doctor/Prescriptions'
import { OfflineEMR } from '../pages/doctor/OfflineEMR'

// Hospital components (placeholders)
import { HospitalDashboard } from '../pages/hospital/HospitalDashboard'
import { HospitalRegister } from '../pages/hospital/HospitalRegister'
import { ManageDoctors } from '../pages/hospital/ManageDoctors'
import FormBuilder from '../pages/hospital/FormBuilder'

// Admin components
import { AdminDashboard } from '../pages/admin/AdminDashboard'
import { AdminLogin } from '../pages/admin/AdminLogin'
import { VerifyEntities } from '../pages/admin/VerifyEntities'
import { VerificationQueue } from '../pages/admin/VerificationQueue'
import { Logs } from '../pages/admin/Logs'

export function AppRouter() {
  const { USER_ROLES } = useAuth()

  return (
    <Router>
      {/* Public routes - accessible when not authenticated */}
      <Route path="/" component={() => (
        <PublicRoute>
          <HomePage />
        </PublicRoute>
      )} />
      
      <Route path="/login" component={() => (
        <PublicRoute>
          <LoginPage />
        </PublicRoute>
      )} />

      <Route path="/login/patient" component={() => (
        <PublicRoute>
          <PatientLogin />
        </PublicRoute>
      )} />

      <Route path="/login/admin" component={() => (
        <PublicRoute>
          <AdminLogin />
        </PublicRoute>
      )} />

      {/* Registration routes - public but redirect if authenticated */}
      <Route path="/register/patient" component={() => (
        <PublicRoute>
          <PatientRegister />
        </PublicRoute>
      )} />
      
      <Route path="/register/doctor" component={() => (
        <PublicRoute>
          <DoctorRegister />
        </PublicRoute>
      )} />
      
      <Route path="/register/hospital" component={() => (
        <PublicRoute>
          <HospitalRegister />
        </PublicRoute>
      )} />

      {/* Patient routes - require patient role */}
      <Route path="/patient/dashboard" component={() => (
        <ProtectedRoute requiredRole={USER_ROLES.PATIENT}>
          <PatientDashboard />
        </ProtectedRoute>
      )} />

      <Route path="/patient/hospitals" component={() => (
        <ProtectedRoute requiredRole={USER_ROLES.PATIENT}>
          <Hospitals />
        </ProtectedRoute>
      )} />

      <Route path="/patient/community/:id" component={({ id }) => (
        <ProtectedRoute requiredRole={USER_ROLES.PATIENT}>
          <GroupPage id={id} />
        </ProtectedRoute>
      )} />

      <Route path="/patient/community" component={() => (
        <ProtectedRoute requiredRole={USER_ROLES.PATIENT}>
          <Community />
        </ProtectedRoute>
      )} />

      <Route path="/patient/search-doctors" component={() => (
        <ProtectedRoute requiredRole={USER_ROLES.PATIENT}>
          <SearchDoctor />
        </ProtectedRoute>
      )} />

      <Route path="/patient/doctor/:id" component={({ id }) => (
        <ProtectedRoute requiredRole={USER_ROLES.PATIENT}>
          <DoctorProfile id={id} />
        </ProtectedRoute>
      )} />

      <Route path="/doctor/profile/:id" component={({ id }) => {
        console.log('🔥 Route matched! id:', id)
        return <DoctorSelfProfile id={id} />
      }} />
      
      {/* Fallback for /doctor/profile without ID */}
      <Route path="/doctor/profile" component={() => {
        console.log('🔥 Route matched! (no id)')
        return <DoctorSelfProfile />
      }} />

      <Route path="/patient/appointments" component={() => (
        <ProtectedRoute requiredRole={USER_ROLES.PATIENT}>
          <MyAppointments />
        </ProtectedRoute>
      )} />

      <Route path="/patient/payment" component={() => (
        <ProtectedRoute requiredRole={USER_ROLES.PATIENT}>
          <Payment />
        </ProtectedRoute>
      )} />

      {/* Doctor routes - require doctor role and verification */}
      <Route path="/doctor/dashboard" component={() => (
        <ProtectedRoute requiredRole={USER_ROLES.DOCTOR} requireVerification={true}>
          <DoctorDashboard />
        </ProtectedRoute>
      )} />

      <Route path="/doctor/consultations" component={() => (
        <ProtectedRoute requiredRole={USER_ROLES.DOCTOR} requireVerification={true}>
          <ConsultationList />
        </ProtectedRoute>
      )} />

      <Route path="/doctor/consultationRoom" component={() => (
        <ProtectedRoute requiredRole={USER_ROLES.DOCTOR} requireVerification={true}>
          <ConsultationRoom />
        </ProtectedRoute>
      )} />

      <Route path="/doctor/consultation-summary/:id" component={({ id }) => (
        <ProtectedRoute requiredRole={USER_ROLES.DOCTOR} requireVerification={true}>
          <ConsultationSummary id={id} />
        </ProtectedRoute>
      )} />

      <Route path="/doctor/schedule" component={() => (
        <ProtectedRoute requiredRole={USER_ROLES.DOCTOR} requireVerification={true}>
          <Schedule />
        </ProtectedRoute>
      )} />

      <Route path="/doctor/prescriptions" component={() => (
        <ProtectedRoute requiredRole={USER_ROLES.DOCTOR} requireVerification={true}>
          <Prescriptions />
        </ProtectedRoute>
      )} />

      {/* EMR routes - more specific route first */}
      <Route path="/doctor/emr/:patientId" component={({ patientId }) => (
        <OfflineEMR patientId={patientId} />
      )} />

      <Route path="/doctor/emr" component={() => (
        <OfflineEMR />
      )} />

      {/* Hospital routes - require hospital role and verification */}
      <Route path="/hospital/dashboard" component={() => (
        <ProtectedRoute requiredRole={USER_ROLES.HOSPITAL} requireVerification={true}>
          <HospitalDashboard />
        </ProtectedRoute>
      )} />

      <Route path="/hospital/manage-doctors" component={() => (
        <ProtectedRoute requiredRole={USER_ROLES.HOSPITAL} requireVerification={true}>
          <ManageDoctors />
        </ProtectedRoute>
      )} />

      <Route path="/hospital/form-builder" component={() => (
        <ProtectedRoute requiredRole={USER_ROLES.HOSPITAL} requireVerification={true}>
          <FormBuilder />
        </ProtectedRoute>
      )} />

      {/* Admin routes - require admin role */}
      <Route path="/admin/dashboard" component={() => (
        <ProtectedRoute requiredRole={USER_ROLES.ADMIN}>
          <AdminDashboard />
        </ProtectedRoute>
      )} />

      <Route path="/admin/verify-entities" component={() => (
        <ProtectedRoute requiredRole={USER_ROLES.ADMIN}>
          <VerifyEntities />
        </ProtectedRoute>
      )} />

      <Route path="/admin/verify-hospitals" component={() => (
        <ProtectedRoute requiredRole={USER_ROLES.ADMIN}>
          <VerifyEntities />
        </ProtectedRoute>
      )} />

      <Route path="/admin/verify-doctors" component={() => (
        <ProtectedRoute requiredRole={USER_ROLES.ADMIN}>
          <VerifyEntities />
        </ProtectedRoute>
      )} />

      <Route path="/admin/verification-queue" component={() => (
        <ProtectedRoute requiredRole={USER_ROLES.ADMIN}>
          <VerificationQueue />
        </ProtectedRoute>
      )} />

      <Route path="/admin/logs" component={() => (
        <ProtectedRoute requiredRole={USER_ROLES.ADMIN}>
          <Logs />
        </ProtectedRoute>
      )} />

      {/* Error and status pages */}
      <Route path="/unauthorized" component={UnauthorizedPage} />
      <Route path="/verification-pending" component={VerificationPendingPage} />

      {/* 404 fallback */}
      <Route default component={() => (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
            <p className="text-gray-600 mb-4">Page not found</p>
            <a href="/" className="btn-primary">Go Home</a>
          </div>
        </div>
      )} />
    </Router>
  )
}